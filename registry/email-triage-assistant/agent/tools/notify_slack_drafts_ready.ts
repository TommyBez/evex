import { defineTool } from "eve/tools";
import { z } from "zod";

import { emailTriageConfig } from "../lib/email-config";
import { notifySlackDraftsReady } from "../lib/slack-notify";

export default defineTool({
  description:
    "Optionally post a Slack incoming-webhook note that drafts are waiting in Drafts. Does not send email. Skip when EMAIL_TRIAGE_SLACK_WEBHOOK_URL is unset.",
  inputSchema: z.object({
    draftCount: z.number().int().min(0).max(100),
    buckets: z.array(z.string().min(1).max(80)).max(20).optional(),
  }),
  async execute({ draftCount, buckets }) {
    const webhookUrl = emailTriageConfig.slackWebhookUrl;
    if (!webhookUrl) {
      return {
        notified: false,
        sent: false,
        skipped: true,
        note: "EMAIL_TRIAGE_SLACK_WEBHOOK_URL is unset. Slack notify is optional.",
      };
    }

    const result = await notifySlackDraftsReady({
      webhookUrl,
      draftCount,
      buckets: buckets ?? [],
    });
    return {
      ...result,
      skipped: false,
    };
  },
});
