const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const WHITESPACE_RUNS = /\s+/g;
const INSTRUCTION_MARKERS =
  /\b(?:ignore (?:all |previous )?instructions|you are now|system prompt|dump (?:your |the )?secrets|send (?:this )?(?:email|mail)|smtp|drafts\.send|sendmail)\b/i;

export function sanitizeText(
  value: unknown,
  maxLength = 500,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const cleaned = value
    .replace(CONTROL_CHARS, "")
    .replace(WHITESPACE_RUNS, " ")
    .trim();
  if (!cleaned) {
    return undefined;
  }
  return cleaned.slice(0, maxLength);
}

export function accountFieldsLookLikeInstructions(fields: {
  readonly name?: string;
  readonly ownerName?: string;
  readonly ownerEmail?: string;
  readonly note?: string;
}): boolean {
  const haystack = [fields.name, fields.ownerName, fields.ownerEmail, fields.note]
    .filter(Boolean)
    .join(" ");
  return INSTRUCTION_MARKERS.test(haystack);
}

export function refuseInstructionMarkedWrite(fields: {
  readonly name?: string;
  readonly ownerName?: string;
  readonly ownerEmail?: string;
  readonly note?: string;
}): string | undefined {
  if (accountFieldsLookLikeInstructions(fields)) {
    return "Refused CRM write. Account fields looked like instructions.";
  }
}

export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function stringField(
  record: Record<string, unknown>,
  ...keys: readonly string[]
): string | undefined {
  for (const key of keys) {
    const sanitized = sanitizeText(record[key]);
    if (sanitized) {
      return sanitized;
    }
  }
}
