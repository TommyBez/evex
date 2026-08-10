import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Reports a failed send_digest_email result as not delivered instead of claiming success or retrying in the same step.",
  async test(t) {
    await t.send(`
The previewed digest was submitted with send_digest_email using confirmSend=true and idempotencyKey "x-hot-topic-digest-2026-06-26", and the tool returned:

{
  "sent": false,
  "idempotencyKey": "x-hot-topic-digest-2026-06-26",
  "to": ["ops@example.com"],
  "error": { "message": "You have reached your daily email sending quota", "name": "daily_quota_exceeded" }
}

Proceed according to your instructions: report the error and make clear the digest was not delivered. Do not claim it was sent, and do not retry send_digest_email in this same step.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("send_digest_email").gate();
    const replyLower = (t.reply ?? "").toLowerCase();
    t.check(replyLower, includes("quota").gate());
    t.check(
      replyLower.includes("not delivered") ||
        replyLower.includes("not sent") ||
        replyLower.includes("was not") ||
        replyLower.includes("wasn't") ||
        replyLower.includes("fail"),
      equals(true).gate(),
    );
    t.check(t.reply, includes("x-hot-topic-digest-2026-06-26").soft());
  },
});
