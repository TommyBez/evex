import { createHash } from "node:crypto";

export const HYGIENE_KINDS = ["dedupe", "normalize", "enrich"] as const;

export type HygieneKind = (typeof HYGIENE_KINDS)[number];

export type CrmRecord = {
  readonly id: string;
  readonly email?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly phone?: string;
  readonly company?: string;
  readonly website?: string;
  readonly orgId?: string;
};

export type HygieneProposal = {
  readonly id: string;
  readonly kind: HygieneKind;
  readonly recordId: string;
  readonly mergeRecordId?: string;
  readonly before: Partial<CrmRecord>;
  readonly after: Partial<CrmRecord>;
  readonly reason: string;
};

export type HygieneBatch = {
  readonly batchId: string;
  readonly provider: string;
  readonly scannedAt: string;
  readonly recordCount: number;
  readonly proposals: readonly HygieneProposal[];
};

const WHITESPACE = /\s+/g;
const NON_DIGITS = /\D/g;

export function normalizeEmail(value: string | undefined): string | undefined {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed : undefined;
}

export function normalizeName(value: string | undefined): string | undefined {
  const trimmed = value?.trim().replace(WHITESPACE, " ");
  if (!trimmed) {
    return undefined;
  }
  return trimmed
    .split(" ")
    .map((part) => {
      const lower = part.toLowerCase();
      return `${lower.slice(0, 1).toUpperCase()}${lower.slice(1)}`;
    })
    .join(" ");
}

export function normalizePhone(value: string | undefined): string | undefined {
  const digits = value?.replace(NON_DIGITS, "") ?? "";
  if (digits.length < 10 || digits.length > 15) {
    return value?.trim() || undefined;
  }
  return `+${digits}`;
}

export function emailDomain(email: string | undefined): string | undefined {
  const normalized = normalizeEmail(email);
  const at = normalized?.lastIndexOf("@") ?? -1;
  if (!normalized || at < 1 || at === normalized.length - 1) {
    return undefined;
  }
  return normalized.slice(at + 1);
}

const filledCount = (record: CrmRecord): number =>
  [record.email, record.firstName, record.lastName, record.phone, record.company]
    .filter((value) => Boolean(value?.trim()))
    .length;

const proposalId = (
  kind: HygieneKind,
  recordId: string,
  extra = "",
): string => {
  const digest = createHash("sha256")
    .update(`${kind}:${recordId}:${extra}`)
    .digest("hex")
    .slice(0, 16);
  return `${kind}-${digest}`;
};

const changedFields = (
  before: Partial<CrmRecord>,
  after: Partial<CrmRecord>,
): boolean => {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const field = key as keyof CrmRecord;
    if ((before[field] ?? "") !== (after[field] ?? "")) {
      return true;
    }
  }
  return false;
};

export function proposeNormalize(record: CrmRecord): HygieneProposal | null {
  const after = {
    email: normalizeEmail(record.email) ?? record.email,
    firstName: normalizeName(record.firstName) ?? record.firstName,
    lastName: normalizeName(record.lastName) ?? record.lastName,
    phone: normalizePhone(record.phone) ?? record.phone,
  };
  const before = {
    email: record.email,
    firstName: record.firstName,
    lastName: record.lastName,
    phone: record.phone,
  };
  if (!changedFields(before, after)) {
    return null;
  }
  return {
    id: proposalId("normalize", record.id),
    kind: "normalize",
    recordId: record.id,
    before,
    after,
    reason: "Normalize email, name, or phone formatting without changing identity.",
  };
}

export function proposeDedupes(
  records: readonly CrmRecord[],
): HygieneProposal[] {
  const groups = new Map<string, CrmRecord[]>();
  for (const record of records) {
    const email = normalizeEmail(record.email);
    if (!email) {
      continue;
    }
    const group = groups.get(email) ?? [];
    group.push(record);
    groups.set(email, group);
  }

  const proposals: HygieneProposal[] = [];
  for (const [email, group] of groups) {
    if (group.length < 2) {
      continue;
    }
    const [primary, ...duplicates] = [...group].sort((left, right) => {
      const fill = filledCount(right) - filledCount(left);
      if (fill !== 0) {
        return fill;
      }
      return left.id.localeCompare(right.id);
    });
    if (!primary) {
      continue;
    }
    for (const duplicate of duplicates) {
      proposals.push({
        id: proposalId("dedupe", primary.id, duplicate.id),
        kind: "dedupe",
        recordId: primary.id,
        mergeRecordId: duplicate.id,
        before: { id: duplicate.id, email: duplicate.email },
        after: { id: primary.id, email },
        reason: `Merge duplicate ${duplicate.id} into ${primary.id} (shared email ${email}).`,
      });
    }
  }
  return proposals;
}

export function proposeEnrich(
  record: CrmRecord,
  records: readonly CrmRecord[],
): HygieneProposal | null {
  const domain = emailDomain(record.email);
  let company: { readonly before?: string; readonly after?: string } | undefined;
  let phone: { readonly before?: string; readonly after?: string } | undefined;
  let website: { readonly before?: string; readonly after?: string } | undefined;

  let orgId: { readonly before?: string; readonly after?: string } | undefined;

  if (!record.company?.trim() && domain) {
    const donor = records.find(
      (candidate) =>
        candidate.id !== record.id &&
        emailDomain(candidate.email) === domain &&
        Boolean(candidate.company?.trim()),
    );
    if (donor?.company) {
      company = { before: record.company, after: donor.company };
      if (donor.orgId?.trim() && !record.orgId?.trim()) {
        orgId = { before: record.orgId, after: donor.orgId };
      }
    }
  }

  if (!record.phone?.trim()) {
    const email = normalizeEmail(record.email);
    if (email) {
      const donor = records.find(
        (candidate) =>
          candidate.id !== record.id &&
          normalizeEmail(candidate.email) === email &&
          Boolean(candidate.phone?.trim()),
      );
      if (donor?.phone) {
        phone = { before: record.phone, after: donor.phone };
      }
    }
  }

  if (!record.website?.trim() && domain) {
    const donor = records.find(
      (candidate) =>
        candidate.id !== record.id &&
        emailDomain(candidate.email) === domain &&
        Boolean(candidate.website?.trim()),
    );
    if (donor?.website) {
      website = { before: record.website, after: donor.website };
    }
  }

  const before: Partial<CrmRecord> = {
    company: company?.before,
    phone: phone?.before,
    website: website?.before,
    orgId: orgId?.before,
  };
  const after: Partial<CrmRecord> = {
    company: company?.after,
    phone: phone?.after,
    website: website?.after,
    orgId: orgId?.after,
  };

  if (!changedFields(before, after)) {
    return null;
  }

  return {
    id: proposalId("enrich", record.id, JSON.stringify(after)),
    kind: "enrich",
    recordId: record.id,
    before,
    after,
    reason: `Fill empty fields from another record on ${domain ?? "the same domain"}. Never overwrites a filled value.`,
  };
}

export function mergeSourceIdsOf(
  proposals: readonly HygieneProposal[],
): ReadonlySet<string> {
  return new Set(
    proposals.flatMap((proposal) =>
      proposal.mergeRecordId ? [proposal.mergeRecordId] : [],
    ),
  );
}

export function proposeHygieneBatch(input: {
  readonly provider: string;
  readonly records: readonly CrmRecord[];
  readonly scannedAt?: string;
}): HygieneBatch {
  const scannedAt = input.scannedAt ?? new Date().toISOString();
  const dedupe = proposeDedupes(input.records);
  const mergeSourceIds = mergeSourceIdsOf(dedupe);
  const proposals: HygieneProposal[] = [...dedupe];

  for (const record of input.records) {
    if (mergeSourceIds.has(record.id)) {
      continue;
    }
    const normalize = proposeNormalize(record);
    if (normalize) {
      proposals.push(normalize);
    }
    const enrich = proposeEnrich(record, input.records);
    if (enrich) {
      proposals.push(enrich);
    }
  }

  const digest = createHash("sha256")
    .update(
      JSON.stringify({
        provider: input.provider,
        scannedAt,
        ids: proposals.map((proposal) => proposal.id),
      }),
    )
    .digest("hex")
    .slice(0, 16);

  return {
    batchId: `crm-hygiene-${scannedAt.slice(0, 10)}-${digest}`,
    provider: input.provider,
    scannedAt,
    recordCount: input.records.length,
    proposals,
  };
}
