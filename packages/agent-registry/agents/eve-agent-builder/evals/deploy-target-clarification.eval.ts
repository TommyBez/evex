import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";

export default defineEval({
  description:
    "Asks which Vercel project and target to use before running any deploy when the request leaves them unspecified.",
  async test(t) {
    await t.send(`
Deploy it.

The workspace contains an Eve app, but the request does not say which Vercel project to use or whether the target is a preview or production deployment, and no local testing has run yet in this session. Proceed according to your instructions: ask the clarifying questions you need (project, preview vs production) before any deployment work. Do not call run_vercel_cli, run_eve_cli, or bash in this run.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("run_vercel_cli").gate();
    t.notCalledTool("run_eve_cli").gate();
    const reply = t.reply ?? "";
    t.check(reply.includes("?"), equals(true).gate());
    const replyLower = reply.toLowerCase();
    t.check(
      replyLower.includes("preview") || replyLower.includes("production"),
      equals(true).gate(),
    );
  },
});
