import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "When required configuration is missing, the agent stops and reports it instead of creating any Typefully drafts.",
  async test(t) {
    await t.send(`
Run the daily X hot topic Typefully drafts.

The scan_x_profiles tool returned:

{
  "authRequired": true,
  "missingEnv": "X_BEARER_TOKEN"
}

No handles could be scanned because the X bearer token is not configured. Proceed according to the instructions: do not invent handles, topics, sources, or draft text, and do not call create_x_drafts or preview_x_draft. Report the missing configuration clearly.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("create_x_drafts").gate();
    t.notCalledTool("preview_x_draft").gate();
    t.check(t.reply, includes("X_BEARER_TOKEN").gate());
  },
});
