import { defineEval } from "eve/evals";

// Judge-graded check of the delivery-standards report contract. The scenario
// facts are supplied; the structure and completeness of the report is what is
// scored. Requires a judge credential (AI_GATEWAY_API_KEY or
// VERCEL_OIDC_TOKEN); without one this eval skips visibly.
export default defineEval({
  description:
    "Final report includes changed files, command outcomes, the deployment URL and target, and verification evidence.",
  tags: ["report"],
  async test(t) {
    await t.send(`
Give your final delivery report for this completed run.

Context for this run, all true and already done: you changed
agent/tools/summarize.ts and evals/summarize.eval.ts. Commands run: npm
install passed, tsc --noEmit passed, eve info --json passed, eve build
passed, eve eval passed 3 of 3. After approval you deployed the preview
https://acme-support-agent-abc123.vercel.app and verify_vercel_preview
confirmed the health, session, and stream checks. Nothing is blocked.
`);

    t.messageIncludes("acme-support-agent-abc123");
    t.judge.autoevals
      .closedQA(
        "Does the reply report all of: the changed files, each command run with its pass or fail status, the deployment URL with its target (preview or production), and live verification evidence?"
      )
      .atLeast(0.5);
  },
});
