import { connectSlackCredentials } from "@vercel/connect/eve";
import { callSlackApi } from "eve/channels/slack";

export type SlackChannelSend = (input: {
  readonly connectUid: string;
  readonly channelId: string;
  readonly text: string;
}) => Promise<{ readonly ok: boolean; readonly error?: string }>;

export const postSlackMessage: SlackChannelSend = async ({
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

export const escapeSlackMrkdwn = (value: string): string =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export function buildSmeSlackText(input: {
  readonly rfpTitle: string;
  readonly questions: readonly string[];
}): string {
  const title = escapeSlackMrkdwn(input.rfpTitle);
  const lines = input.questions.map(
    (question, index) => `${index + 1}. ${escapeSlackMrkdwn(question)}`,
  );
  return [
    `RFP SME review: ${title}`,
    "Open questions before an approved draft write-back:",
    ...lines,
    "Reply in this thread. The agent pauses until SME approval.",
  ].join("\n");
}
