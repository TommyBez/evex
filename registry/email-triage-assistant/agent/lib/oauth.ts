import { assertDraftsOnlyHttp } from "./send-guard";

export type TokenResponse = {
  readonly access_token: string;
  readonly token_type?: string;
  readonly expires_in?: number;
};

export type FetchLike = (
  url: string,
  init?: RequestInit,
) => Promise<Response>;

export async function refreshGoogleAccessToken(input: {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly refreshToken: string;
  readonly fetchImpl?: FetchLike;
}): Promise<string> {
  const url = "https://oauth2.googleapis.com/token";
  assertDraftsOnlyHttp(url, "POST");
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      refresh_token: input.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const payload = (await response.json()) as TokenResponse & { error?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(
      `Gmail OAuth refresh failed: ${payload.error ?? response.status}`,
    );
  }
  return payload.access_token;
}

export async function refreshMicrosoftAccessToken(input: {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly tenantId: string;
  readonly refreshToken: string;
  readonly fetchImpl?: FetchLike;
}): Promise<string> {
  const url = `https://login.microsoftonline.com/${encodeURIComponent(input.tenantId)}/oauth2/v2.0/token`;
  assertDraftsOnlyHttp(url, "POST");
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      refresh_token: input.refreshToken,
      grant_type: "refresh_token",
      scope: "https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.ReadWrite offline_access",
    }),
  });
  const payload = (await response.json()) as TokenResponse & { error?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(
      `Microsoft OAuth refresh failed: ${payload.error ?? response.status}`,
    );
  }
  return payload.access_token;
}
