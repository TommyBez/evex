import { Resend } from "resend";
import { defineTool } from "eve/tools";
import { z } from "zod";

import { buildDigestDraft, utcDateStamp } from "../lib/digest.js";
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

const sentKeys = new Map<
  string,
  { readonly slackSent: boolean; readonly emailMessageId?: string }
>();

export default defineTool({
  description:
    "Send the scored competitor digest through the configured Slack incoming webhook and/or Resend email. Requires confirmSend=true and a stable idempotencyKey so a replayed step never duplicates delivery. Recipients and webhook URL come from configuration. Always call preview_digest first. Do not send when no change cleared the thresholds.",
  inputSchema: z.object({
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
        "Stable unique key for this digest. Reused across retries of the same step so a replayed send does not duplicate Slack or email.",
      ),
  }),
  async execute({ changes, runDate, confirmSend, idempotencyKey }) {
    if (!confirmSend) {
      return {
        notConfirmed: true,
        note: "confirmSend must be true to send. Call preview_digest to review the digest first.",
      };
    }

    const alerts = changes.filter((change) => change.clearsThreshold && !change.isBaseline);
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

    const cached = sentKeys.get(idempotencyKey);
    if (cached) {
      return {
        replayed: true,
        idempotencyKey,
        slackSent: cached.slackSent,
        emailMessageId: cached.emailMessageId,
      };
    }

    const draft = buildDigestDraft(alerts, watchConfig, runDate ?? utcDateStamp());
    let slackSent = false;
    let emailMessageId: string | undefined;

    if (slackUrl) {
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
    }

    if (emailConfigured && emailFrom && apiKey) {
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
    }

    sentKeys.set(idempotencyKey, { slackSent, emailMessageId });
    return {
      sent: true,
      idempotencyKey,
      slackSent,
      emailMessageId,
      changeCount: draft.changeCount,
    };
  },
});
