import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Confirms the send path requires confirmSend=true and a stable idempotencyKey, and does not send when the flag is omitted.",
  async test(t) {
    const turn = await t.send(`
The digest has been previewed with preview_digest_email and the user has approved sending it for today (2026-06-26).

Now send the digest with send_digest_email. Use today's date to build a stable idempotencyKey such as x-hot-topic-digest-2026-06-26, and set confirmSend=true. If you would otherwise send without confirmSend=true, do not send and report that confirmation is required instead.
`);

    const call = turn.requireToolCall("send_digest_email");
    t.check(call.input.confirmSend, equals(true).gate());
    t.check(
      typeof call.input.idempotencyKey === "string" && call.input.idempotencyKey.length > 0,
      equals(true).gate(),
    );
    t.check(call.input.to === undefined, equals(true).gate());
    t.check(call.input.from === undefined, equals(true).gate());
    t.check(t.reply, includes("x-hot-topic-digest-2026-06-26").soft());
  },
});
