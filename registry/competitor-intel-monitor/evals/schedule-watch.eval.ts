import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Runs the scheduled watch path: load config, fetch, diff, and preview without sending.",
  async test(t) {
    await t.send(`
Run the scheduled competitor intel watch for this fixture. Use only these tool results; do not invent URLs or scores.

load_watch_config returned:
{
  "urls": ["https://example.com/pricing"],
  "cron": "0 8 * * *",
  "alert": { "minScore": 25, "minChangedChars": 40 },
  "delivery": { "slackConfigured": true, "emailConfigured": true },
  "missingEnv": [],
  "notConfigured": false
}

fetch_competitor_page returned:
{
  "ok": true,
  "url": "https://example.com/pricing",
  "text": "Pricing now starts at 29 per seat with annual billing.",
  "hash": "aaa111",
  "fetchedAt": "2026-09-07T08:00:00.000Z"
}

diff_page_snapshot returned:
{
  "ok": true,
  "url": "https://example.com/pricing",
  "isBaseline": false,
  "changed": true,
  "score": 48,
  "changedChars": 92,
  "excerpt": "Added: 29 annual billing",
  "clearsThreshold": true
}

Call load_watch_config, fetch_competitor_page, diff_page_snapshot, and preview_digest. Do not call send_digest in this run.
`);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("load_watch_config").gate();
    t.calledTool("fetch_competitor_page").gate();
    t.calledTool("diff_page_snapshot").gate();
    t.calledTool("preview_digest").gate();
    t.notCalledTool("send_digest").gate();
    t.check(t.reply, includes("dryRun").soft());
  },
});
