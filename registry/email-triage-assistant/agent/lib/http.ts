import { assertDraftsOnlyHttp } from "./send-guard";
import type { FetchLike } from "./oauth";

export async function draftsOnlyJson<T>(input: {
  readonly url: string;
  readonly method?: string;
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
  readonly fetchImpl?: FetchLike;
}): Promise<T> {
  const method = input.method ?? "GET";
  assertDraftsOnlyHttp(input.url, method);
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

  const payload = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    const message =
      payload.error?.message ?? `${method} ${input.url} failed (${response.status})`;
    throw new Error(message);
  }
  return payload;
}
