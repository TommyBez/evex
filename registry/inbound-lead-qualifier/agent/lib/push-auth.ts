import { verifyLeadHmac, readHmacSignatureHeader } from "./hmac";
import { parseLeadEvent } from "./lead-events";
import { readWebhookSecret, webhookSecretsMatch } from "./webhook-auth";

export type LeadPushAuthMethod = "hmac" | "shared-secret";

export type LeadPushAuthResult =
  | { readonly authorized: true; readonly method: LeadPushAuthMethod }
  | { readonly authorized: false };

export function authorizeLeadPush(input: {
  readonly request: Request;
  readonly rawBody: string;
  readonly body: unknown;
  readonly expectedSecret: string | undefined;
}): LeadPushAuthResult {
  if (!input.expectedSecret) {
    return { authorized: false };
  }

  const hmacSignature = readHmacSignatureHeader(input.request);
  if (
    verifyLeadHmac({
      secret: input.expectedSecret,
      payload: input.rawBody,
      signature: hmacSignature,
    })
  ) {
    return { authorized: true, method: "hmac" };
  }

  const headerSecret = readWebhookSecret(input.request);
  if (webhookSecretsMatch(headerSecret, input.expectedSecret)) {
    return { authorized: true, method: "shared-secret" };
  }

  const parsed = parseLeadEvent({ body: input.body });
  if ("ignored" in parsed) {
    return { authorized: false };
  }

  return { authorized: false };
}
