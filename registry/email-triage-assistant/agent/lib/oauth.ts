import { getTokenResponse } from "@vercel/connect";

export type RefreshedAccessToken = {
  readonly accessToken: string;
  readonly expiresIn: number;
};

export const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 3600;
export const ACCESS_TOKEN_EXPIRY_SKEW_MS = 60_000;

export const GMAIL_CONNECT_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.modify",
] as const;

export const MICROSOFT_CONNECT_SCOPES = [
  "https://graph.microsoft.com/Mail.Read",
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
  const remainingMs = response.expiresAt - Date.now();
  return {
    accessToken: response.token,
    expiresIn:
      remainingMs > 0
        ? Math.max(1, Math.floor(remainingMs / 1000))
        : DEFAULT_ACCESS_TOKEN_TTL_SECONDS,
  };
}
