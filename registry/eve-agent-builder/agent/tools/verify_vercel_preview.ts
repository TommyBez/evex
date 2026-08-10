import type { SandboxNetworkPolicy, SandboxSession } from 'eve/sandbox'
import { defineTool } from 'eve/tools'
import { always } from 'eve/tools/approval'
import { z } from 'zod'
import {
  type CliCommandResult,
  inAppRoot,
  shellQuote,
  toCliCommandResult,
  toCliModelOutput,
} from '../lib/vercel-brokered-cli'

const BYPASS_SECRET_ENV = 'VERCEL_AUTOMATION_BYPASS_SECRET'
const ROUTE_AUTHORIZATION_ENV = 'EVE_ROUTE_AUTHORIZATION'
const VERIFICATION_ALLOWED_ORIGINS_ENV = 'EVE_VERIFICATION_ALLOWED_ORIGINS'
const BROKERED_BYPASS_PLACEHOLDER = 'brokeredvercelbypass'
const BROKERED_ROUTE_AUTH_PLACEHOLDER = 'brokeredeveauthorization'

const PARSE_SESSION_ID_SCRIPT =
  'let raw = ""; process.stdin.on("data", (chunk) => { raw += chunk; }); process.stdin.on("end", () => { try { const body = JSON.parse(raw); process.stdout.write(typeof body.sessionId === "string" ? body.sessionId : ""); } catch {} });'

const inputSchema = z.object({
  appRoot: z
    .string()
    .min(1)
    .default('.')
    .describe('Workspace-relative directory where verification commands run.'),
  deploymentUrl: z
    .url()
    .describe(
      'HTTPS deployment origin or URL to verify, for example https://preview.vercel.app. Credentialed targets must also appear in EVE_VERIFICATION_ALLOWED_ORIGINS.',
    ),
  message: z
    .string()
    .min(1)
    .max(2000)
    .default('Smoke test this Eve deployment.')
    .describe('Message used to create a smoke-test Eve session.'),
  streamMaxSeconds: z
    .number()
    .int()
    .min(1)
    .max(60)
    .default(15)
    .describe('Maximum seconds to hold the session stream open.'),
})

export default defineTool({
  description:
    "Verify a Vercel deployment's Eve routes: /eve/v1/health, session creation, and the session stream. Requires approval because it sends a smoke-test session. It brokers VERCEL_AUTOMATION_BYPASS_SECRET and EVE_ROUTE_AUTHORIZATION only to an exact HTTPS origin in EVE_VERIFICATION_ALLOWED_ORIGINS, without exposing either secret to the sandbox. Without route authorization, session verification only succeeds when the target explicitly allows unauthenticated traffic.",
  inputSchema,
  approval: always<z.infer<typeof inputSchema>>(),
  async execute(input, ctx) {
    const sandbox = await ctx.getSandbox()
    const bypassSecret = readBypassSecret()
    const routeAuthorization = readRouteAuthorization()
    const useBypass = bypassSecret !== undefined
    const useRouteAuthorization = routeAuthorization !== undefined
    const origin = resolveVerificationOrigin(
      input.deploymentUrl,
      readVerificationAllowedOrigins(),
      useBypass || useRouteAuthorization,
    )

    if (useBypass || useRouteAuthorization) {
      await applyVerificationCredentialBroker(sandbox, origin.hostname, {
        bypassSecret,
        routeAuthorization,
      })
    }

    const command = inAppRoot(
      input.appRoot,
      buildVerificationCommand({
        message: input.message,
        origin: origin.origin,
        streamMaxSeconds: input.streamMaxSeconds,
        useBypassHeader: useBypass,
        useRouteAuthorizationHeader: useRouteAuthorization,
      }),
    )

    try {
      const result = await sandbox.run({ command })
      return {
        ...toCliCommandResult({
          brokeredVercelAuth: useBypass,
          command,
          result,
        }),
        brokeredRouteAuth: useRouteAuthorization,
      }
    } finally {
      if (useBypass || useRouteAuthorization) {
        await clearVerificationCredentialBroker(sandbox)
      }
    }
  },
  toModelOutput: toVerificationModelOutput,
})

// Normalize an unset or empty env var to undefined so the broker, the header
// injection, and the reported brokeredVercelAuth flag can never disagree.
function readBypassSecret(): string | undefined {
  return readHeaderEnvironmentValue(BYPASS_SECRET_ENV)
}

function readRouteAuthorization(): string | undefined {
  return readHeaderEnvironmentValue(ROUTE_AUTHORIZATION_ENV)
}

function readHeaderEnvironmentValue(name: string): string | undefined {
  const value = process.env[name]
  if (value === undefined || value === '') {
    return
  }
  if (value.includes('\r') || value.includes('\n')) {
    throw new Error(`${name} cannot contain newlines.`)
  }
  return value
}

function readVerificationAllowedOrigins(): string[] {
  const value = process.env[VERIFICATION_ALLOWED_ORIGINS_ENV]
  if (value === undefined || value.trim() === '') {
    return []
  }
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '')
}

export function resolveVerificationOrigin(
  value: string,
  allowedOriginValues: readonly string[],
  credentialsWillBeBrokered: boolean,
): URL {
  const origin = parseHttpsOrigin(value, 'deploymentUrl')
  if (!credentialsWillBeBrokered) {
    return origin
  }

  const allowedOrigins = new Set(
    allowedOriginValues.map((allowedOrigin) =>
      parseHttpsOrigin(
        allowedOrigin,
        VERIFICATION_ALLOWED_ORIGINS_ENV,
        true,
      ).toString(),
    ),
  )

  if (!allowedOrigins.has(origin.toString())) {
    throw new Error(
      `${origin.origin} is not allowlisted in ${VERIFICATION_ALLOWED_ORIGINS_ENV}; credentials were not brokered.`,
    )
  }

  return origin
}

function parseHttpsOrigin(
  value: string,
  label: string,
  requireOriginOnly = false,
): URL {
  const url = new URL(value)
  if (url.protocol !== 'https:') {
    throw new Error(`${label} must use HTTPS.`)
  }
  if (url.username !== '' || url.password !== '') {
    throw new Error(`${label} cannot include URL credentials.`)
  }
  if (url.port !== '') {
    throw new Error(`${label} cannot use a custom port.`)
  }
  if (
    requireOriginOnly &&
    (url.pathname !== '/' || url.search !== '' || url.hash !== '')
  ) {
    throw new Error(`${label} must contain exact origins without paths.`)
  }
  return new URL(url.origin)
}

export function buildVerificationCommand({
  message,
  origin,
  streamMaxSeconds,
  useBypassHeader,
  useRouteAuthorizationHeader,
}: {
  message: string
  origin: string
  streamMaxSeconds: number
  useBypassHeader: boolean
  useRouteAuthorizationHeader: boolean
}): string {
  const bypassHeaderOption = useBypassHeader
    ? `-H ${shellQuote(`x-vercel-protection-bypass: ${BROKERED_BYPASS_PLACEHOLDER}`)}`
    : ''
  const authenticatedHeaderOptions = [
    bypassHeaderOption,
    useRouteAuthorizationHeader
      ? `-H ${shellQuote(`authorization: ${BROKERED_ROUTE_AUTH_PLACEHOLDER}`)}`
      : '',
  ]
    .filter(Boolean)
    .join(' ')
  const sessionBody = JSON.stringify({ message })

  return [
    'set +e',
    `ORIGIN=${shellQuote(origin)}`,
    `SESSION_BODY=${shellQuote(sessionBody)}`,
    'echo "=== health ==="',
    `HEALTH_RESPONSE=$(curl --disable --silent --show-error --write-out "\\nHEALTH_HTTP_STATUS:%{http_code}\\n" ${bypassHeaderOption} "$ORIGIN/eve/v1/health")`,
    'HEALTH_CURL_EXIT=$?',
    'printf "%s\\n" "$HEALTH_RESPONSE"',
    'echo "HEALTH_CURL_EXIT:$HEALTH_CURL_EXIT"',
    'HEALTH_HTTP_STATUS=$(printf "%s\\n" "$HEALTH_RESPONSE" | sed -n "s/^HEALTH_HTTP_STATUS://p" | tail -n 1)',
    `HEALTH_HTTP_STATUS=\${HEALTH_HTTP_STATUS:-000}`,
    'echo "=== session ==="',
    `SESSION_RESPONSE=$(curl --disable --silent --show-error --write-out "\\nSESSION_HTTP_STATUS:%{http_code}\\n" ${authenticatedHeaderOptions} -H "content-type: application/json" -d "$SESSION_BODY" "$ORIGIN/eve/v1/session")`,
    'SESSION_CURL_EXIT=$?',
    'printf "%s\\n" "$SESSION_RESPONSE"',
    'echo "SESSION_CURL_EXIT:$SESSION_CURL_EXIT"',
    'SESSION_HTTP_STATUS=$(printf "%s\\n" "$SESSION_RESPONSE" | sed -n "s/^SESSION_HTTP_STATUS://p" | tail -n 1)',
    `SESSION_HTTP_STATUS=\${SESSION_HTTP_STATUS:-000}`,
    'SESSION_JSON=$(printf "%s" "$SESSION_RESPONSE" | sed "/^SESSION_HTTP_STATUS:/d")',
    `SESSION_ID=$(printf "%s" "$SESSION_JSON" | node -e ${shellQuote(PARSE_SESSION_ID_SCRIPT)})`,
    'STREAM_CURL_EXIT=1',
    'STREAM_HTTP_STATUS=000',
    'STREAM_BODY=""',
    'if [ -n "$SESSION_ID" ]; then',
    '  echo "=== stream ==="',
    `  STREAM_RESPONSE=$(curl --disable --silent --show-error --max-time ${streamMaxSeconds} --write-out "\\nSTREAM_HTTP_STATUS:%{http_code}\\n" ${authenticatedHeaderOptions} "$ORIGIN/eve/v1/session/$SESSION_ID/stream")`,
    '  STREAM_CURL_EXIT=$?',
    '  printf "%s\\n" "$STREAM_RESPONSE"',
    '  echo "STREAM_CURL_EXIT:$STREAM_CURL_EXIT"',
    '  STREAM_HTTP_STATUS=$(printf "%s\\n" "$STREAM_RESPONSE" | sed -n "s/^STREAM_HTTP_STATUS://p" | tail -n 1)',
    `  STREAM_HTTP_STATUS=\${STREAM_HTTP_STATUS:-000}`,
    '  STREAM_BODY=$(printf "%s" "$STREAM_RESPONSE" | sed "/^STREAM_HTTP_STATUS:/d")',
    'else',
    '  echo "STREAM_SKIPPED:no-session-id"',
    'fi',
    'HEALTH_OK=false; if [ "$HEALTH_CURL_EXIT" -eq 0 ] && [ "$HEALTH_HTTP_STATUS" -ge 200 ] && [ "$HEALTH_HTTP_STATUS" -lt 300 ]; then HEALTH_OK=true; fi',
    'SESSION_OK=false; if [ "$SESSION_CURL_EXIT" -eq 0 ] && [ "$SESSION_HTTP_STATUS" -ge 200 ] && [ "$SESSION_HTTP_STATUS" -lt 300 ] && [ -n "$SESSION_ID" ]; then SESSION_OK=true; fi',
    'STREAM_OK=false; if { [ "$STREAM_CURL_EXIT" -eq 0 ] || [ "$STREAM_CURL_EXIT" -eq 28 ]; } && [ "$STREAM_HTTP_STATUS" -ge 200 ] && [ "$STREAM_HTTP_STATUS" -lt 300 ] && [ -n "$STREAM_BODY" ]; then STREAM_OK=true; fi',
    'if [ "$HEALTH_OK" = true ] && [ "$SESSION_OK" = true ] && [ "$STREAM_OK" = true ]; then',
    '  echo "VERIFICATION_OK:health-session-stream"',
    '  exit 0',
    'fi',
    'echo "VERIFICATION_FAILED: health=$HEALTH_OK session=$SESSION_OK stream=$STREAM_OK" >&2',
    'exit 1',
  ].join('\n')
}

async function applyVerificationCredentialBroker(
  sandbox: SandboxSession,
  hostname: string,
  credentials: {
    bypassSecret?: string
    routeAuthorization?: string
  },
): Promise<void> {
  const bypassMatch = {
    key: { exact: 'x-vercel-protection-bypass' },
    value: { exact: BROKERED_BYPASS_PLACEHOLDER },
  }
  const routeAuthorizationMatch = {
    key: { exact: 'authorization' },
    value: { exact: BROKERED_ROUTE_AUTH_PLACEHOLDER },
  }
  const verificationRules = [
    ...(credentials.bypassSecret && credentials.routeAuthorization
      ? [
          {
            match: { headers: [bypassMatch, routeAuthorizationMatch] },
            transform: [
              {
                headers: {
                  authorization: credentials.routeAuthorization,
                  'x-vercel-protection-bypass': credentials.bypassSecret,
                },
              },
            ],
          },
        ]
      : []),
    ...(credentials.bypassSecret
      ? [
          {
            match: { headers: [bypassMatch] },
            transform: [
              {
                headers: {
                  'x-vercel-protection-bypass': credentials.bypassSecret,
                },
              },
            ],
          },
        ]
      : []),
    ...(credentials.routeAuthorization
      ? [
          {
            match: { headers: [routeAuthorizationMatch] },
            transform: [
              {
                headers: {
                  authorization: credentials.routeAuthorization,
                },
              },
            ],
          },
        ]
      : []),
  ]

  const policy = {
    allow: {
      [hostname]: verificationRules,
      '*': [],
    },
  } satisfies SandboxNetworkPolicy

  await sandbox.setNetworkPolicy(policy)
}

async function clearVerificationCredentialBroker(
  sandbox: SandboxSession,
): Promise<void> {
  await sandbox.setNetworkPolicy('allow-all')
}

interface VerificationCommandResult extends CliCommandResult {
  brokeredRouteAuth: boolean
}

function toVerificationModelOutput(output: VerificationCommandResult): {
  type: 'json'
  value: ReturnType<typeof toCliModelOutput>['value'] & {
    brokeredRouteAuth: boolean
  }
} {
  const modelOutput = toCliModelOutput(output)
  return {
    type: 'json',
    value: {
      ...modelOutput.value,
      brokeredRouteAuth: output.brokeredRouteAuth,
    },
  }
}
