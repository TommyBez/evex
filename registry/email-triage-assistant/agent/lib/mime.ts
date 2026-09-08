export type ParsedMimeMessage = {
  readonly subject: string;
  readonly from: string;
  readonly to: string;
  readonly body: string;
  readonly date: string | null;
  readonly messageId?: string;
};

export const MAX_MULTIPART_NESTING = 8;

const HEADER_LINE = /^([\x21-\x39\x3B-\x7E]+):\s*(.*)$/;
const FOLDED_HEADER = /^[ \t]/;
const HEX_BYTE = /[0-9A-Fa-f]{2}/;
const BOUNDARY = /(?:^|;)\s*boundary=(?:"([^"]+)"|([^\s;]+))/i;
const CHARSET = /(?:^|;)\s*charset=(?:"([^"]+)"|([^\s;]+))/i;
const ENCODED_WORD = /=\?([^?]+)\?([BQbq])\?([^?]*)\?=/g;
const CRLF_CRLF = Buffer.from("\r\n\r\n");
const LF_LF = Buffer.from("\n\n");

export function parseMimeMessage(raw: string | Buffer): ParsedMimeMessage {
  const bytes = typeof raw === "string" ? Buffer.from(raw, "utf8") : raw;
  const { headers, body } = splitMessage(bytes);
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

function splitMessage(raw: Buffer): {
  headers: Map<string, string>;
  body: Buffer;
} {
  const crlf = raw.indexOf(CRLF_CRLF);
  const lf = raw.indexOf(LF_LF);
  const useCrlf = crlf !== -1 && (lf === -1 || crlf <= lf);
  const divider = useCrlf ? crlf : lf;
  const skip = useCrlf ? 4 : 2;
  if (divider === -1) {
    return {
      headers: parseHeaders(raw.toString("latin1")),
      body: Buffer.alloc(0),
    };
  }
  return {
    headers: parseHeaders(raw.subarray(0, divider).toString("latin1")),
    body: raw.subarray(divider + skip),
  };
}

function parseHeaders(block: string): Map<string, string> {
  const normalized = block.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  const unfolded: string[] = [];
  for (const line of normalized.split("\n")) {
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
  body: Buffer,
): string {
  const contentType = headers.get("content-type") ?? "text/plain";
  const encoding = headers.get("content-transfer-encoding") ?? "7bit";
  const media = mediaType(contentType);
  const charset = contentTypeCharset(contentType);
  const boundary = contentTypeBoundary(contentType);

  if (media.startsWith("multipart/") && boundary) {
    return decodeMultipart(body, boundary, 0);
  }
  if (media === "text/html") {
    return stripHtml(decodeTransfer(body, encoding, charset));
  }
  if (media.startsWith("text/")) {
    return decodeTransfer(body, encoding, charset);
  }
  return "";
}

function decodeMultipart(
  body: Buffer,
  boundary: string,
  depth: number,
): string {
  if (depth >= MAX_MULTIPART_NESTING) {
    return "";
  }
  const parts = splitAround(body, Buffer.from(`--${boundary}`)).slice(1);
  let htmlFallback = "";
  for (const part of parts) {
    if (part.length >= 2 && part[0] === 0x2d && part[1] === 0x2d) {
      break;
    }
    const parsed = splitMessage(stripLeadingNewlines(part));
    const contentType = parsed.headers.get("content-type") ?? "text/plain";
    const media = mediaType(contentType);
    const encoding = parsed.headers.get("content-transfer-encoding") ?? "7bit";
    const charset = contentTypeCharset(contentType);
    if (media === "text/plain") {
      return decodeTransfer(parsed.body, encoding, charset);
    }
    if (media === "text/html" && !htmlFallback) {
      htmlFallback = stripHtml(
        decodeTransfer(parsed.body, encoding, charset),
      );
    }
    if (media.startsWith("multipart/")) {
      const nested = contentTypeBoundary(contentType);
      if (nested) {
        const nestedBody = decodeMultipart(parsed.body, nested, depth + 1);
        if (nestedBody) {
          return nestedBody;
        }
      }
    }
  }
  return htmlFallback;
}

function decodeTransfer(
  value: Buffer,
  encoding: string,
  charset: string,
): string {
  const normalized = encoding.trim().toLowerCase();
  if (normalized === "base64") {
    const bytes = Buffer.from(
      value.toString("ascii").replaceAll(/\s+/g, ""),
      "base64",
    );
    return decodeCharset(bytes, charset);
  }
  if (normalized === "quoted-printable") {
    return decodeQuotedPrintable(value, charset);
  }
  return decodeCharset(value, charset);
}

function decodeQuotedPrintable(
  value: string | Buffer,
  charset: string,
): string {
  const text = typeof value === "string" ? value : value.toString("latin1");
  return decodeCharset(quotedPrintableToBytes(text), charset);
}

function quotedPrintableToBytes(value: string): Buffer {
  const soft = value.replaceAll(/=\r?\n/g, "");
  const bytes: number[] = [];
  for (let index = 0; index < soft.length; index += 1) {
    const char = soft[index];
    if (char === "=" && HEX_BYTE.test(soft.slice(index + 1, index + 3))) {
      bytes.push(Number.parseInt(soft.slice(index + 1, index + 3), 16));
      index += 2;
      continue;
    }
    bytes.push(char.charCodeAt(0) & 0xff);
  }
  return Buffer.from(bytes);
}

function decodeCharset(bytes: Buffer, charset: string): string {
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return bytes.toString("utf8");
  }
}

function decodeMimeWords(value: string): string {
  return value
    .replaceAll(ENCODED_WORD, (_match, charset, encoding, text) => {
      const bytes =
        encoding.toUpperCase() === "B"
          ? Buffer.from(text, "base64")
          : quotedPrintableToBytes(text.replaceAll("_", " "));
      return decodeCharset(bytes, String(charset));
    })
    .replaceAll(/\s+/g, " ")
    .trim();
}

function contentTypeBoundary(contentType: string): string | null {
  const match = BOUNDARY.exec(contentType);
  return match?.[1] ?? match?.[2] ?? null;
}

function contentTypeCharset(contentType: string): string {
  const match = CHARSET.exec(contentType);
  const raw = match?.[1] ?? match?.[2];
  return raw?.replaceAll(/^['"]|['"]$/g, "").trim() || "utf-8";
}

function mediaType(contentType: string): string {
  return contentType.split(";")[0]?.trim().toLowerCase() ?? "text/plain";
}

function stripHtml(value: string): string {
  return value.replaceAll(/<[^>]+>/g, " ").replaceAll(/\s+/g, " ").trim();
}

function stripLeadingNewlines(value: Buffer): Buffer {
  if (value[0] === 0x0d && value[1] === 0x0a) {
    return value.subarray(2);
  }
  if (value[0] === 0x0a) {
    return value.subarray(1);
  }
  return value;
}

function splitAround(haystack: Buffer, delimiter: Buffer): Buffer[] {
  const parts: Buffer[] = [];
  let start = 0;
  let index = haystack.indexOf(delimiter, start);
  while (index !== -1) {
    parts.push(haystack.subarray(start, index));
    start = index + delimiter.length;
    index = haystack.indexOf(delimiter, start);
  }
  parts.push(haystack.subarray(start));
  return parts;
}
