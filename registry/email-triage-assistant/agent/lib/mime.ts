export type ParsedMimeMessage = {
  readonly subject: string;
  readonly from: string;
  readonly to: string;
  readonly body: string;
  readonly date: string | null;
  readonly messageId?: string;
};

const HEADER_LINE = /^([\x21-\x39\x3B-\x7E]+):\s*(.*)$/;
const FOLDED_HEADER = /^[ \t]/;
const LEADING_NEWLINE = /^\n/;
const HEX_BYTE = /[0-9A-Fa-f]{2}/;
const BOUNDARY = /(?:^|;)\s*boundary=(?:"([^"]+)"|([^\s;]+))/i;
const ENCODED_WORD = /=\?([^?]+)\?([BQbq])\?([^?]*)\?=/g;

export function parseMimeMessage(raw: string): ParsedMimeMessage {
  const { headers, body } = splitMessage(raw);
  return {
    subject: header(headers, "subject"),
    from: header(headers, "from"),
    to: header(headers, "to"),
    body: selectDecodedBody(headers, body).trim(),
    date: header(headers, "date") || null,
    messageId: header(headers, "message-id") || undefined,
  };
}

function header(
  headers: ReadonlyMap<string, string>,
  name: string,
): string {
  return decodeMimeWords(headers.get(name) ?? "");
}

function splitMessage(raw: string): {
  headers: Map<string, string>;
  body: string;
} {
  const normalized = raw.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  const divider = normalized.indexOf("\n\n");
  const headerBlock = divider === -1 ? normalized : normalized.slice(0, divider);
  const body = divider === -1 ? "" : normalized.slice(divider + 2);
  return { headers: parseHeaders(headerBlock), body };
}

function parseHeaders(block: string): Map<string, string> {
  const unfolded: string[] = [];
  for (const line of block.split("\n")) {
    if (FOLDED_HEADER.test(line) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += ` ${line.trim()}`;
      continue;
    }
    unfolded.push(line);
  }

  const headers = new Map<string, string>();
  for (const line of unfolded) {
    const match = HEADER_LINE.exec(line);
    if (!match) {
      continue;
    }
    const name = match[1].toLowerCase();
    const value = match[2].trim();
    const existing = headers.get(name);
    headers.set(name, existing ? `${existing}, ${value}` : value);
  }
  return headers;
}

function selectDecodedBody(
  headers: ReadonlyMap<string, string>,
  body: string,
): string {
  const contentType = headers.get("content-type") ?? "text/plain";
  const encoding = headers.get("content-transfer-encoding") ?? "7bit";
  const media = mediaType(contentType);
  const boundary = contentTypeBoundary(contentType);

  if (media.startsWith("multipart/") && boundary) {
    return decodeMultipart(body, boundary);
  }
  if (media === "text/html") {
    return stripHtml(decodeTransfer(body, encoding));
  }
  if (media.startsWith("text/")) {
    return decodeTransfer(body, encoding);
  }
  return "";
}

function decodeMultipart(body: string, boundary: string): string {
  const delimiter = `--${boundary}`;
  const parts = body.split(delimiter).slice(1);
  let htmlFallback = "";
  for (const part of parts) {
    if (part.startsWith("--")) {
      break;
    }
    const parsed = splitMessage(part.replace(LEADING_NEWLINE, ""));
    const media = mediaType(parsed.headers.get("content-type") ?? "text/plain");
    const encoding =
      parsed.headers.get("content-transfer-encoding") ?? "7bit";
    if (media === "text/plain") {
      return decodeTransfer(parsed.body, encoding);
    }
    if (media === "text/html" && !htmlFallback) {
      htmlFallback = stripHtml(decodeTransfer(parsed.body, encoding));
    }
    if (media.startsWith("multipart/")) {
      const nested = contentTypeBoundary(
        parsed.headers.get("content-type") ?? "",
      );
      if (nested) {
        const nestedBody = decodeMultipart(parsed.body, nested);
        if (nestedBody) {
          return nestedBody;
        }
      }
    }
  }
  return htmlFallback;
}

function decodeTransfer(value: string, encoding: string): string {
  const normalized = encoding.trim().toLowerCase();
  if (normalized === "base64") {
    return Buffer.from(value.replaceAll(/\s+/g, ""), "base64").toString("utf8");
  }
  if (normalized === "quoted-printable") {
    return decodeQuotedPrintable(value);
  }
  return value.replaceAll("\r\n", "\n");
}

function decodeQuotedPrintable(value: string): string {
  const soft = value.replaceAll(/=\r?\n/g, "");
  const bytes: number[] = [];
  for (let index = 0; index < soft.length; index += 1) {
    const char = soft[index];
    if (char === "=" && HEX_BYTE.test(soft.slice(index + 1, index + 3))) {
      bytes.push(Number.parseInt(soft.slice(index + 1, index + 3), 16));
      index += 2;
      continue;
    }
    bytes.push(char.charCodeAt(0));
  }
  return Buffer.from(bytes).toString("utf8");
}

function decodeMimeWords(value: string): string {
  return value
    .replaceAll(ENCODED_WORD, (_match, charset, encoding, text) => {
      const bytes =
        encoding.toUpperCase() === "B"
          ? Buffer.from(text, "base64")
          : Buffer.from(decodeQuotedPrintable(text.replaceAll("_", " ")), "utf8");
      try {
        return new TextDecoder(String(charset)).decode(bytes);
      } catch {
        return bytes.toString("utf8");
      }
    })
    .replaceAll(/\s+/g, " ")
    .trim();
}

function contentTypeBoundary(contentType: string): string | null {
  const match = BOUNDARY.exec(contentType);
  return match?.[1] ?? match?.[2] ?? null;
}

function mediaType(contentType: string): string {
  return contentType.split(";")[0]?.trim().toLowerCase() ?? "text/plain";
}

function stripHtml(value: string): string {
  return value.replaceAll(/<[^>]+>/g, " ").replaceAll(/\s+/g, " ").trim();
}
