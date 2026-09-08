import type { EmailTriageConfig } from "../email-config";
import { draftsOnlyJson } from "../http";
import {
  createAccessTokenCache,
  MICROSOFT_CONNECT_SCOPES,
  mintConnectAccessToken,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import { graphCategoryForBucket, hasTriageMarker } from "../triage-buckets";
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

type GraphList = {
  readonly value?: readonly GraphMessage[];
  readonly "@odata.nextLink"?: string;
};

const GRAPH_API = "https://graph.microsoft.com/v1.0/me";
const GRAPH_ORIGIN = "https://graph.microsoft.com";

export function escapeODataStringLiteral(value: string): string {
  return value.replaceAll("'", "''");
}

export function createGraphMailbox(
  config: EmailTriageConfig,
  fetchImpl: FetchLike = fetch,
  mintImpl?: ConnectTokenMint,
): EmailMailbox {
  const accessToken = createAccessTokenCache(async () => {
    const connectorUid = config.outlook.connectUid;
    if (!connectorUid) {
      throw new Error("Microsoft Graph Connect is not configured.");
    }
    return mintConnectAccessToken({
      connectorUid,
      scopes: MICROSOFT_CONNECT_SCOPES,
      mintImpl,
    });
  });

  const authHeaders = async () => ({
    authorization: `Bearer ${await accessToken()}`,
  });

  const getUrl = async <T>(url: string): Promise<T> =>
    draftsOnlyJson<T>({
      url,
      headers: await authHeaders(),
      fetchImpl,
    });

  const get = async <T>(path: string): Promise<T> => getUrl<T>(`${GRAPH_API}${path}`);

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

  const conversationFilter = (threadId: string): string =>
    encodeURIComponent(`conversationId eq '${escapeODataStringLiteral(threadId)}'`);

  return {
    provider: "outlook",
    async listThreads({ max }) {
      const listed = await get<GraphList>(
        `/mailFolders/inbox/messages?$top=${max}&$select=id,conversationId,subject,bodyPreview,receivedDateTime,from,categories,isDraft`,
      );
      const candidates = new Set<string>();
      for (const message of listed.value ?? []) {
        if (!message.isDraft) {
          candidates.add(message.conversationId ?? message.id);
        }
      }
      const drafted = await collectDraftConversationIds(
        (url) => getUrl<GraphList>(url),
        candidates,
        max,
      );
      const seen = new Set<string>();
      const threads: InboxThread[] = [];
      for (const message of listed.value ?? []) {
        if (message.isDraft) {
          continue;
        }
        const id = message.conversationId ?? message.id;
        if (seen.has(id) || drafted.has(id) || hasTriageMarker(message.categories ?? [])) {
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
        `/messages?$filter=${conversationFilter(threadId)}&$select=id,conversationId,subject,bodyPreview,receivedDateTime,from,toRecipients,body,internetMessageId,categories,isDraft`,
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
        `/messages?$filter=${conversationFilter(threadId)}&$select=id,categories`,
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
        `/messages?$filter=${conversationFilter(input.threadId)}&$top=1&$select=id`,
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

async function collectDraftConversationIds(
  getUrl: (url: string) => Promise<GraphList>,
  candidates: ReadonlySet<string>,
  pageSize: number,
): Promise<Set<string>> {
  const drafted = new Set<string>();
  if (candidates.size === 0) {
    return drafted;
  }

  let url: string | undefined =
    `${GRAPH_API}/mailFolders/drafts/messages?$top=${pageSize}&$select=conversationId`;
  while (url) {
    const page = await getUrl(url);
    for (const message of page.value ?? []) {
      if (message.conversationId) {
        drafted.add(message.conversationId);
      }
    }
    if (Array.from(candidates).every((id) => drafted.has(id))) {
      break;
    }
    const nextLink: string | undefined = page["@odata.nextLink"];
    url = nextLink && isGraphNextLink(nextLink) ? nextLink : undefined;
  }
  return drafted;
}

function isGraphNextLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.origin === GRAPH_ORIGIN && parsed.protocol === "https:";
  } catch {
    return false;
  }
}
