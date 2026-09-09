import { connectSlackCredentials } from "@vercel/connect/eve";
import { callSlackApi } from "eve/channels/slack";

import type { IcpScore } from "./score";
import type { EnrichedLead } from "./enrich";

export type SlackChannelSend = (input: {
  readonly connectUid: string;
  readonly channelId: string;
  readonly text: string;
}) => Promise<{ readonly ok: boolean; readonly error?: string }>;

export const postSlackHotLead: SlackChannelSend = async ({
  connectUid,
  channelId,
  text,
}) => {
  const { botToken } = connectSlackCredentials(connectUid);
  const response = await callSlackApi({
    botToken,
    operation: "chat.postMessage",
    body: { channel: channelId, text },
  });
  if (!response.ok) {
    return {
      ok: false,
      error: String(response.error ?? "Slack chat.postMessage failed."),
    };
  }
  return { ok: true };
};

export function buildHotLeadSlackText(input: {
  readonly lead: EnrichedLead;
  readonly score: IcpScore;
}): string {
  const name = [input.lead.lead.firstName, input.lead.lead.lastName]
    .filter(Boolean)
    .join(" ");
  const title = input.lead.lead.title ? ` · ${input.lead.lead.title}` : "";
  return [
    `Hot inbound lead (${input.score.score}/100)`,
    `${name || input.lead.email}${title}`,
    `${input.lead.company} · ${input.lead.email}`,
    input.score.reasons.slice(0, 3).join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}
