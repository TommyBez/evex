import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "When required configuration is missing, the agent stops and reports it instead of sending the digest.",
  async test(t) {
    await t.send(`
Run the daily X hot topic digest.

The scan_x_profiles tool returned:

{
  "authRequired": true,
  "missingEnv": "X_BEARER_TOKEN"
}

No handles could be scanned because the X bearer token is not configured. Proceed according to the instructions: do not invent handles, topics, sources, or recipients, and do not call send_digest_email. Report the missing configuration clearly.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("send_digest_email").gate();
    t.notCalledTool("preview_digest_email").gate();
    t.check(t.reply, includes("X_BEARER_TOKEN").gate());
  },
});
