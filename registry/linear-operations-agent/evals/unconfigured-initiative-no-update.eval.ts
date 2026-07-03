import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Declines to write a weekly initiative update for an initiative that is not in the configured coverage list.",
  async test(t) {
    await t.send(`
Post this week's initiative update for the "Mobile Rewrite" initiative in Linear.

The configured initiative coverage (LINEAR_OPS_COVERED_INITIATIVES) contains only "Platform Reliability", and "Mobile Rewrite" is not in it. Proceed according to your instructions: weekly initiative updates may only be written for explicitly configured initiatives, so do not call save_status_update or any other Linear tool for this request. Explain that "Mobile Rewrite" is not configured for automated updates and how coverage can be extended.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("save_status_update").gate();
    t.notCalledTool("linear__save_status_update").gate();
    t.check(t.reply, includes("Mobile Rewrite").gate());
    t.check(t.reply, includes("LINEAR_OPS_COVERED_INITIATIVES").soft());
  },
});
