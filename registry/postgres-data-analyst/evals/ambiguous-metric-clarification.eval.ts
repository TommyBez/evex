import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Asks a clarifying question before running SQL when the metric definition and time range are ambiguous.",
  async test(t) {
    await t.send(`
How are signups doing?

No schema information is available yet and the question does not define the signup metric, the table to use, or a time range. Proceed according to your instructions: the metric definition, time range, and table choice are ambiguous, so ask a clarifying question first instead of guessing. Do not call describe_schema or run_sql until the question is clarified.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("run_sql").gate();
    t.notCalledTool("describe_schema").gate();
    t.check(t.reply, includes("?").gate());
  },
});
