import { assertDraftsOnlyHttp } from "./send-guard";
import type { FetchLike } from "./oauth";

export async function jsonRequest<T>(input: {
  readonly url: string;
  readonly method?: string;
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
  readonly fetchImpl?: FetchLike;
  readonly draftsOnly?: boolean;
}): Promise<T> {
  const method = input.method ?? "GET";
  if (input.draftsOnly) {
    assertDraftsOnlyHttp(input.url, method);
  }
  const fetchImpl = input.fetchImpl ?? fetch;
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
  });

  const payload = (await response.json()) as T & {
    error?: { message?: string };
    Fault?: { Error?: readonly { Message?: string }[] };
  };
  if (!response.ok) {
    const fault = payload.Fault?.Error?.[0]?.Message;
    const message =
      payload.error?.message ??
      fault ??
      `${method} ${input.url} failed (${response.status})`;
    throw new Error(message);
  }
  return payload;
}

export async function draftsOnlyJson<T>(input: {
  readonly url: string;
  readonly method?: string;
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
  readonly fetchImpl?: FetchLike;
}): Promise<T> {
  return jsonRequest<T>({ ...input, draftsOnly: true });
}

export async function readOnlyJson<T>(input: {
  readonly url: string;
  readonly headers?: Record<string, string>;
  readonly fetchImpl?: FetchLike;
}): Promise<T> {
  return jsonRequest<T>({ ...input, method: "GET" });
}
