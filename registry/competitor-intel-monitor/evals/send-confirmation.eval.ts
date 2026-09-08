import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";

import sendDigest from "../agent/tools/send_digest";

const inputSchemaKeys = (schema: unknown): readonly string[] => {
  if (
    schema &&
    typeof schema === "object" &&
    "shape" in schema &&
    schema.shape &&
    typeof schema.shape === "object"
  ) {
    return Object.keys(schema.shape);
  }
  return [];
};

export default defineEval({
  description:
    "Confirms send_digest requires confirmSend=true and a stable idempotencyKey.",
  async test(t) {
    const schemaKeys = inputSchemaKeys(sendDigest.inputSchema);
    t.check(!schemaKeys.includes("to"), equals(true).gate());
    t.check(!schemaKeys.includes("from"), equals(true).gate());
    t.check(!schemaKeys.includes("slackConnectUid"), equals(true).gate());
    t.check(!schemaKeys.includes("slackChannelId"), equals(true).gate());
    t.check(!schemaKeys.includes("connectUid"), equals(true).gate());
    t.check(!schemaKeys.includes("channelId"), equals(true).gate());

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
    t.check(call.input.slackConnectUid === undefined, equals(true).gate());
    t.check(call.input.slackChannelId === undefined, equals(true).gate());
    t.check(call.input.connectUid === undefined, equals(true).gate());
    t.check(call.input.channelId === undefined, equals(true).gate());
  },
});
