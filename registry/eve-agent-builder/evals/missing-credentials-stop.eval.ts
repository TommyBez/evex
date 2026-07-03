import { defineEval } from "eve/evals";

// The prompt states only the scenario facts. It must not tell the agent to
// stop or which variable to name — that is the behavior under test.
export default defineEval({
  description:
    "Stops before deployment and reports the exact missing environment variable when Vercel credentials are unavailable.",
  async test(t) {
    await t.send(`
Local checks passed. Now link the project and deploy a preview.

Context for this run: the last run_vercel_cli call failed with:

Error: VERCEL_TOKEN is required in the app runtime to broker Vercel CLI authentication.

The app runtime still has no Vercel credentials configured.
`);

    t.succeeded();
    t.notCalledTool("run_vercel_cli");
    t.messageIncludes("VERCEL_TOKEN");
  },
});
