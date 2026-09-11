import { createHmac, timingSafeEqual } from "node:crypto";

export type HmacEncoding = "hex" | "base64";

const SHA256_PREFIX = /^sha256=/i;

export function hmacSha256(
  secret: string,
  payload: string,
  encoding: HmacEncoding = "hex",
): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest(encoding);
}

export function normalizeSignature(value: string): string {
  return value.trim().replace(SHA256_PREFIX, "").trim();
}

export function hmacSignaturesMatch(
  provided: string | null | undefined,
  expected: string,
): boolean {
  if (!provided) {
    return false;
  }
  const left = Buffer.from(normalizeSignature(provided));
  const right = Buffer.from(normalizeSignature(expected));
  if (left.length === 0 || left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function readHmacSignatureHeader(request: Request): string | null {
  const header =
    request.headers.get("x-hub-signature-256") ??
    request.headers.get("x-webhook-signature") ??
    request.headers.get("typeform-signature") ??
    request.headers.get("x-hubspot-signature");
  if (!header?.trim()) {
    return null;
  }
  return header.trim();
}

export function verifyLeadHmac(input: {
  readonly secret: string;
  readonly payload: string;
  readonly signature: string | null;
}): boolean {
  if (!input.signature) {
    return false;
  }
  const hex = hmacSha256(input.secret, input.payload, "hex");
  const base64 = hmacSha256(input.secret, input.payload, "base64");
  return (
    hmacSignaturesMatch(input.signature, hex) ||
    hmacSignaturesMatch(input.signature, base64)
  );
}
