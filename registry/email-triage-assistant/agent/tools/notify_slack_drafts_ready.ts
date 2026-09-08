import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import {
  emailTriageConfig,
  isSlackNotifyConfigured,
} from "../lib/email-config";
import { notifySlackDraftsReady } from "../lib/slack-notify";

const notifySlackDraftsReadyInput = z.object({
  draftCount: z.number().int().min(0).max(100),
  buckets: z.array(z.string().min(1).max(80)).max(20).optional(),
});

export default defineTool({
  description:
    "Optionally post a Slack drafts-ready note through the Eve Slack Connect channel. Always pauses for Eve human approval before the channel send. Does not send email. Skip when EMAIL_TRIAGE_SLACK_CONNECT_UID or EMAIL_TRIAGE_SLACK_CHANNEL_ID is unset.",
  inputSchema: notifySlackDraftsReadyInput,
  approval: always<z.infer<typeof notifySlackDraftsReadyInput>>(),
  async execute({ draftCount, buckets }) {
    if (!isSlackNotifyConfigured()) {
      return {
        notified: false,
        sent: false,
        skipped: true,
        note: "EMAIL_TRIAGE_SLACK_CONNECT_UID or EMAIL_TRIAGE_SLACK_CHANNEL_ID is unset. Slack notify is optional.",
      };
    }

    const result = await notifySlackDraftsReady({
      connectUid: emailTriageConfig.slackConnectUid ?? "",
      channelId: emailTriageConfig.slackChannelId ?? "",
      draftCount,
      buckets: buckets ?? [],
    });
    return {
      ...result,
      skipped: false,
    };
  },
});
