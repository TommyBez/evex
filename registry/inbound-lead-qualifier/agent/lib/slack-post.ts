import { connectSlackCredentials } from "@vercel/connect/eve";
import { callSlackApi } from "eve/channels/slack";

import type { IcpScore } from "./score";
import type { EnrichedLead } from "./enrich";

export type SlackChannelSend = (input: {
  readonly connectUid: string;
  readonly channelId: string;
  readonly text: string;
}) => Promise<{ readonly ok: boolean; readonly error?: string }>;

export type SlackPostDeps = {
  readonly credentials?: (connectUid: string) => { readonly botToken: string };
  readonly callApi?: (input: {
    readonly botToken: string;
    readonly operation: string;
    readonly body: Record<string, unknown>;
  }) => Promise<{ readonly ok: boolean; readonly error?: string }>;
};

export const postSlackHotLead = async (
  input: {
    readonly connectUid: string;
    readonly channelId: string;
    readonly text: string;
  },
  deps: SlackPostDeps = {},
): Promise<{ readonly ok: boolean; readonly error?: string }> => {
  try {
    const resolve = deps.credentials ?? connectSlackCredentials;
    const callApi = deps.callApi ?? callSlackApi;
    const { botToken } = resolve(input.connectUid);
    if (!botToken) {
      return { ok: false, error: "Slack bot token is missing." };
    }
    const response = await callApi({
      botToken: botToken as never,
      operation: "chat.postMessage",
      body: { channel: input.channelId, text: input.text },
    });
    if (!response.ok) {
      return {
        ok: false,
        error: String(response.error ?? "Slack chat.postMessage failed."),
      };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Slack chat.postMessage failed.",
    };
  }
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
