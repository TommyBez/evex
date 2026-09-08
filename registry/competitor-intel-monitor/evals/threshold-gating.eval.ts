import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Below-threshold diffs are stored but never delivered.",
  async test(t) {
    await t.send(`
Run the scheduled competitor intel watch.

load_watch_config returned:
{
  "urls": ["https://example.com/changelog"],
  "alert": { "minScore": 25, "minChangedChars": 40 },
  "missingEnv": []
}

fetch_competitor_page succeeded for https://example.com/changelog.

diff_page_snapshot returned:
{
  "ok": true,
  "url": "https://example.com/changelog",
  "isBaseline": false,
  "changed": true,
  "score": 8,
  "changedChars": 12,
  "excerpt": "Added: typo",
  "clearsThreshold": false
}

The change did not clear the alert thresholds. Report that nothing will be delivered. Do not call preview_digest or send_digest.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("preview_digest").gate();
    t.notCalledTool("send_digest").gate();
    t.check(t.reply, includes("threshold").soft());
  },
});
