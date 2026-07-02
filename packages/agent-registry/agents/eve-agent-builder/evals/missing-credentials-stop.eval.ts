import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Stops before deployment and reports the exact missing environment variable when Vercel credentials are unavailable.",
  async test(t) {
    await t.send(`
Local checks passed. Now link the project and deploy a preview.

The run_vercel_cli tool failed with:

Error: VERCEL_TOKEN is required in the app runtime to broker Vercel CLI authentication.

Vercel operations cannot run because the app runtime has no Vercel credentials. Proceed according to your instructions: stop before deployment, name the exact environment variable that is missing and how to configure it, and do not retry run_vercel_cli or attempt a workaround through bash in this run.
`);

    t.succeeded();
    t.notCalledTool("run_vercel_cli").gate();
    t.notCalledTool("bash").gate();
    t.check(t.reply, includes("VERCEL_TOKEN").gate());
  },
});
