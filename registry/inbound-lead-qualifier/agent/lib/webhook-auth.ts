import { timingSafeEqual } from "node:crypto";

export function readWebhookSecret(request: Request): string | null {
  const header =
    request.headers.get("x-webhook-secret") ??
    request.headers.get("authorization");
  if (!header) {
    return null;
  }
  return header.replace(/^Bearer\s+/i, "").trim() || null;
}

export function webhookSecretsMatch(
  provided: string | null,
  expected: string | undefined,
): boolean {
  if (!(provided && expected)) {
    return false;
  }
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}
