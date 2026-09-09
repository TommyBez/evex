import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { enrichLead } from "../lib/enrich";
import {
  inboundLeadConfig,
  isSlackNotifyConfigured,
} from "../lib/lead-config";
import { scoreIcp } from "../lib/score";
import { buildHotLeadSlackText, postSlackHotLead } from "../lib/slack-post";

const leadFieldsSchema = z.object({
  id: z.string().max(120).optional(),
  email: z.string().max(254).optional(),
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  company: z.string().max(160).optional(),
  title: z.string().max(160).optional(),
  phone: z.string().max(40).optional(),
  message: z.string().max(1000).optional(),
  source: z.string().max(40).optional(),
  submittedAt: z.string().max(40).optional(),
});

const notifySlackHotLeadInput = z.object({
  lead: leadFieldsSchema,
  band: z.enum(["hot", "warm", "cold", "unscored"]).optional(),
});

export default defineTool({
  description:
    "Post a Slack note through the Eve Slack Connect channel for a hot inbound lead only. Always pauses for Eve human approval. Warm, cold, and unscored leads are refused. Never emails the lead.",
  inputSchema: notifySlackHotLeadInput,
  approval: always<z.infer<typeof notifySlackHotLeadInput>>(),
  async execute({ lead, band }) {
    const enriched = enrichLead(lead, inboundLeadConfig);
    if (!enriched.enriched) {
      return {
        notified: false,
        emailedLead: false,
        skipped: "fail-closed",
        note: enriched.note,
      };
    }

    const scored = scoreIcp(enriched.value, inboundLeadConfig);
    const effectiveBand = band ?? scored.band;
    if (effectiveBand !== "hot" || !scored.hot) {
      return {
        notified: false,
        emailedLead: false,
        skipped: "not-hot",
        band: effectiveBand,
        score: scored.score,
        note: "Slack notify is hot-only. Warm, cold, and unscored leads are not posted.",
      };
    }

    if (!isSlackNotifyConfigured()) {
      return {
        notified: false,
        emailedLead: false,
        skipped: "slack-unset",
        note: "INBOUND_LEAD_SLACK_CONNECT_UID or INBOUND_LEAD_SLACK_CHANNEL_ID is unset. Slack notify is optional.",
      };
    }

    const result = await postSlackHotLead({
      connectUid: inboundLeadConfig.slackConnectUid ?? "",
      channelId: inboundLeadConfig.slackChannelId ?? "",
      text: buildHotLeadSlackText({ lead: enriched.value, score: scored }),
    });

    return {
      notified: result.ok,
      emailedLead: false,
      band: "hot",
      score: scored.score,
      error: result.error,
    };
  },
});
