import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import {
  changedFieldNames,
  type HygieneBatch,
  type HygieneKind,
  type HygieneProposal,
} from "./hygiene";

export const AUDIT_EVENT_TYPES = [
  "proposed",
  "delivered",
  "approved",
  "written",
  "refused",
] as const;

export const DEFAULT_AUDIT_RETENTION_DAYS = 90;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

export type AuditEvent = {
  readonly ts: string;
  readonly type: AuditEventType;
  readonly batchId: string;
  readonly proposalIds?: readonly string[];
  readonly note?: string;
  readonly written?: boolean;
  readonly idempotencyKey?: string;
};

export type AuditedProposal = {
  readonly id: string;
  readonly kind: HygieneKind;
  readonly recordId: string;
  readonly mergeRecordId?: string;
  readonly changedFields: readonly string[];
};

export type AuditedHygieneBatch = {
  readonly batchId: string;
  readonly provider: string;
  readonly scannedAt: string;
  readonly recordCount: number;
  readonly proposals: readonly AuditedProposal[];
};

export type AuditLog = {
  readonly path: string;
  append(event: Omit<AuditEvent, "ts"> & { readonly ts?: string }): AuditEvent;
  list(): readonly AuditEvent[];
  latestBatch(): AuditedHygieneBatch | null;
  saveBatch(batch: HygieneBatch): void;
  findByIdempotencyKey(key: string): AuditEvent | undefined;
  purgeExpired(input?: {
    readonly now?: Date;
    readonly retentionDays?: number;
  }): { readonly removed: number; readonly kept: number };
};

type StoredBatch = {
  readonly kind: "batch";
  readonly ts: string;
  readonly batch: AuditedHygieneBatch;
};

const isAuditEvent = (value: unknown): value is AuditEvent => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const event = value as AuditEvent;
  return (
    typeof event.ts === "string" &&
    typeof event.batchId === "string" &&
    AUDIT_EVENT_TYPES.includes(event.type)
  );
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

const redactProposal = (proposal: unknown): AuditedProposal | null => {
  if (!isRecord(proposal) || typeof proposal.id !== "string") {
    return null;
  }
  if (typeof proposal.kind !== "string" || typeof proposal.recordId !== "string") {
    return null;
  }
  const changed = Array.isArray(proposal.changedFields)
    ? proposal.changedFields.filter((field): field is string => typeof field === "string")
    : changedFieldNames(
        isRecord(proposal.before) ? proposal.before : {},
        isRecord(proposal.after) ? proposal.after : {},
      );
  return {
    id: proposal.id,
    kind: proposal.kind as HygieneKind,
    recordId: proposal.recordId,
    mergeRecordId:
      typeof proposal.mergeRecordId === "string"
        ? proposal.mergeRecordId
        : undefined,
    changedFields: changed,
  };
};

export function redactBatchForAudit(batch: HygieneBatch): AuditedHygieneBatch {
  return {
    batchId: batch.batchId,
    provider: batch.provider,
    scannedAt: batch.scannedAt,
    recordCount: batch.recordCount,
    proposals: batch.proposals.map((proposal) => ({
      id: proposal.id,
      kind: proposal.kind,
      recordId: proposal.recordId,
      mergeRecordId: proposal.mergeRecordId,
      changedFields: changedFieldNames(proposal.before, proposal.after),
    })),
  };
}

const asAuditedBatch = (value: unknown): AuditedHygieneBatch | null => {
  if (!isRecord(value) || typeof value.batchId !== "string") {
    return null;
  }
  const proposals = Array.isArray(value.proposals)
    ? value.proposals.map(redactProposal).filter((row): row is AuditedProposal => row !== null)
    : [];
  return {
    batchId: value.batchId,
    provider: typeof value.provider === "string" ? value.provider : "",
    scannedAt: typeof value.scannedAt === "string" ? value.scannedAt : "",
    recordCount: typeof value.recordCount === "number" ? value.recordCount : 0,
    proposals,
  };
};

const isStoredBatch = (value: unknown): value is StoredBatch => {
  if (!isRecord(value) || value.kind !== "batch") {
    return false;
  }
  return asAuditedBatch(value.batch) !== null;
};

const rowTimestamp = (value: unknown): string | undefined => {
  if (!isRecord(value) || typeof value.ts !== "string") {
    return undefined;
  }
  return value.ts;
};

const readLines = (filePath: string): unknown[] => {
  if (!existsSync(filePath)) {
    return [];
  }
  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as unknown;
      } catch {
        return null;
      }
    })
    .filter((row) => row !== null);
};

const writeLine = (filePath: string, value: unknown): void => {
  mkdirSync(path.dirname(filePath), { recursive: true });
  appendFileSync(filePath, `${JSON.stringify(value)}\n`, "utf8");
};

export function purgeAuditLog(
  filePath: string,
  olderThan: Date,
): { readonly removed: number; readonly kept: number } {
  if (!existsSync(filePath)) {
    return { removed: 0, kept: 0 };
  }
  const cutoff = olderThan.getTime();
  const kept: unknown[] = [];
  let removed = 0;
  for (const row of readLines(filePath)) {
    const ts = rowTimestamp(row);
    if (!ts || Date.parse(ts) < cutoff) {
      removed += 1;
      continue;
    }
    if (isStoredBatch(row)) {
      const batch = asAuditedBatch(row.batch);
      if (batch) {
        kept.push({ kind: "batch", ts: row.ts, batch });
        continue;
      }
    }
    kept.push(row);
  }
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(
    filePath,
    kept.length === 0 ? "" : `${kept.map((row) => JSON.stringify(row)).join("\n")}\n`,
    "utf8",
  );
  return { removed, kept: kept.length };
}

export function createAuditLog(filePath: string): AuditLog {
  return {
    path: filePath,
    append(event) {
      const next: AuditEvent = {
        ts: event.ts ?? new Date().toISOString(),
        type: event.type,
        batchId: event.batchId,
        proposalIds: event.proposalIds,
        note: event.note,
        written: event.written,
        idempotencyKey: event.idempotencyKey,
      };
      writeLine(filePath, next);
      return next;
    },
    list() {
      return readLines(filePath).filter(isAuditEvent);
    },
    latestBatch() {
      const rows = readLines(filePath).filter(isStoredBatch);
      return asAuditedBatch(rows.at(-1)?.batch) ?? null;
    },
    saveBatch(batch) {
      writeLine(filePath, {
        kind: "batch",
        ts: new Date().toISOString(),
        batch: redactBatchForAudit(batch),
      } satisfies StoredBatch);
    },
    findByIdempotencyKey(key) {
      return readLines(filePath)
        .filter(isAuditEvent)
        .find((event) => event.idempotencyKey === key);
    },
    purgeExpired(input = {}) {
      const retentionDays = input.retentionDays ?? DEFAULT_AUDIT_RETENTION_DAYS;
      const now = input.now ?? new Date();
      const olderThan = new Date(
        now.getTime() - retentionDays * 24 * 60 * 60 * 1000,
      );
      return purgeAuditLog(filePath, olderThan);
    },
  };
}

export function proposalIdsOf(batch: HygieneBatch): readonly string[] {
  return batch.proposals.map((proposal: HygieneProposal) => proposal.id);
}
