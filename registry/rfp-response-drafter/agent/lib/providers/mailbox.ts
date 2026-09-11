import {
  missingMailboxEnv,
  rfpResponseConfig,
  type RfpResponseConfig,
} from "../rfp-config";
import type { ConnectTokenMint, FetchLike } from "../oauth";
import { createGmailMailbox } from "./gmail";
import { createGraphMailbox } from "./graph";
import type { ClientResult, MailboxClient } from "./types";

export function createConfiguredMailbox(
  config: RfpResponseConfig = rfpResponseConfig,
  options: {
    readonly fetchImpl?: FetchLike;
    readonly mintImpl?: ConnectTokenMint;
  } = {},
): ClientResult<MailboxClient> {
  const missing = missingMailboxEnv(config);
  if (missing.length > 0) {
    return {
      ok: false,
      note: `Mailbox is not configured. Missing ${missing.join(", ")}.`,
      missingEnv: missing,
    };
  }

  if (config.mailboxProvider === "gmail") {
    return {
      ok: true,
      value: createGmailMailbox(config, options.fetchImpl, options.mintImpl),
    };
  }
  if (config.mailboxProvider === "outlook") {
    return {
      ok: true,
      value: createGraphMailbox(config, options.fetchImpl, options.mintImpl),
    };
  }

  return {
    ok: false,
    note: "Set RFP_RESPONSE_MAILBOX_PROVIDER to gmail or outlook and the matching Connect UID.",
    missingEnv: ["RFP_RESPONSE_MAILBOX_PROVIDER"],
  };
}
