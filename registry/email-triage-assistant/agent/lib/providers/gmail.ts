import type { EmailTriageConfig } from "../email-config";
import { draftsOnlyJson } from "../http";
import type { FetchLike } from "../oauth";
import { refreshGoogleAccessToken } from "../oauth";
import { encodeBase64Url, buildRfc822 } from "../rfc822";
import { gmailLabelForBucket } from "../triage-buckets";
import type {
  BucketApplyResult,
  DraftReplyInput,
  DraftReplyResult,
  EmailMailbox,
  InboxThread,
  ThreadDetail,
  ThreadMessage,
} from "./types";
import type { ToneSample } from "../tone-profile";

type GmailHeader = { readonly name?: string; readonly value?: string };
type GmailPayload = {
  readonly headers?: readonly GmailHeader[];
  readonly body?: { readonly data?: string };
  readonly parts?: readonly GmailPayload[];
};
type GmailMessage = {
  readonly id: string;
  readonly threadId?: string;
  readonly snippet?: string;
  readonly labelIds?: readonly string[];
  readonly internalDate?: string;
  readonly payload?: GmailPayload;
};
type GmailThread = {
  readonly id: string;
  readonly snippet?: string;
  readonly messages?: readonly GmailMessage[];
};
type GmailList = { readonly threads?: readonly { readonly id: string }[] };
type GmailDraft = { readonly id?: string; readonly message?: { readonly id?: string } };
type GmailLabel = { readonly id?: string; readonly name?: string };
type GmailLabelList = { readonly labels?: readonly GmailLabel[] };

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

export function createGmailMailbox(
  config: EmailTriageConfig,
  fetchImpl: FetchLike = fetch,
): EmailMailbox {
  const accessToken = async (): Promise<string> => {
    const clientId = config.gmail.clientId;
    const clientSecret = config.gmail.clientSecret;
    const refreshToken = config.gmail.refreshToken;
    if (!(clientId && clientSecret && refreshToken)) {
      throw new Error("Gmail OAuth is not configured.");
    }
    return refreshGoogleAccessToken({
      clientId,
      clientSecret,
      refreshToken,
      fetchImpl,
    });
  };

  const authHeaders = async () => ({
    authorization: `Bearer ${await accessToken()}`,
  });

  const get = async <T>(path: string): Promise<T> =>
    draftsOnlyJson<T>({
      url: `${GMAIL_API}${path}`,
      headers: await authHeaders(),
      fetchImpl,
    });

  const post = async <T>(path: string, body: unknown): Promise<T> =>
    draftsOnlyJson<T>({
      url: `${GMAIL_API}${path}`,
      method: "POST",
      headers: await authHeaders(),
      body,
      fetchImpl,
    });

  return {
    provider: "gmail",
    async listThreads({ max }) {
      const listed = await get<GmailList>(
        `/threads?maxResults=${max}&q=${encodeURIComponent("in:inbox -in:drafts")}`,
      );
      const threads: InboxThread[] = [];
      for (const item of listed.threads ?? []) {
        const thread = await get<GmailThread>(`/threads/${item.id}?format=metadata`);
        const first = thread.messages?.[0];
        threads.push({
          id: thread.id,
          provider: "gmail",
          subject: header(first, "Subject") ?? "(no subject)",
          from: header(first, "From") ?? "",
          snippet: thread.snippet ?? first?.snippet ?? "",
          labels: first?.labelIds ?? [],
          receivedAt: first?.internalDate
            ? new Date(Number(first.internalDate)).toISOString()
            : null,
        });
      }
      return threads;
    },
    async readThread(threadId) {
      const thread = await get<GmailThread>(`/threads/${threadId}?format=full`);
      const messages = (thread.messages ?? []).map(toThreadMessage);
      const first = messages[0];
      return {
        id: thread.id,
        provider: "gmail",
        subject: first?.subject ?? "(no subject)",
        from: first?.from ?? "",
        snippet: thread.snippet ?? "",
        labels: thread.messages?.[0]?.labelIds ?? [],
        receivedAt: first?.date ?? null,
        messages,
      } satisfies ThreadDetail;
    },
    async sampleSent(max) {
      const listed = await get<GmailList>(
        `/threads?maxResults=${max}&q=${encodeURIComponent("in:sent")}`,
      );
      const samples: ToneSample[] = [];
      for (const item of listed.threads ?? []) {
        const thread = await get<GmailThread>(`/threads/${item.id}?format=full`);
        const last = thread.messages?.at(-1);
        if (!last) {
          continue;
        }
        samples.push({
          subject: header(last, "Subject") ?? "",
          body: decodeBody(last.payload),
        });
      }
      return samples;
    },
    async applyBucket(threadId, bucket) {
      const labelName = gmailLabelForBucket(bucket);
      const labels = await get<GmailLabelList>("/labels");
      let labelId = labels.labels?.find((label) => label.name === labelName)?.id;
      if (!labelId) {
        const created = await post<GmailLabel>("/labels", {
          name: labelName,
          labelListVisibility: "labelShow",
          messageListVisibility: "show",
        });
        labelId = created.id;
      }
      if (!labelId) {
        throw new Error(`Could not create Gmail label ${labelName}.`);
      }
      await post(`/threads/${threadId}/modify`, {
        addLabelIds: [labelId],
      });
      return {
        applied: true,
        sent: false,
        provider: "gmail",
        threadId,
        bucket,
        label: labelName,
      } satisfies BucketApplyResult;
    },
    async createDraftReply(input: DraftReplyInput) {
      const raw = encodeBase64Url(
        buildRfc822({
          from: config.gmail.user,
          to: input.to,
          subject: input.subject,
          body: input.body,
          inReplyTo: input.inReplyTo,
          references: input.inReplyTo,
        }),
      );
      const draft = await post<GmailDraft>("/drafts", {
        message: {
          raw,
          threadId: input.threadId,
        },
      });
      return {
        drafted: true,
        sent: false,
        provider: "gmail",
        draftId: draft.id ?? draft.message?.id ?? "unknown",
        threadId: input.threadId,
        mailbox: "Drafts",
      } satisfies DraftReplyResult;
    },
  };
}

function header(message: GmailMessage | undefined, name: string): string | null {
  const match = message?.payload?.headers?.find(
    (item) => item.name?.toLowerCase() === name.toLowerCase(),
  );
  return match?.value ?? null;
}

function toThreadMessage(message: GmailMessage): ThreadMessage {
  return {
    id: message.id,
    from: header(message, "From") ?? "",
    to: header(message, "To") ?? "",
    subject: header(message, "Subject") ?? "",
    body: decodeBody(message.payload),
    date: header(message, "Date"),
    messageIdHeader: header(message, "Message-ID") ?? undefined,
  };
}

function decodeBody(payload: GmailPayload | undefined): string {
  if (!payload) {
    return "";
  }
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  for (const part of payload.parts ?? []) {
    const text = decodeBody(part);
    if (text) {
      return text;
    }
  }
  return "";
}

function decodeBase64Url(value: string): string {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  return Buffer.from(padded, "base64").toString("utf8");
}
