import { connectSlackCredentials } from "@vercel/connect/eve";
import { callSlackApi } from "eve/channels/slack";

export type SlackChannelSend = (input: {
  readonly connectUid: string;
  readonly channelId: string;
  readonly text: string;
}) => Promise<{ readonly ok: boolean; readonly error?: string }>;

export const postSlackDigest: SlackChannelSend = async ({
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
