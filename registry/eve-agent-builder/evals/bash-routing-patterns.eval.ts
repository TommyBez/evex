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
  "eve channels add slack -y",
  "VERCEL_TOKEN=abc npx vercel whoami",
] as const;

const ALLOWED_COMMANDS = [
  "grep vercel package.json",
  "grep -r 'eve deploy' docs/",
  "cat .vercel/project.json",
  "npm run typecheck",
  "npx eve info --json",
  "echo vercel",
] as const;

function isDenied(status: unknown): boolean {
  return (
    typeof status === "object" &&
    status !== null &&
    "type" in status &&
    (status as { type: unknown }).type === "denied"
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
