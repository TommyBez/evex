import { defineTool } from "eve/tools";
import type { ApprovalStatus } from "eve/tools/approval";
import { bash } from "eve/tools/bash";

// Blocked commands must match at command position — start of input or right
// after a shell separator, grouping token, or control-flow keyword —
// optionally preceded by env-var assignments, shell wrappers, and a
// package-runner prefix (including runner flags such as `npx --yes`). Mentions
// of these words in arguments (for example `grep vercel package.json`) stay
// allowed. This is routing enforcement for the structured tools, not a
// security boundary: Vercel tokens never enter the sandbox, so a crafted
// bypass gains nothing.
const COMMAND_POSITION =
  /(?:^|[;&|\n({]|`)\s*(?:(?:if|elif|then|else|do|while|until|time)\s+)*(?:\w+=\S*\s+)*/;
const SHELL_WRAPPER_PREFIX =
  /(?:(?:command|exec)(?:\s+--)?\s+|env(?:\s+(?:-{1,2}\S+|\w+=\S+))*\s+)*/;
const RUNNER_PREFIX =
  /(?:(?:npx|pnpm|npm|yarn|bun|bunx)(?:\s+(?:(?:-p|--package)\s+\S+|-{1,2}\S+|dlx|exec|x))*\s+)?(?:\S*\/)?/;

function blockedCommandPattern(commandPattern: string): RegExp {
  return new RegExp(
    `${COMMAND_POSITION.source}${SHELL_WRAPPER_PREFIX.source}${RUNNER_PREFIX.source}${commandPattern}`,
    "i"
  );
}

const BLOCKED_COMMANDS = [
  {
    pattern: blockedCommandPattern(
      String.raw`eve(?:@[^\s]+)?\s+(?:--\s+)?(?:deploy|link)\b`
    ),
    reason: "Use run_vercel_cli for Eve deploy and link operations.",
  },
  {
    pattern: blockedCommandPattern(
      String.raw`eve(?:@[^\s]+)?\s+(?:--\s+)?(?:channels\s+add\b|add\s+(?:-{1,2}[\w-]+\s+)*(?:["']?channel["']?\/["']?|["']?linear(?:["']|\b)))`
    ),
    reason:
      "Use run_eve_cli for the local web scaffold; follow the bundled Eve channel guide for integration setup.",
  },
  {
    pattern: blockedCommandPattern(String.raw`vercel\b`),
    reason:
      "Use run_vercel_cli for Vercel CLI operations so brokered authentication and required approvals are applied.",
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
    "Execute a normal shell command in the shared workspace environment. Vercel CLI invocations, Eve deploy/link, Eve channel setup, and Vercel token commands are denied; use run_eve_cli for the local web scaffold, the bundled channel guide for integrations, or run_vercel_cli for approved Vercel operations.",
  approval: ({ toolInput }) => approvalForBash(toolInput),
});

// Exported so the routing patterns eval can regression-test the command
// matching deterministically, without a model or sandbox in the loop.
export function approvalForBash(input: unknown): ApprovalStatus {
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
