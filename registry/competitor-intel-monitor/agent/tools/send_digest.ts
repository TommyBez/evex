import { Resend } from "resend";
import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { buildDigestDraft, utcDateStamp } from "../lib/digest.js";
import { createSnapshotStore } from "../lib/snapshot-store.js";
import { selectDigestAlerts } from "../lib/thresholds.js";
import { watchConfig } from "../lib/watch-config.js";

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
  runDate: z.string().min(1).optional(),
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
    "Send the scored competitor digest through the configured Slack incoming webhook and/or Resend email. Always pauses for Eve human approval before any Slack or Resend call. Requires confirmSend=true and a stable idempotencyKey from preview_digest so a replayed step never duplicates delivery. Recipients and webhook URL come from configuration. Always call preview_digest first. Do not send when no change cleared the thresholds. After a successful send, pending snapshots for those URLs become the new baseline.",
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

    const slackUrl = watchConfig.slackWebhookUrl;
    const emailFrom = watchConfig.digest.from;
    const emailTo = watchConfig.digest.to;
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const slackConfigured = Boolean(slackUrl);
    const emailConfigured = Boolean(emailFrom && emailTo.length > 0);

    if (!slackConfigured && !emailConfigured) {
      return {
        sent: false,
        notConfigured: true,
        missingEnv: [
          "COMPETITOR_INTEL_SLACK_WEBHOOK_URL",
          "COMPETITOR_INTEL_DIGEST_FROM",
          "COMPETITOR_INTEL_DIGEST_TO",
        ],
      };
    }

    if (emailConfigured && !apiKey) {
      return { sent: false, authRequired: true, missingEnv: "RESEND_API_KEY" };
    }

    const store = createSnapshotStore(process.env, watchConfig.storePath);
    const cached = await store.getDelivery(idempotencyKey);
    const emailComplete = Boolean(cached?.emailMessageId);
    const slackComplete = Boolean(cached?.slackSent);
    if (cached && (!slackConfigured || slackComplete) && (!emailConfigured || emailComplete)) {
      return {
        replayed: true,
        idempotencyKey,
        slackSent: cached.slackSent,
        emailMessageId: cached.emailMessageId,
      };
    }

    const draft = buildDigestDraft(alerts, watchConfig, runDate ?? utcDateStamp());
    let slackSent = slackComplete;
    let emailMessageId = cached?.emailMessageId;

    if (slackUrl && !slackSent) {
      const slackResponse = await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draft.slackText }),
      });
      if (!slackResponse.ok) {
        return {
          sent: false,
          idempotencyKey,
          channel: "slack",
          error: { message: `Slack webhook returned HTTP ${slackResponse.status}`, name: "slack_webhook_failed" },
        };
      }
      slackSent = true;
      await store.setDelivery(idempotencyKey, { slackSent: true, emailMessageId });
    }

    if (emailConfigured && emailFrom && apiKey && !emailMessageId) {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send(
        {
          from: emailFrom,
          to: [...emailTo],
          subject: draft.subject,
          html: draft.html,
          text: draft.text,
        },
        { idempotencyKey },
      );
      if (error) {
        return {
          sent: false,
          idempotencyKey,
          slackSent,
          error: { message: error.message, name: error.name },
        };
      }
      emailMessageId = data.id;
      await store.setDelivery(idempotencyKey, { slackSent, emailMessageId });
    }

    for (const alert of alerts) {
      await store.commitPending(alert.url);
    }

    return {
      sent: true,
      idempotencyKey,
      slackSent,
      emailMessageId,
      changeCount: draft.changeCount,
    };
  },
});
