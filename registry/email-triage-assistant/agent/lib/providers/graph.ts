import type { EmailTriageConfig } from "../email-config";
import { draftsOnlyJson } from "../http";
import type { FetchLike } from "../oauth";
import { refreshMicrosoftAccessToken } from "../oauth";
import { graphCategoryForBucket } from "../triage-buckets";
import type { ToneSample } from "../tone-profile";
import type {
  BucketApplyResult,
  DraftReplyInput,
  DraftReplyResult,
  EmailMailbox,
  InboxThread,
  ThreadDetail,
  ThreadMessage,
} from "./types";

type GraphMessage = {
  readonly id: string;
  readonly conversationId?: string;
  readonly subject?: string;
  readonly bodyPreview?: string;
  readonly receivedDateTime?: string;
  readonly from?: { readonly emailAddress?: { readonly address?: string; readonly name?: string } };
  readonly toRecipients?: readonly {
    readonly emailAddress?: { readonly address?: string };
  }[];
  readonly body?: { readonly content?: string };
  readonly internetMessageId?: string;
  readonly categories?: readonly string[];
  readonly isDraft?: boolean;
};

type GraphList = { readonly value?: readonly GraphMessage[] };

const GRAPH_API = "https://graph.microsoft.com/v1.0/me";

export function createGraphMailbox(
  config: EmailTriageConfig,
  fetchImpl: FetchLike = fetch,
): EmailMailbox {
  const accessToken = async (): Promise<string> => {
    const clientId = config.outlook.clientId;
    const clientSecret = config.outlook.clientSecret;
    const tenantId = config.outlook.tenantId;
    const refreshToken = config.outlook.refreshToken;
    if (!(clientId && clientSecret && tenantId && refreshToken)) {
      throw new Error("Microsoft Graph OAuth is not configured.");
    }
    return refreshMicrosoftAccessToken({
      clientId,
      clientSecret,
      tenantId,
      refreshToken,
      fetchImpl,
    });
  };

  const authHeaders = async () => ({
    authorization: `Bearer ${await accessToken()}`,
  });

  const get = async <T>(path: string): Promise<T> =>
    draftsOnlyJson<T>({
      url: `${GRAPH_API}${path}`,
      headers: await authHeaders(),
      fetchImpl,
    });

  const post = async <T>(path: string, body: unknown): Promise<T> =>
    draftsOnlyJson<T>({
      url: `${GRAPH_API}${path}`,
      method: "POST",
      headers: await authHeaders(),
      body,
      fetchImpl,
    });

  const patch = async <T>(path: string, body: unknown): Promise<T> =>
    draftsOnlyJson<T>({
      url: `${GRAPH_API}${path}`,
      method: "PATCH",
      headers: await authHeaders(),
      body,
      fetchImpl,
    });

  return {
    provider: "outlook",
    async listThreads({ max }) {
      const listed = await get<GraphList>(
        `/mailFolders/inbox/messages?$top=${max}&$select=id,conversationId,subject,bodyPreview,receivedDateTime,from,categories,isDraft`,
      );
      const seen = new Set<string>();
      const threads: InboxThread[] = [];
      for (const message of listed.value ?? []) {
        if (message.isDraft) {
          continue;
        }
        const id = message.conversationId ?? message.id;
        if (seen.has(id)) {
          continue;
        }
        seen.add(id);
        threads.push({
          id,
          provider: "outlook",
          subject: message.subject ?? "(no subject)",
          from: formatFrom(message),
          snippet: message.bodyPreview ?? "",
          labels: message.categories ?? [],
          receivedAt: message.receivedDateTime ?? null,
        });
      }
      return threads;
    },
    async readThread(threadId) {
      const listed = await get<GraphList>(
        `/messages?$filter=${encodeURIComponent(`conversationId eq '${threadId}'`)}&$select=id,conversationId,subject,bodyPreview,receivedDateTime,from,toRecipients,body,internetMessageId,categories,isDraft`,
      );
      const messages = (listed.value ?? [])
        .filter((message) => !message.isDraft)
        .map(toThreadMessage);
      const first = messages[0];
      return {
        id: threadId,
        provider: "outlook",
        subject: first?.subject ?? "(no subject)",
        from: first?.from ?? "",
        snippet: first?.body.slice(0, 240) ?? "",
        labels: listed.value?.[0]?.categories ?? [],
        receivedAt: first?.date ?? null,
        messages,
      } satisfies ThreadDetail;
    },
    async sampleSent(max) {
      const listed = await get<GraphList>(
        `/mailFolders/sentitems/messages?$top=${max}&$select=subject,body`,
      );
      return (listed.value ?? []).map((message) => ({
        subject: message.subject ?? "",
        body: stripHtml(message.body?.content ?? ""),
      })) satisfies ToneSample[];
    },
    async applyBucket(threadId, bucket) {
      const category = graphCategoryForBucket(bucket);
      const listed = await get<GraphList>(
        `/messages?$filter=${encodeURIComponent(`conversationId eq '${threadId}'`)}&$select=id,categories`,
      );
      for (const message of listed.value ?? []) {
        const categories = new Set(message.categories ?? []);
        categories.add(category);
        await patch(`/messages/${message.id}`, {
          categories: [...categories],
        });
      }
      return {
        applied: true,
        sent: false,
        provider: "outlook",
        threadId,
        bucket,
        label: category,
      } satisfies BucketApplyResult;
    },
    async createDraftReply(input: DraftReplyInput) {
      const listed = await get<GraphList>(
        `/messages?$filter=${encodeURIComponent(`conversationId eq '${input.threadId}'`)}&$top=1&$select=id`,
      );
      const latest = listed.value?.[0];
      if (!latest) {
        throw new Error(`No Outlook message found for thread ${input.threadId}.`);
      }
      const draft = await post<GraphMessage>(`/messages/${latest.id}/createReply`, {});
      await patch(`/messages/${draft.id}`, {
        subject: input.subject,
        body: { contentType: "Text", content: input.body },
        toRecipients: [
          { emailAddress: { address: input.to } },
        ],
      });
      return {
        drafted: true,
        sent: false,
        provider: "outlook",
        draftId: draft.id,
        threadId: input.threadId,
        mailbox: "Drafts",
      } satisfies DraftReplyResult;
    },
  };
}

function formatFrom(message: GraphMessage): string {
  const name = message.from?.emailAddress?.name;
  const address = message.from?.emailAddress?.address ?? "";
  return name ? `${name} <${address}>` : address;
}

function toThreadMessage(message: GraphMessage): ThreadMessage {
  return {
    id: message.id,
    from: formatFrom(message),
    to:
      message.toRecipients
        ?.map((recipient) => recipient.emailAddress?.address)
        .filter((address): address is string => Boolean(address))
        .join(", ") ?? "",
    subject: message.subject ?? "",
    body: stripHtml(message.body?.content ?? ""),
    date: message.receivedDateTime ?? null,
    messageIdHeader: message.internetMessageId,
  };
}

function stripHtml(value: string): string {
  return value.replaceAll(/<[^>]+>/g, " ").replaceAll(/\s+/g, " ").trim();
}
