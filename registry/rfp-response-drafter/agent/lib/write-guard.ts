const SEND_PATH =
  /(?:^|\/)(?:messages\/send|drafts\/send|sendMail|send)(?:\/|$|\?)/i;
const SMTP_PORT = new Set([25, 465, 587, 2525]);
const SMTP_HOST = /(?:^|\.)smtp\./i;
const PORTAL_SUBMIT_PATH =
  /(?:^|\/)(?:submit|portal-submit|rfp-submit|submit-response|submitProposal)(?:\/|$|\?)/i;
const PORTAL_HOST =
  /rfp.?portal|proposal.?portal|vendor.?portal|sam\.gov|ariba|coupa|ungm/i;
const PASTE_INTENT = /^(?:paste|clipboard|copy[-_]?paste|paste[-_]?text)$/i;
const SEND_INTENT = /^(?:send|sendmail|smtp)$/i;
const SUBMIT_INTENT = /^(?:submit|portal|portal[-_]?submit)$/i;

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

export function isForbiddenPortalSubmitUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      PORTAL_HOST.test(parsed.hostname) ||
      PORTAL_SUBMIT_PATH.test(`${parsed.pathname}${parsed.search}`)
    );
  } catch {
    return PORTAL_SUBMIT_PATH.test(url) || PORTAL_HOST.test(url);
  }
}

export function assertDraftsOnlyHttp(url: string, method = "GET"): void {
  if (isForbiddenSendUrl(url)) {
    throw new Error(
      `Refused ${method} ${url}: this agent never sends mail. Use Gmail drafts.create or Graph draft messages only.`,
    );
  }
  if (isForbiddenPortalSubmitUrl(url)) {
    throw new Error(
      `Refused ${method} ${url}: this agent never submits a portal response. Write-back is a Drive draft Doc or mailbox Drafts only.`,
    );
  }
}

export function assertNotSendIntent(intent: string | undefined): void {
  const normalized = intent?.trim().toLowerCase() ?? "";
  if (SEND_INTENT.test(normalized)) {
    throw new Error(
      "Refused send intent. Drafts stay in Drafts. A human sends from the mailbox.",
    );
  }
}

export function assertNotPortalSubmitIntent(intent: string | undefined): void {
  const normalized = intent?.trim().toLowerCase() ?? "";
  if (SUBMIT_INTENT.test(normalized)) {
    throw new Error(
      "Refused portal submit. This agent writes an approved Drive draft Doc or mailbox Drafts only.",
    );
  }
}

export function assertNotPasteIntent(intent: string | undefined): void {
  const normalized = intent?.trim().toLowerCase() ?? "";
  if (PASTE_INTENT.test(normalized)) {
    throw new Error(
      "Refused paste-to-text write-back. Use write_approved_draft for a Drive Doc or mailbox Drafts.",
    );
  }
}

export function assertDraftWriteIntent(intent: string | undefined): void {
  assertNotSendIntent(intent);
  assertNotPortalSubmitIntent(intent);
  assertNotPasteIntent(intent);
  const normalized = intent?.trim().toLowerCase() ?? "draft";
  if (normalized !== "draft") {
    throw new Error("intent must be draft. This tool only writes approved drafts.");
  }
}
