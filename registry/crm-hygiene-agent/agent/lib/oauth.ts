import { getTokenResponse } from "@vercel/connect";

export type RefreshedAccessToken = {
  readonly accessToken: string;
  readonly expiresIn: number;
};

export const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 3600;
export const ACCESS_TOKEN_EXPIRY_SKEW_MS = 60_000;

export const HUBSPOT_CONNECT_SCOPES = [
  "crm.objects.contacts.read",
  "crm.objects.contacts.write",
  "crm.objects.companies.read",
] as const;

export const SALESFORCE_CONNECT_SCOPES = ["api", "refresh_token"] as const;

export const PIPEDRIVE_CONNECT_SCOPES = [
  "contacts:read",
  "contacts:full",
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

export function scopesForProvider(
  provider: "hubspot" | "salesforce" | "pipedrive",
): readonly string[] {
  if (provider === "hubspot") {
    return HUBSPOT_CONNECT_SCOPES;
  }
  if (provider === "salesforce") {
    return SALESFORCE_CONNECT_SCOPES;
  }
  return PIPEDRIVE_CONNECT_SCOPES;
}
