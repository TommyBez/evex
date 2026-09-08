import { connectSlackCredentials } from "@vercel/connect/eve";
import { callSlackApi } from "eve/channels/slack";

export type SlackDraftsReadySend = (input: {
  readonly connectUid: string;
  readonly channelId: string;
  readonly text: string;
}) => Promise<{ readonly ok: boolean; readonly error?: string }>;

export type SlackNotifyInput = {
  readonly connectUid: string;
  readonly channelId: string;
  readonly draftCount: number;
  readonly buckets: readonly string[];
  readonly sendImpl?: SlackDraftsReadySend;
};

export type SlackNotifyResult =
  | { readonly notified: true; readonly sent: false }
  | { readonly notified: false; readonly sent: false; readonly note: string };

export function buildSlackDraftsReadyText(
  draftCount: number,
  buckets: readonly string[],
): string {
  return [
    `${draftCount} inbox draft${draftCount === 1 ? "" : "s"} ready in Drafts.`,
    buckets.length > 0 ? `Buckets: ${buckets.join(", ")}.` : null,
    "Nothing was sent. Review the drafts in the mailbox and send them yourself.",
  ]
    .filter(Boolean)
    .join(" ");
}

export const postSlackDraftsReadyNote: SlackDraftsReadySend = async ({
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

export async function notifySlackDraftsReady(
  input: SlackNotifyInput,
): Promise<SlackNotifyResult> {
  const text = buildSlackDraftsReadyText(input.draftCount, input.buckets);
  const sendImpl = input.sendImpl ?? postSlackDraftsReadyNote;

  try {
    const result = await sendImpl({
      connectUid: input.connectUid,
      channelId: input.channelId,
      text,
    });

    if (!result.ok) {
      return {
        notified: false,
        sent: false,
        note: result.error ?? "Slack channel send failed.",
      };
    }

    return { notified: true, sent: false };
  } catch (error) {
    return {
      notified: false,
      sent: false,
      note:
        error instanceof Error
          ? `Slack channel send failed: ${error.message}`
          : "Slack channel send failed.",
    };
  }
}
