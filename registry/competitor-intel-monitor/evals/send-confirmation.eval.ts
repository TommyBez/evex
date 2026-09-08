import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";

export default defineEval({
  description:
    "Confirms send_digest requires confirmSend=true and a stable idempotencyKey.",
  async test(t) {
    const turn = await t.send(`
The digest has been previewed with preview_digest and the user has approved sending it for 2026-09-07.

The change that cleared the thresholds is:
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

Now send the digest with send_digest. Use competitor-intel-monitor-2026-09-07 as the idempotencyKey and set confirmSend=true. Do not pass to, from, a Connect UID, or a channel id.
`);

    const call = turn.requireToolCall("send_digest");
    t.check(call.input.confirmSend, equals(true).gate());
    t.check(
      typeof call.input.idempotencyKey === "string" &&
        String(call.input.idempotencyKey).includes("competitor-intel-monitor-2026-09-07"),
      equals(true).gate(),
    );
    t.check(call.input.to === undefined, equals(true).gate());
    t.check(call.input.from === undefined, equals(true).gate());
  },
});
