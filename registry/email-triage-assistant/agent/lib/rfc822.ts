export type DraftRfc822Input = {
  readonly from?: string;
  readonly to: string;
  readonly subject: string;
  readonly body: string;
  readonly inReplyTo?: string;
  readonly references?: string;
};

const HEADER_BREAK = /[\r\n]/;

export function buildRfc822(input: DraftRfc822Input): string {
  const headers = [
    input.from ? `From: ${headerValue("From", input.from)}` : null,
    `To: ${headerValue("To", input.to)}`,
    `Subject: ${encodeHeader(headerValue("Subject", input.subject))}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="utf-8"',
    "Content-Transfer-Encoding: 8bit",
    input.inReplyTo
      ? `In-Reply-To: ${headerValue("In-Reply-To", input.inReplyTo)}`
      : null,
    input.references
      ? `References: ${headerValue("References", input.references)}`
      : null,
  ].filter((line): line is string => Boolean(line));

  return `${headers.join("\r\n")}\r\n\r\n${normalizeBody(input.body)}\r\n`;
}

export function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function assertSafeHeaderValue(name: string, value: string): string {
  return headerValue(name, value);
}

function headerValue(name: string, value: string): string {
  if (HEADER_BREAK.test(value)) {
    throw new Error(
      `Refused RFC 822 ${name} header: CR and LF are not allowed in header values.`,
    );
  }
  return value;
}

function encodeHeader(value: string): string {
  if (/^[\x20-\x7E]*$/.test(value)) {
    return value;
  }
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function normalizeBody(value: string): string {
  return value.replaceAll("\r\n", "\n").replaceAll("\n", "\r\n");
}
