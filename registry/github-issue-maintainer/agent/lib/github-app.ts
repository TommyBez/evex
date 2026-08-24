import { createPrivateKey, createSign } from "node:crypto";

type InstallationTokenCache = {
  readonly expiresAtMs: number;
  readonly token: string;
};

const tokenCache = new Map<string, InstallationTokenCache>();
const TOKEN_REFRESH_SKEW_MS = 60_000;

function normalizePrivateKey(privateKey: string): string {
  return privateKey.includes("\\n")
    ? privateKey.replace(/\\n/g, "\n")
    : privateKey;
}

function base64Url(input: Buffer | string): string {
  const buffer = typeof input === "string" ? Buffer.from(input) : input;
  return buffer
    .toString("base64")
    .replaceAll("=", "")
    .replaceAll("+", "-")
    .replaceAll("/", "_");
}

async function createAppJwt(appId: string, privateKeyPem: string): Promise<string> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iat: nowSeconds - 60,
      exp: nowSeconds + 9 * 60,
      iss: appId,
    }),
  );
  const unsigned = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(
    createPrivateKey(normalizePrivateKey(privateKeyPem)),
  );
  return `${unsigned}.${base64Url(signature)}`;
}

export async function getInstallationAccessToken(
  installationId: number,
): Promise<string> {
  const appId = process.env.GITHUB_APP_ID?.trim();
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.trim();
  if (!(appId && privateKey)) {
    throw new Error(
      "GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY are required for digest GitHub API calls.",
    );
  }

  const cacheKey = `${appId}:${installationId}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAtMs > Date.now() + TOKEN_REFRESH_SKEW_MS) {
    return cached.token;
  }

  const jwt = await createAppJwt(appId, privateKey);
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${jwt}`,
        "x-github-api-version": "2022-11-28",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to mint GitHub installation token (HTTP ${response.status}).`,
    );
  }

  const body = (await response.json()) as {
    token?: string;
    expires_at?: string;
  };
  if (!body.token) {
    throw new Error("GitHub installation token response was missing token.");
  }

  const expiresAtMs = body.expires_at
    ? Date.parse(body.expires_at)
    : Date.now() + 50 * 60_000;
  tokenCache.set(cacheKey, { token: body.token, expiresAtMs });
  return body.token;
}

export async function githubRequest<T>(input: {
  readonly installationId: number;
  readonly method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  readonly path: string;
  readonly body?: unknown;
}): Promise<T> {
  const token = await getInstallationAccessToken(input.installationId);
  const response = await fetch(`https://api.github.com${input.path}`, {
    method: input.method,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8",
      "x-github-api-version": "2022-11-28",
    },
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub ${input.method} ${input.path} failed with HTTP ${response.status}.`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
