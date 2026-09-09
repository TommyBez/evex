import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

import type { HygieneBatch, HygieneProposal } from "./hygiene";

export const AUDIT_EVENT_TYPES = [
  "proposed",
  "delivered",
  "approved",
  "written",
  "refused",
] as const;

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

export type AuditLog = {
  readonly path: string;
  append(event: Omit<AuditEvent, "ts"> & { readonly ts?: string }): AuditEvent;
  list(): readonly AuditEvent[];
  latestBatch(): HygieneBatch | null;
  saveBatch(batch: HygieneBatch): void;
  findByIdempotencyKey(key: string): AuditEvent | undefined;
};

type StoredBatch = {
  readonly kind: "batch";
  readonly batch: HygieneBatch;
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

const isStoredBatch = (value: unknown): value is StoredBatch => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as StoredBatch;
  return row.kind === "batch" && Boolean(row.batch?.batchId);
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
      return rows.at(-1)?.batch ?? null;
    },
    saveBatch(batch) {
      writeLine(filePath, { kind: "batch", batch } satisfies StoredBatch);
    },
    findByIdempotencyKey(key) {
      return readLines(filePath)
        .filter(isAuditEvent)
        .find((event) => event.idempotencyKey === key);
    },
  };
}

export function proposalIdsOf(batch: HygieneBatch): readonly string[] {
  return batch.proposals.map((proposal: HygieneProposal) => proposal.id);
}
