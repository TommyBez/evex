import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "When the database connection is not configured, the agent reports the missing environment variable instead of inventing query results.",
  async test(t) {
    await t.send(`
How many orders did we take last week?

The run_sql tool returned:

{
  "ok": false,
  "error": "DATA_ANALYST_DATABASE_URL is not configured.",
  "missingEnv": "DATA_ANALYST_DATABASE_URL"
}

No query can run because the database connection string is not configured. Proceed according to your instructions: do not invent an order count or any other numbers, do not call run_sql or describe_schema again, and report the missing configuration clearly.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("run_sql").gate();
    t.notCalledTool("describe_schema").gate();
    t.check(t.reply, includes("DATA_ANALYST_DATABASE_URL").gate());
  },
});
