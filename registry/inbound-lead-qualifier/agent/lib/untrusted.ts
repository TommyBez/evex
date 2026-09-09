const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const WHITESPACE_RUNS = /\s+/g;
const INSTRUCTION_MARKERS =
  /\b(?:ignore (?:all |previous )?instructions|you are now|system prompt|dump (?:your |the )?secrets|send (?:this )?(?:email|mail)|smtp|drafts\.send|sendmail)\b/i;

export type LeadFields = {
  readonly id?: string;
  readonly email?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly company?: string;
  readonly title?: string;
  readonly phone?: string;
  readonly message?: string;
  readonly source?: string;
  readonly submittedAt?: string;
};

export function sanitizeLeadText(
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

export function sanitizeLeadFields(input: LeadFields): LeadFields {
  return {
    id: sanitizeLeadText(input.id, 120),
    email: sanitizeLeadText(input.email, 254)?.toLowerCase(),
    firstName: sanitizeLeadText(input.firstName, 80),
    lastName: sanitizeLeadText(input.lastName, 80),
    company: sanitizeLeadText(input.company, 160),
    title: sanitizeLeadText(input.title, 160),
    phone: sanitizeLeadText(input.phone, 40),
    message: sanitizeLeadText(input.message, 1000),
    source: sanitizeLeadText(input.source, 40),
    submittedAt: sanitizeLeadText(input.submittedAt, 40),
  };
}

export function leadFieldsLookLikeInstructions(fields: LeadFields): boolean {
  const haystack = [
    fields.firstName,
    fields.lastName,
    fields.company,
    fields.title,
    fields.message,
    fields.email,
  ]
    .filter(Boolean)
    .join(" ");
  return INSTRUCTION_MARKERS.test(haystack);
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
    const value = record[key];
    const sanitized = sanitizeLeadText(value);
    if (sanitized) {
      return sanitized;
    }
  }
}
