import type { InvoiceChaseConfig } from "../chase-config";
import { draftsOnlyJson } from "../http";
import {
  createAccessTokenCache,
  MICROSOFT_CONNECT_SCOPES,
  mintConnectAccessToken,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import type { MailboxClient, ReminderDraftResult } from "./types";

const GRAPH_DRAFTS = "https://graph.microsoft.com/v1.0/me/mailFolders/drafts/messages";

type GraphDraft = { readonly id?: string };

export function createGraphMailbox(
  config: InvoiceChaseConfig,
  fetchImpl: FetchLike = fetch,
  mintImpl?: ConnectTokenMint,
): MailboxClient {
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

  return {
    provider: "outlook",
    async createReminderDraft(input) {
      const draft = await draftsOnlyJson<GraphDraft>({
        url: GRAPH_DRAFTS,
        method: "POST",
        headers: { authorization: `Bearer ${await accessToken()}` },
        body: {
          subject: input.subject,
          body: { contentType: "Text", content: input.body },
          toRecipients: [{ emailAddress: { address: input.to } }],
        },
        fetchImpl,
      });
      return {
        drafted: true,
        sent: false,
        provider: "outlook",
        draftId: draft.id ?? "unknown",
        invoiceId: input.invoiceId,
        mailbox: "Drafts",
      } satisfies ReminderDraftResult;
    },
  };
}
