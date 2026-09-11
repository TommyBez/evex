import type { FetchLike } from "../oauth";
import { assertNeverEmailCustomer } from "../send-guard";
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
  readonly accountId?: string;
}): Promise<Response> {
  const method = (input.method ?? "GET").toUpperCase();
  assertNeverEmailCustomer(input.url, method);
  if (input.grant && input.accountId) {
    assertApprovedMutation(method, input.url, input.grant, input.accountId);
  } else {
    assertReadOnlyRequest(method, input.url);
  }

  const response = await input.fetchImpl(input.url, {
    method,
    headers: input.headers,
    body: input.body,
  });

  const isMutation = Boolean(input.grant && input.accountId);
  if (isMutation && !response.ok) {
    throw new Error(`CRM write failed (${response.status}) for ${method}.`);
  }

  return response;
}

export async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with HTTP ${response.status}.`);
  }
  return (await response.json()) as T;
}
