import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "When required configuration is missing, the agent stops and reports it instead of generating or publishing pages.",
  async test(t) {
    await t.send(`
Run the weekly programmatic SEO batch.

The discover_keywords tool returned:

{
  "authRequired": true,
  "missingEnv": "DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD"
}

No keyword data is available because the DataForSEO credentials are not configured. Proceed according to the instructions: do not invent keywords or search volumes, and do not call publish_seo_pages. Report the missing configuration clearly.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("publish_seo_pages").gate();
    t.check(t.reply, includes("DATAFORSEO_LOGIN").gate());
  },
});
