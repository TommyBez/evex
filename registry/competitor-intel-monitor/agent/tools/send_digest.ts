import { Resend } from "resend";
import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { deliverCompetitorDigest } from "../lib/deliver-digest.js";
import { createSnapshotStore } from "../lib/snapshot-store.js";
import { selectDigestAlerts } from "../lib/thresholds.js";
import { isSlackDeliveryConfigured, watchConfig } from "../lib/watch-config.js";

const changeSchema = z.object({
  url: z.string().url(),
  fetchedAt: z.string().min(1),
  isBaseline: z.boolean(),
  changed: z.boolean(),
  score: z.number().min(0).max(100),
  changedChars: z.number().min(0),
  excerpt: z.string(),
  clearsThreshold: z.boolean(),
});

const sendDigestInput = z.object({
  changes: z.array(changeSchema).min(1),
  runDate: z
    .string()
    .min(1)
    .optional()
    .describe(
      "UTC date from preview_digest. Pass it on every send_digest retry so Slack and email stay on the same date.",
    ),
  confirmSend: z
    .boolean()
    .describe("Must be true to send. Acts as an explicit guard against accidental sends."),
  idempotencyKey: z
    .string()
    .min(1)
    .max(255)
    .describe(
      "Stable unique key for this digest from preview_digest. Reused across retries of the same logical send so a replayed send does not duplicate Slack or email.",
    ),
});

export default defineTool({
  description:
    "Send the scored competitor digest through the Eve Slack Connect channel and/or Resend email. Always pauses for Eve human approval before any Slack or Resend call. Requires confirmSend=true, the idempotencyKey from preview_digest, and the runDate returned by preview_digest so retries keep Slack and email on the same date. Recipients and Slack Connect settings come from configuration. Always call preview_digest first. Do not send when no change cleared the thresholds. After a successful send, pending snapshots for those URLs become the new baseline.",
  inputSchema: sendDigestInput,
  approval: always<z.infer<typeof sendDigestInput>>(),
  async execute({ changes, runDate, confirmSend, idempotencyKey }) {
    if (!confirmSend) {
      return {
        notConfirmed: true,
        note: "confirmSend must be true to send. Call preview_digest to review the digest first.",
      };
    }

    const alerts = selectDigestAlerts(changes, watchConfig.alert);
    if (alerts.length === 0) {
      return {
        sent: false,
        nothingToDeliver: true,
        note: "No changes cleared the alert thresholds. Digest was not sent.",
      };
    }

    const emailFrom = watchConfig.digest.from;
    const emailTo = watchConfig.digest.to;
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const slackConfigured = isSlackDeliveryConfigured(watchConfig);
    const emailConfigured = Boolean(emailFrom && emailTo.length > 0);

    if (!slackConfigured && !emailConfigured) {
      return {
        sent: false,
        notConfigured: true,
        missingEnv: [
          "COMPETITOR_INTEL_SLACK_CONNECT_UID",
          "COMPETITOR_INTEL_SLACK_CHANNEL_ID",
          "COMPETITOR_INTEL_DIGEST_FROM",
          "COMPETITOR_INTEL_DIGEST_TO",
        ],
      };
    }

    if (emailConfigured && !apiKey) {
      return { sent: false, authRequired: true, missingEnv: "RESEND_API_KEY" };
    }

    const store = createSnapshotStore(process.env, watchConfig.storePath);
    return deliverCompetitorDigest({
      store,
      alerts,
      digest: watchConfig.digest,
      slackConnectUid: watchConfig.slackConnectUid,
      slackChannelId: watchConfig.slackChannelId,
      runDate,
      idempotencyKey,
      sendEmail:
        emailConfigured && emailFrom && apiKey
          ? async (payload) => {
              const resend = new Resend(apiKey);
              const { data, error } = await resend.emails.send(
                {
                  from: payload.from,
                  to: [...payload.to],
                  subject: payload.subject,
                  html: payload.html,
                  text: payload.text,
                },
                { idempotencyKey: payload.idempotencyKey },
              );
              return {
                id: data?.id,
                error: error ? { message: error.message, name: error.name } : undefined,
              };
            }
          : undefined,
    });
  },
});
