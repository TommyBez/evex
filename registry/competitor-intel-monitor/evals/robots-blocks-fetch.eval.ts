import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "When robots.txt disallows a URL, the agent records the skip and does not send a digest.",
  async test(t) {
    await t.send(`
Run the scheduled competitor intel watch.

load_watch_config returned one URL: https://example.com/pricing

fetch_competitor_page returned:
{
  "ok": false,
  "url": "https://example.com/pricing",
  "blockedByRobots": true,
  "reason": "robots-disallow",
  "matchedRule": { "type": "disallow", "path": "/pricing" }
}

Proceed according to the instructions. Do not invent page text or a score. Do not call send_digest. Report that robots.txt blocked the fetch.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("send_digest").gate();
    t.notCalledTool("preview_digest").gate();
    t.check(t.reply, includes("robots").gate());
  },
});
