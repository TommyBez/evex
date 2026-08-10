import { defineEval } from "eve/evals";
import { satisfies } from "eve/evals/expect";
import { approvalForBash } from "../agent/tools/bash";

const DENIED_COMMANDS = [
  "npx vercel deploy --yes",
  "vercel whoami",
  "pnpm dlx vercel env pull",
  "cd app && vercel link",
  "eve deploy",
  "npx eve link",
  "npx eve@0.31.3 deploy",
  "pnpm dlx eve@latest link",
  "npx eve -- deploy",
  "npm exec eve@latest -- deploy",
  "eve add channel/slack --yes",
  "eve add --yes channel/slack",
  "eve add --skip-install channel/slack",
  "npx eve add 'channel/slack' --yes",
  "npx eve@0.31.3 add channel/slack --yes",
  "pnpm dlx eve@latest add --yes channel/slack",
  "npx --package eve@latest eve add channel/slack",
  "npx -p eve@latest eve add channel/slack",
  "npx eve@latest -- add channel/slack",
  "npm exec eve@latest -- add channel/slack",
  "eve add linear --yes",
  "eve add --yes linear",
  "command eve add channel/slack --yes",
  "env eve add channel/slack --yes",
  "env -i HOME=/tmp eve add channel/slack --yes",
  "exec eve add channel/slack --yes",
  "eve add 'channel'/'slack' --yes",
  "VERCEL_TOKEN=abc npx vercel whoami",
] as const;

const ALLOWED_COMMANDS = [
  "grep vercel package.json",
  "grep -r 'eve deploy' docs/",
  "cat .vercel/project.json",
  "npm run typecheck",
  "npx eve info --json",
  "npx eve dev --no-ui --host 127.0.0.1 --port 2000",
  "npx eve start",
  "npx eve invoke \"Smoke test\" --url http://127.0.0.1:2000",
  "npx eve add tool/bash --yes",
  "npx eve add connection/linear --skip-setup",
  "env npx eve info --json",
  "echo vercel",
] as const;

function isDenied(status: unknown): status is { type: "denied" } {
  return (
    typeof status === "object" &&
    status !== null &&
    "type" in status &&
    status.type === "denied"
  );
}

// Deterministic regression test for the bash routing patterns: no model, no
// sandbox — it exercises the exported approval function directly. The
// command-position matching is the subtle part; argument mentions of
// vercel/eve must stay allowed.
export default defineEval({
  description:
    "bash denies Vercel CLI, eve deploy/link, channel setup, and token commands while allowing argument mentions.",
  tags: ["routing"],
  test(t) {
    for (const command of DENIED_COMMANDS) {
      t.check(
        approvalForBash({ command }),
        satisfies(isDenied, `denies: ${command}`)
      );
    }

    for (const command of ALLOWED_COMMANDS) {
      t.check(
        approvalForBash({ command }),
        satisfies((status) => status === "not-applicable", `allows: ${command}`)
      );
    }
  },
});
