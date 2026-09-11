import { draftsOnlyJson } from "../http";
import {
  createAccessTokenCache,
  GMAIL_CONNECT_SCOPES,
  mintConnectAccessToken,
  type ConnectTokenMint,
  type FetchLike,
} from "../oauth";
import type { RfpResponseConfig } from "../rfp-config";
import { buildRfc822, encodeBase64Url } from "../rfc822";
import type { MailboxClient, MailboxDraftResult } from "./types";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

type GmailDraft = {
  readonly id?: string;
  readonly message?: { readonly id?: string };
};

export function createGmailMailbox(
  config: RfpResponseConfig,
  fetchImpl: FetchLike = fetch,
  mintImpl?: ConnectTokenMint,
): MailboxClient {
  const accessToken = createAccessTokenCache(async () => {
    const connectorUid = config.google.connectUid;
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
    async createDraft(input) {
      const raw = encodeBase64Url(
        buildRfc822({
          from: config.google.gmailUser,
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
      if (!draft.id) {
        throw new Error("Gmail drafts.create did not return a draft id.");
      }
      return {
        drafted: true,
        sent: false,
        submitted: false,
        provider: "gmail",
        draftId: draft.id,
        rfpId: input.rfpId,
        mailbox: "Drafts",
      } satisfies MailboxDraftResult;
    },
  };
}
