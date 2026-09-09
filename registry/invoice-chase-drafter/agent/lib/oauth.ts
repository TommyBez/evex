import { getTokenResponse } from "@vercel/connect";

export type RefreshedAccessToken = {
  readonly accessToken: string;
  readonly expiresIn: number;
};

export const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 3600;
export const ACCESS_TOKEN_EXPIRY_SKEW_MS = 60_000;

export const QUICKBOOKS_CONNECT_SCOPES = [
  "com.intuit.quickbooks.accounting",
] as const;

export const XERO_CONNECT_SCOPES = [
  "accounting.transactions.read",
  "accounting.contacts.read",
  "offline_access",
] as const;

export const GMAIL_CONNECT_SCOPES = [
  "https://www.googleapis.com/auth/gmail.compose",
] as const;

export const MICROSOFT_CONNECT_SCOPES = [
  "https://graph.microsoft.com/Mail.ReadWrite",
] as const;

export type ConnectTokenMint = (input: {
  readonly connectorUid: string;
  readonly scopes: readonly string[];
}) => Promise<RefreshedAccessToken>;

export function createAccessTokenCache(
  refresh: () => Promise<RefreshedAccessToken>,
): () => Promise<string> {
  let cached: { readonly token: string; readonly expiresAt: number } | null =
    null;
  let inflight: Promise<string> | null = null;
  return async () => {
    if (cached && cached.expiresAt - ACCESS_TOKEN_EXPIRY_SKEW_MS > Date.now()) {
      return cached.token;
    }
    if (inflight) {
      return await inflight;
    }
    inflight = refresh()
      .then((next) => {
        cached = {
          token: next.accessToken,
          expiresAt: Date.now() + next.expiresIn * 1000,
        };
        return cached.token;
      })
      .finally(() => {
        inflight = null;
      });
    return await inflight;
  };
}

export type FetchLike = (
  url: string,
  init?: RequestInit,
) => Promise<Response>;

export async function mintConnectAccessToken(input: {
  readonly connectorUid: string;
  readonly scopes: readonly string[];
  readonly mintImpl?: ConnectTokenMint;
}): Promise<RefreshedAccessToken> {
  if (input.mintImpl) {
    return input.mintImpl({
      connectorUid: input.connectorUid,
      scopes: input.scopes,
    });
  }

  const response = await getTokenResponse(input.connectorUid, {
    subject: { type: "app" },
    scopes: [...input.scopes],
  });
  return {
    accessToken: response.token,
    expiresIn: ttlSecondsFromExpiresAt(response.expiresAt),
  };
}

export function ttlSecondsFromExpiresAt(
  expiresAtMs: number,
  nowMs = Date.now(),
): number {
  const remainingMs = expiresAtMs - nowMs;
  if (remainingMs <= 0) {
    throw new Error("Connect returned an access token that is already expired.");
  }
  return Math.max(1, Math.floor(remainingMs / 1000));
}

export function scopesForArProvider(
  provider: "quickbooks" | "xero",
): readonly string[] {
  return provider === "quickbooks"
    ? QUICKBOOKS_CONNECT_SCOPES
    : XERO_CONNECT_SCOPES;
}

export function scopesForMailboxProvider(
  provider: "gmail" | "outlook",
): readonly string[] {
  return provider === "gmail" ? GMAIL_CONNECT_SCOPES : MICROSOFT_CONNECT_SCOPES;
}
