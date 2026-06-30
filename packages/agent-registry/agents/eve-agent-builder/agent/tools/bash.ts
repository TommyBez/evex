import { defineTool, type ApprovalStatus } from "eve/tools";
import { bash } from "eve/tools/defaults";

const BLOCKED_COMMANDS = [
  {
    pattern: /\beve\s+(?:deploy|link)\b/i,
    reason: "Use run_vercel_cli for Eve deploy and link operations.",
  },
  {
    pattern: /\beve\s+channels\s+add\b/i,
    reason: "Use run_eve_cli for Eve channel setup.",
  },
  {
    pattern: /\b(?:vercel|npx\s+vercel|pnpm\s+(?:dlx\s+)?vercel|npm\s+exec\s+vercel)(?:\s|$)/i,
    reason:
      "Use run_vercel_cli for Vercel CLI operations so approval and brokered authentication are applied.",
  },
  {
    pattern: /\bVERCEL_TOKEN\s*=/i,
    reason:
      "Do not pass Vercel tokens through shell commands. Configure VERCEL_TOKEN in the app runtime and use run_vercel_cli.",
  },
] as const;

export default defineTool({
  ...bash,
  description:
    "Execute a normal shell command in the shared workspace environment. Vercel CLI, Eve deploy/link, Eve channel setup, and Vercel token commands are denied; use run_eve_cli or run_vercel_cli for those.",
  approval: ({ toolInput }) => approvalForBash(toolInput),
});

function approvalForBash(input: unknown): ApprovalStatus {
  if (!isCommandInput(input)) {
    return "not-applicable";
  }

  for (const blockedCommand of BLOCKED_COMMANDS) {
    if (blockedCommand.pattern.test(input.command)) {
      return {
        type: "denied",
        reason: blockedCommand.reason,
      };
    }
  }

  return "not-applicable";
}

function isCommandInput(input: unknown): input is { command: string } {
  return (
    input !== null &&
    typeof input === "object" &&
    "command" in input &&
    typeof input.command === "string"
  );
}
