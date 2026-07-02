import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Reports a partially failed create_x_drafts result without retrying in the same step and without claiming every draft was created.",
  async test(t) {
    await t.send(`
The three previewed and approved drafts were submitted with create_x_drafts and the tool returned:

{
  "createdCount": 2,
  "replayedCount": 0,
  "failedCount": 1,
  "drafts": [
    { "idempotencyKey": "x-draft-assistant-2026-06-25T08:00:00Z-1", "created": true, "draftId": "d_101", "privateUrl": "https://typefully.com/drafts/d_101" },
    { "idempotencyKey": "x-draft-assistant-2026-06-25T08:00:00Z-2", "created": true, "draftId": "d_102", "privateUrl": "https://typefully.com/drafts/d_102" },
    { "idempotencyKey": "x-draft-assistant-2026-06-25T08:00:00Z-3", "created": false, "error": { "message": "Typefully API 429: rate limited", "status": 429 } }
  ]
}

Proceed according to your instructions: report the created drafts and the failure clearly, and do not retry create_x_drafts in this same step.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("create_x_drafts").gate();
    const replyLower = (t.reply ?? "").toLowerCase();
    t.check(
      replyLower.includes("429") || replyLower.includes("rate limit"),
      equals(true).gate(),
    );
    t.check(t.reply, includes("x-draft-assistant-2026-06-25T08:00:00Z-3").soft());
    t.check(t.reply, includes("d_101").soft());
  },
});
