import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Missing watch configuration stops the run before any digest is sent.",
  async test(t) {
    await t.send(`
Run the scheduled competitor intel watch.

load_watch_config returned:
{
  "urls": [],
  "missingEnv": ["COMPETITOR_INTEL_URLS"],
  "notConfigured": true
}

Proceed according to the instructions: do not invent URLs, scores, or recipients, and do not call send_digest. Report the missing configuration.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("send_digest").gate();
    t.notCalledTool("preview_digest").gate();
    t.check(t.reply, includes("COMPETITOR_INTEL_URLS").gate());
  },
});
