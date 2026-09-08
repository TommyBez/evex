import type { EmailTriageConfig } from "../email-config";
import {
  emailTriageConfig,
  missingEmailProviderEnv,
} from "../email-config";
import type { ConnectTokenMint, FetchLike } from "../oauth";
import { createGmailMailbox } from "./gmail";
import { createGraphMailbox } from "./graph";
import { createImapMailbox } from "./imap";
import type { ImapConnect } from "./imap-session";
import type { EmailMailbox, MailboxResult } from "./types";

export function createConfiguredMailbox(
  config: EmailTriageConfig = emailTriageConfig,
  options: {
    readonly fetchImpl?: FetchLike;
    readonly mintImpl?: ConnectTokenMint;
    readonly imapConnect?: ImapConnect;
  } = {},
): MailboxResult<EmailMailbox> {
  const missing = missingEmailProviderEnv(config);
  if (missing.length > 0) {
    return {
      ok: false,
      note: `Mailbox is not configured. Missing ${missing.join(", ")}.`,
      missingEnv: missing,
    };
  }

  if (config.provider === "gmail") {
    return {
      ok: true,
      value: createGmailMailbox(config, options.fetchImpl, options.mintImpl),
    };
  }
  if (config.provider === "outlook") {
    return {
      ok: true,
      value: createGraphMailbox(config, options.fetchImpl, options.mintImpl),
    };
  }
  if (config.provider === "imap") {
    return {
      ok: true,
      value: options.imapConnect
        ? createImapMailbox(config, options.imapConnect)
        : createImapMailbox(config),
    };
  }

  return {
    ok: false,
    note: "Set EMAIL_PROVIDER to gmail, outlook, or imap and the matching credentials.",
    missingEnv: ["EMAIL_PROVIDER"],
  };
}
