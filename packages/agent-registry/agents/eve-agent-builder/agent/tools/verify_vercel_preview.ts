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

const inputSchema = z.object({
  appRoot: z
    .string()
    .min(1)
    .default(".")
    .describe("Workspace-relative directory where verification commands run."),
  deploymentUrl: z
    .string()
    .url()
    .describe("Deployment origin or URL to verify, for example https://preview.vercel.app."),
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
    "Verify a Vercel preview deployment, including protected previews. Requires approval because it sends a smoke-test session. It brokers VERCEL_AUTOMATION_BYPASS_SECRET through the sandbox network policy, calls /eve/v1/health, creates an Eve session, and attaches to the stream without exposing the bypass secret.",
  inputSchema,
  approval: always<z.infer<typeof inputSchema>>(),
  async execute(input, ctx) {
    const sandbox = await ctx.getSandbox();
    const origin = readOrigin(input.deploymentUrl);
    await applyPreviewBypassBroker(sandbox, origin.hostname);

    const command = inAppRoot(
      input.appRoot,
      buildVerificationCommand({
        message: input.message,
        origin: origin.origin,
        streamMaxSeconds: input.streamMaxSeconds,
      }),
    );

    try {
      const result = await sandbox.run({ command });
      return toCliCommandResult({
        brokeredVercelAuth: true,
        command,
        result,
      });
    } finally {
      await clearPreviewBypassBroker(sandbox);
    }
  },
  toModelOutput: toCliModelOutput,
});

function readOrigin(value: string): URL {
  const url = new URL(value);
  return new URL(url.origin);
}

function buildVerificationCommand({
  message,
  origin,
  streamMaxSeconds,
}: {
  message: string;
  origin: string;
  streamMaxSeconds: number;
}): string {
  const bypassHeader = `x-vercel-protection-bypass: ${BROKERED_BYPASS_PLACEHOLDER}`;
  const sessionBody = JSON.stringify({ message });

  return [
    "set +e",
    `ORIGIN=${shellQuote(origin)}`,
    `BYPASS_HEADER=${shellQuote(bypassHeader)}`,
    `SESSION_BODY=${shellQuote(sessionBody)}`,
    'echo "=== health ==="',
    'curl --silent --show-error --location --write-out "\\nHEALTH_HTTP_STATUS:%{http_code}\\n" -H "$BYPASS_HEADER" "$ORIGIN/eve/v1/health"',
    'echo "=== session ==="',
    'SESSION_RESPONSE=$(curl --silent --show-error --location --write-out "\\nSESSION_HTTP_STATUS:%{http_code}\\n" -H "$BYPASS_HEADER" -H "content-type: application/json" -d "$SESSION_BODY" "$ORIGIN/eve/v1/session")',
    'SESSION_CURL_EXIT=$?',
    'printf "%s\\n" "$SESSION_RESPONSE"',
    'echo "SESSION_CURL_EXIT:$SESSION_CURL_EXIT"',
    'SESSION_JSON=$(printf "%s" "$SESSION_RESPONSE" | sed "/^SESSION_HTTP_STATUS:/d")',
    'SESSION_ID=$(printf "%s" "$SESSION_JSON" | node -e "let s=\\"\\"; process.stdin.on(\\"data\\", d => s += d); process.stdin.on(\\"end\\", () => { try { const body = JSON.parse(s); process.stdout.write(body.sessionId || \\"\\"); } catch {} });")',
    'if [ -n "$SESSION_ID" ]; then',
    '  echo "=== stream ==="',
    `  curl --silent --show-error --location --max-time ${streamMaxSeconds} -H "$BYPASS_HEADER" "$ORIGIN/eve/v1/session/$SESSION_ID/stream"`,
    '  STREAM_CURL_EXIT=$?',
    '  echo',
    '  echo "STREAM_CURL_EXIT:$STREAM_CURL_EXIT"',
    "else",
    '  echo "STREAM_SKIPPED:no-session-id"',
    "fi",
  ].join("\n");
}

async function applyPreviewBypassBroker(
  sandbox: SandboxSession,
  hostname: string,
): Promise<void> {
  const bypassSecret = process.env[BYPASS_SECRET_ENV];

  if (!bypassSecret) {
    throw new Error(
      `${BYPASS_SECRET_ENV} is required in the app runtime to broker protected preview verification.`,
    );
  }

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
  sandbox: SandboxSession,
): Promise<void> {
  await sandbox.setNetworkPolicy("allow-all");
}
