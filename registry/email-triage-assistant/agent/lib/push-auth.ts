import type { FetchLike } from "./oauth";
import { parsePushEvent } from "./push-events";
import { readWebhookSecret, webhookSecretsMatch } from "./webhook-auth";

export type InboxPushAuthMethod =
  | "shared-secret"
  | "gmail-oidc"
  | "graph-client-state";

export type InboxPushAuthResult =
  | { readonly authorized: true; readonly method: InboxPushAuthMethod }
  | { readonly authorized: false };

const GOOGLE_ISSUERS = new Set([
  "accounts.google.com",
  "https://accounts.google.com",
]);

export async function authorizeInboxPush(input: {
  readonly request: Request;
  readonly body: unknown;
  readonly expectedSecret: string | undefined;
  readonly fetchImpl?: FetchLike;
}): Promise<InboxPushAuthResult> {
  const headerSecret = readWebhookSecret(input.request);
  if (webhookSecretsMatch(headerSecret, input.expectedSecret)) {
    return { authorized: true, method: "shared-secret" };
  }

  const parsed = parsePushEvent({ body: input.body });
  if ("ignored" in parsed || "validationToken" in parsed) {
    return { authorized: false };
  }

  if (parsed.source === "gmail") {
    const token = bearerToken(input.request);
    if (
      token &&
      (await verifyGoogleOidcToken(token, input.fetchImpl ?? fetch))
    ) {
      return { authorized: true, method: "gmail-oidc" };
    }
    return { authorized: false };
  }

  if (parsed.source === "outlook") {
    const clientState = graphClientState(input.body);
    if (webhookSecretsMatch(clientState, input.expectedSecret)) {
      return { authorized: true, method: "graph-client-state" };
    }
    return { authorized: false };
  }

  return { authorized: false };
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }
  const token = header.replace(/^Bearer\s+/i, "").trim();
  return token.includes(".") ? token : null;
}

async function verifyGoogleOidcToken(
  token: string,
  fetchImpl: FetchLike,
): Promise<boolean> {
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`;
  try {
    const response = await fetchImpl(url);
    if (!response.ok) {
      return false;
    }
    const payload = (await response.json()) as {
      readonly iss?: string;
      readonly exp?: string | number;
    };
    if (!payload.iss || !GOOGLE_ISSUERS.has(payload.iss)) {
      return false;
    }
    const expiresAt = Number(payload.exp ?? 0);
    return Number.isFinite(expiresAt) && expiresAt * 1000 > Date.now();
  } catch {
    return false;
  }
}

function graphClientState(body: unknown): string | null {
  const record = asRecord(body);
  if (typeof record.clientState === "string" && record.clientState.trim()) {
    return record.clientState.trim();
  }
  if (!Array.isArray(record.value)) {
    return null;
  }
  for (const item of record.value) {
    const notification = asRecord(item);
    if (
      typeof notification.clientState === "string" &&
      notification.clientState.trim()
    ) {
      return notification.clientState.trim();
    }
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
