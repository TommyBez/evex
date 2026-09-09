import type { FetchLike } from "../oauth";
import {
  assertApprovedMutation,
  assertReadOnlyRequest,
  type ApprovalGrant,
} from "../write-guard";

export async function crmFetch(input: {
  readonly fetchImpl: FetchLike;
  readonly url: string;
  readonly method?: string;
  readonly headers?: Record<string, string>;
  readonly body?: string;
  readonly grant?: ApprovalGrant;
  readonly batchId?: string;
}): Promise<Response> {
  const method = (input.method ?? "GET").toUpperCase();
  if (input.grant && input.batchId) {
    assertApprovedMutation(method, input.url, input.grant, input.batchId);
  } else {
    assertReadOnlyRequest(method, input.url);
  }

  return input.fetchImpl(input.url, {
    method,
    headers: input.headers,
    body: input.body,
  });
}

export async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`CRM request failed with HTTP ${response.status}.`);
  }
  return (await response.json()) as T;
}
