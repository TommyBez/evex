import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { emailTriageConfig } from "../lib/email-config";
import { notifySlackDraftsReady } from "../lib/slack-notify";

const notifySlackDraftsReadyInput = z.object({
  draftCount: z.number().int().min(0).max(100),
  buckets: z.array(z.string().min(1).max(80)).max(20).optional(),
});

export default defineTool({
  description:
    "Optionally post a Slack incoming-webhook note that drafts are waiting in Drafts. Always pauses for Eve human approval before the webhook call. Does not send email. Skip when EMAIL_TRIAGE_SLACK_WEBHOOK_URL is unset.",
  inputSchema: notifySlackDraftsReadyInput,
  approval: always<z.infer<typeof notifySlackDraftsReadyInput>>(),
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
