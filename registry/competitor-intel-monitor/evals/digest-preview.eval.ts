import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Previews a scored digest draft and does not send it.",
  async test(t) {
    await t.send(`
The watch found one change that cleared the thresholds:

{
  "url": "https://example.com/pricing",
  "fetchedAt": "2026-09-07T08:00:00.000Z",
  "isBaseline": false,
  "changed": true,
  "score": 48,
  "changedChars": 92,
  "excerpt": "Added: 29 annual billing",
  "clearsThreshold": true
}

Call preview_digest with that change so we can review the Slack and email draft. Do not call send_digest.
`);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("preview_digest").gate();
    t.notCalledTool("send_digest").gate();
    t.check(t.reply, includes("dryRun").soft());
  },
});
