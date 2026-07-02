import type { SandboxNetworkPolicy, SandboxSession } from "eve/sandbox";
import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import {
  inAppRoot,
  shellQuote,
  toCliCommandResult,
  toCliModelOutput,
} from "../lib/vercel-brokered-cli";

const BYPASS_SECRET_ENV = "VERCEL_AUTOMATION_BYPASS_SECRET";
const BROKERED_BYPASS_PLACEHOLDER = "brokeredvercelbypass";

const PARSE_SESSION_ID_SCRIPT =
  'let raw = ""; process.stdin.on("data", (chunk) => { raw += chunk; }); process.stdin.on("end", () => { try { const body = JSON.parse(raw); process.stdout.write(typeof body.sessionId === "string" ? body.sessionId : ""); } catch {} });';

const inputSchema = z.object({
  appRoot: z
    .string()
    .min(1)
    .default(".")
    .describe("Workspace-relative directory where verification commands run."),
  deploymentUrl: z
    .url()
    .describe(
      "Deployment origin or URL to verify, for example https://preview.vercel.app."
    ),
  message: z
    .string()
    .min(1)
    .max(2000)
    .default("Smoke test this Eve deployment.")
    .describe("Message used to create a smoke-test Eve session."),
  streamMaxSeconds: z
    .number()
    .int()
    .min(1)
    .max(60)
    .default(15)
    .describe("Maximum seconds to hold the session stream open."),
});

export default defineTool({
  description:
    "Verify a Vercel deployment's Eve routes: /eve/v1/health, session creation, and the session stream. Requires approval because it sends a smoke-test session. When VERCEL_AUTOMATION_BYPASS_SECRET is set, it brokers the secret through the sandbox network policy so protected previews can be verified without exposing the secret; without it, unprotected deployments are verified directly.",
  inputSchema,
  approval: always<z.infer<typeof inputSchema>>(),
  async execute(input, ctx) {
    const sandbox = await ctx.getSandbox();
    const origin = readOrigin(input.deploymentUrl);
    const bypassSecret = readBypassSecret();
    const useBypass = bypassSecret !== undefined;

    if (bypassSecret) {
      await applyPreviewBypassBroker(sandbox, origin.hostname, bypassSecret);
    }

    const command = inAppRoot(
      input.appRoot,
      buildVerificationCommand({
        message: input.message,
        origin: origin.origin,
        streamMaxSeconds: input.streamMaxSeconds,
        useBypassHeader: useBypass,
      })
    );

    try {
      const result = await sandbox.run({ command });
      return toCliCommandResult({
        brokeredVercelAuth: useBypass,
        command,
        result,
      });
    } finally {
      if (useBypass) {
        await clearPreviewBypassBroker(sandbox);
      }
    }
  },
  toModelOutput: toCliModelOutput,
});

// Normalize an unset or empty env var to undefined so the broker, the header
// injection, and the reported brokeredVercelAuth flag can never disagree.
function readBypassSecret(): string | undefined {
  const value = process.env[BYPASS_SECRET_ENV];
  return value === undefined || value === "" ? undefined : value;
}

function readOrigin(value: string): URL {
  const url = new URL(value);
  return new URL(url.origin);
}

function buildVerificationCommand({
  message,
  origin,
  streamMaxSeconds,
  useBypassHeader,
}: {
  message: string;
  origin: string;
  streamMaxSeconds: number;
  useBypassHeader: boolean;
}): string {
  const bypassHeaderOption = useBypassHeader
    ? `-H ${shellQuote(`x-vercel-protection-bypass: ${BROKERED_BYPASS_PLACEHOLDER}`)}`
    : "";
  const sessionBody = JSON.stringify({ message });

  return [
    "set +e",
    `ORIGIN=${shellQuote(origin)}`,
    `SESSION_BODY=${shellQuote(sessionBody)}`,
    'echo "=== health ==="',
    `curl --silent --show-error --location --write-out "\\nHEALTH_HTTP_STATUS:%{http_code}\\n" ${bypassHeaderOption} "$ORIGIN/eve/v1/health"`,
    'echo "=== session ==="',
    `SESSION_RESPONSE=$(curl --silent --show-error --location --write-out "\\nSESSION_HTTP_STATUS:%{http_code}\\n" ${bypassHeaderOption} -H "content-type: application/json" -d "$SESSION_BODY" "$ORIGIN/eve/v1/session")`,
    "SESSION_CURL_EXIT=$?",
    'printf "%s\\n" "$SESSION_RESPONSE"',
    'echo "SESSION_CURL_EXIT:$SESSION_CURL_EXIT"',
    'SESSION_JSON=$(printf "%s" "$SESSION_RESPONSE" | sed "/^SESSION_HTTP_STATUS:/d")',
    `SESSION_ID=$(printf "%s" "$SESSION_JSON" | node -e ${shellQuote(PARSE_SESSION_ID_SCRIPT)})`,
    'if [ -n "$SESSION_ID" ]; then',
    '  echo "=== stream ==="',
    `  curl --silent --show-error --location --max-time ${streamMaxSeconds} ${bypassHeaderOption} "$ORIGIN/eve/v1/session/$SESSION_ID/stream"`,
    "  STREAM_CURL_EXIT=$?",
    "  echo",
    '  echo "STREAM_CURL_EXIT:$STREAM_CURL_EXIT"',
    "else",
    '  echo "STREAM_SKIPPED:no-session-id"',
    "fi",
  ].join("\n");
}

async function applyPreviewBypassBroker(
  sandbox: SandboxSession,
  hostname: string,
  bypassSecret: string
): Promise<void> {
  const bypassRule = [
    {
      match: {
        headers: [
          {
            key: { exact: "x-vercel-protection-bypass" },
            value: { exact: BROKERED_BYPASS_PLACEHOLDER },
          },
        ],
      },
      transform: [
        {
          headers: {
            "x-vercel-protection-bypass": bypassSecret,
          },
        },
      ],
    },
  ];

  const policy = {
    allow: {
      [hostname]: bypassRule,
      "*": [],
    },
  } satisfies SandboxNetworkPolicy;

  await sandbox.setNetworkPolicy(policy);
}

async function clearPreviewBypassBroker(
  sandbox: SandboxSession
): Promise<void> {
  await sandbox.setNetworkPolicy("allow-all");
}
