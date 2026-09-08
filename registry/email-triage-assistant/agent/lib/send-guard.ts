const SEND_PATH = /(?:^|\/)(?:messages\/send|drafts\/send|sendMail|send)(?:\/|$|\?)/i;
const SMTP_PORT = new Set([25, 465, 587, 2525]);
const SMTP_HOST = /(?:^|\.)smtp\./i;

export function isForbiddenSendUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return SEND_PATH.test(`${parsed.pathname}${parsed.search}`);
  } catch {
    return SEND_PATH.test(url);
  }
}

export function isForbiddenSmtpEndpoint(host: string, port: number): boolean {
  return SMTP_PORT.has(port) || SMTP_HOST.test(host.trim());
}

export function assertDraftsOnlyHttp(url: string, method = "GET"): void {
  if (isForbiddenSendUrl(url)) {
    throw new Error(
      `Refused ${method} ${url}: this agent never sends mail. Use drafts.create, Graph createReply, or IMAP APPEND to Drafts.`,
    );
  }
}

export function assertDraftsOnlyImap(host: string, port: number): void {
  if (isForbiddenSmtpEndpoint(host, port)) {
    throw new Error(
      `Refused SMTP endpoint ${host}:${port}. IMAP APPEND to Drafts is the only outbound mailbox write.`,
    );
  }
}

export function assertNotSendIntent(intent: string | undefined): void {
  const normalized = intent?.trim().toLowerCase() ?? "";
  if (
    normalized === "send" ||
    normalized === "sendmail" ||
    normalized === "smtp"
  ) {
    throw new Error(
      "Refused send intent. Drafts stay in Drafts. A human sends from the mailbox.",
    );
  }
}
