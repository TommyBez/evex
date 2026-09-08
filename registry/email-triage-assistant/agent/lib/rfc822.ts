export type DraftRfc822Input = {
  readonly from?: string;
  readonly to: string;
  readonly subject: string;
  readonly body: string;
  readonly inReplyTo?: string;
  readonly references?: string;
};

export function buildRfc822(input: DraftRfc822Input): string {
  const headers = [
    input.from ? `From: ${input.from}` : null,
    `To: ${input.to}`,
    `Subject: ${encodeHeader(input.subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="utf-8"',
    "Content-Transfer-Encoding: 8bit",
    input.inReplyTo ? `In-Reply-To: ${input.inReplyTo}` : null,
    input.references ? `References: ${input.references}` : null,
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

function encodeHeader(value: string): string {
  if (/^[\x20-\x7E]*$/.test(value)) {
    return value;
  }
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function normalizeBody(value: string): string {
  return value.replaceAll("\r\n", "\n").replaceAll("\n", "\r\n");
}
