const SEND_PATH =
  /(?:^|\/)(?:messages\/send|drafts\/send|sendMail|send)(?:\/|$|\?)/i;
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

export function assertNeverEmailLead(url: string, method = "GET"): void {
  if (isForbiddenSendUrl(url)) {
    throw new Error(
      `Refused ${method} ${url}: this agent never emails the lead. Slack is the only outbound notify, and only for hot scores.`,
    );
  }
}

export function assertNotEmailIntent(intent: string | undefined): void {
  const normalized = intent?.trim().toLowerCase() ?? "";
  if (
    normalized === "send" ||
    normalized === "email" ||
    normalized === "sendmail" ||
    normalized === "smtp"
  ) {
    throw new Error(
      "Refused email intent. This agent never auto-emails the lead.",
    );
  }
}
