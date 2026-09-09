import { assertDraftsOnlyHttp } from "./send-guard";
import type { FetchLike } from "./oauth";

export const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;

type ProviderErrorBody = {
  readonly error?: { readonly message?: string };
  readonly Fault?: { readonly Error?: readonly { readonly Message?: string }[] };
};

const mergeAbortSignals = (
  timeoutMs: number,
  signal?: AbortSignal,
): AbortSignal => {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
};

const parseJsonBody = (text: string): unknown => {
  if (!text.trim()) {
    return {};
  }
  return JSON.parse(text) as unknown;
};

const statusError = (method: string, url: string, status: number): string =>
  `${method} ${url} failed (${status})`;

export async function jsonRequest<T>(input: {
  readonly url: string;
  readonly method?: string;
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
  readonly fetchImpl?: FetchLike;
  readonly draftsOnly?: boolean;
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
}): Promise<T> {
  const method = input.method ?? "GET";
  if (input.draftsOnly) {
    assertDraftsOnlyHttp(input.url, method);
  }
  const fetchImpl = input.fetchImpl ?? fetch;
  const timeoutMs = input.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  const response = await fetchImpl(input.url, {
    method,
    headers: {
      accept: "application/json",
      ...(input.body === undefined
        ? {}
        : { "content-type": "application/json" }),
      ...input.headers,
    },
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
    signal: mergeAbortSignals(timeoutMs, input.signal),
  });

  const text = await response.text();
  let payload: T & ProviderErrorBody;
  try {
    payload = parseJsonBody(text) as T & ProviderErrorBody;
  } catch {
    throw new Error(statusError(method, input.url, response.status));
  }

  if (!response.ok) {
    const fault = payload.Fault?.Error?.[0]?.Message;
    throw new Error(
      payload.error?.message ?? fault ?? statusError(method, input.url, response.status),
    );
  }
  return payload;
}

export async function draftsOnlyJson<T>(input: {
  readonly url: string;
  readonly method?: string;
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
  readonly fetchImpl?: FetchLike;
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
}): Promise<T> {
  return jsonRequest<T>({ ...input, draftsOnly: true });
}

export async function readOnlyJson<T>(input: {
  readonly url: string;
  readonly headers?: Record<string, string>;
  readonly fetchImpl?: FetchLike;
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
}): Promise<T> {
  return jsonRequest<T>({ ...input, method: "GET" });
}
