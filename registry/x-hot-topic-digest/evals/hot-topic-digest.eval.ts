import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Scans a sample of X posts, researches hot topics with Parallel, and previews the digest email without sending.",
  async test(t) {
    await t.send(`
Run the daily X hot topic digest for the following sample posts.

Watched handles: vercel, parallel_ai

Sample scan_x_profiles output:
{
  "scannedProfiles": 2,
  "totalTweets": 2,
  "lookbackHours": 24,
  "windowStart": "2026-06-25T08:00:00Z",
  "profiles": [
    {
      "handle": "vercel",
      "ok": true,
      "tweetCount": 1,
      "tweets": [
        {
          "id": "1700000000000000001",
          "text": "We just shipped AI SDK 5 with native agent loops and durable execution.",
          "createdAt": "2026-06-26T07:00:00.000Z",
          "likes": 320,
          "replies": 22,
          "reposts": 45,
          "quotes": 8,
          "impressions": 12000
        }
      ]
    },
    {
      "handle": "parallel_ai",
      "ok": true,
      "tweetCount": 1,
      "tweets": [
        {
          "id": "1700000000000000002",
          "text": "Parallel Monitor API is now GA: web change events streamed to proactive agents.",
          "createdAt": "2026-06-26T07:30:00.000Z",
          "likes": 210,
          "replies": 14,
          "reposts": 33,
          "quotes": 5,
          "impressions": 9000
        }
      ]
    }
  ]
}

Surface up to 2 hot topics, research each with research_hot_topics, then preview the digest with preview_digest_email. Do not call send_digest_email in this run.
`);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("research_hot_topics").gate();
    t.calledTool("preview_digest_email").gate();
    t.notCalledTool("send_digest_email").gate();
    t.check(t.reply, includes("dryRun").soft());
  },
});
