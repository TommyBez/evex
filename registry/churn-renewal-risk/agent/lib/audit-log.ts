import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import type { RiskBucket, ScoreBatch } from "./score";

export const AUDIT_EVENT_TYPES = [
  "scored",
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
  readonly accountIds?: readonly string[];
  readonly note?: string;
  readonly written?: boolean;
  readonly emailedCustomer?: boolean;
  readonly idempotencyKey?: string;
};

export type AuditedScore = {
  readonly accountId: string;
  readonly bucket: RiskBucket;
  readonly moved: boolean;
};

export type AuditedScoreBatch = {
  readonly batchId: string;
  readonly provider: string;
  readonly scannedAt: string;
  readonly scores: readonly AuditedScore[];
  readonly skippedCount: number;
};

export type AuditLog = {
  readonly path: string;
  append(event: Omit<AuditEvent, "ts"> & { readonly ts?: string }): AuditEvent;
  list(): readonly AuditEvent[];
  latestBatch(): AuditedScoreBatch | null;
  saveBatch(batch: ScoreBatch): void;
  previousBuckets(): Readonly<Record<string, RiskBucket>>;
  findByIdempotencyKey(key: string): AuditEvent | undefined;
  purgeExpired(input?: {
    readonly now?: Date;
    readonly retentionDays?: number;
  }): { readonly removed: number; readonly kept: number };
};

type StoredBatch = {
  readonly kind: "batch";
  readonly ts: string;
  readonly batch: AuditedScoreBatch;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

const isAuditEvent = (value: unknown): value is AuditEvent => {
  if (!isRecord(value) || typeof value.ts !== "string") {
    return false;
  }
  return (
    typeof value.batchId === "string" &&
    AUDIT_EVENT_TYPES.includes(value.type as AuditEventType)
  );
};

const asAuditedBatch = (value: unknown): AuditedScoreBatch | null => {
  if (!isRecord(value) || typeof value.batchId !== "string") {
    return null;
  }
  const scores = Array.isArray(value.scores)
    ? value.scores.flatMap((row): AuditedScore[] => {
        if (!isRecord(row) || typeof row.accountId !== "string") {
          return [];
        }
        if (
          row.bucket !== "healthy" &&
          row.bucket !== "watch" &&
          row.bucket !== "at-risk"
        ) {
          return [];
        }
        return [
          {
            accountId: row.accountId,
            bucket: row.bucket,
            moved: row.moved === true,
          },
        ];
      })
    : [];
  return {
    batchId: value.batchId,
    provider: typeof value.provider === "string" ? value.provider : "",
    scannedAt: typeof value.scannedAt === "string" ? value.scannedAt : "",
    scores,
    skippedCount:
      typeof value.skippedCount === "number" ? value.skippedCount : 0,
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

export function redactBatchForAudit(batch: ScoreBatch): AuditedScoreBatch {
  return {
    batchId: batch.batchId,
    provider: batch.provider,
    scannedAt: batch.scannedAt,
    scores: batch.scored.map((row) => ({
      accountId: row.account.id,
      bucket: row.bucket,
      moved: row.moved,
    })),
    skippedCount: batch.skipped.length,
  };
}

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
    kept.length === 0
      ? ""
      : `${kept.map((row) => JSON.stringify(row)).join("\n")}\n`,
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
        accountIds: event.accountIds,
        note: event.note,
        written: event.written,
        emailedCustomer: event.emailedCustomer ?? false,
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
    previousBuckets() {
      const latest = this.latestBatch();
      if (!latest) {
        return {};
      }
      const buckets: Record<string, RiskBucket> = {};
      for (const score of latest.scores) {
        buckets[score.accountId] = score.bucket;
      }
      return buckets;
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

export function accountIdsOf(batch: ScoreBatch): readonly string[] {
  return batch.scored.map((row) => row.account.id);
}
