import type { InvoiceChaseConfig } from "../chase-config";
import { draftsOnlyJson } from "../http";
import {
  createAccessTokenCache,
  GMAIL_CONNECT_SCOPES,
  mintConnectAccessToken,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import { buildRfc822, encodeBase64Url } from "../rfc822";
import type { MailboxClient, ReminderDraftResult } from "./types";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

type GmailDraft = {
  readonly id?: string;
  readonly message?: { readonly id?: string };
};

export function createGmailMailbox(
  config: InvoiceChaseConfig,
  fetchImpl: FetchLike = fetch,
  mintImpl?: ConnectTokenMint,
): MailboxClient {
  const accessToken = createAccessTokenCache(async () => {
    const connectorUid = config.gmail.connectUid;
    if (!connectorUid) {
      throw new Error("Gmail Connect is not configured.");
    }
    return mintConnectAccessToken({
      connectorUid,
      scopes: GMAIL_CONNECT_SCOPES,
      mintImpl,
    });
  });

  return {
    provider: "gmail",
    async createReminderDraft(input) {
      const raw = encodeBase64Url(
        buildRfc822({
          from: config.gmail.user,
          to: input.to,
          subject: input.subject,
          body: input.body,
        }),
      );
      const draft = await draftsOnlyJson<GmailDraft>({
        url: `${GMAIL_API}/drafts`,
        method: "POST",
        headers: { authorization: `Bearer ${await accessToken()}` },
        body: { message: { raw } },
        fetchImpl,
      });
      return {
        drafted: true,
        sent: false,
        provider: "gmail",
        draftId: draft.id ?? draft.message?.id ?? "unknown",
        invoiceId: input.invoiceId,
        mailbox: "Drafts",
      } satisfies ReminderDraftResult;
    },
  };
}
