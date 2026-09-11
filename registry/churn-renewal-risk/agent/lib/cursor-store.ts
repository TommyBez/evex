import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { RiskBucket } from "./score";

export type RenewalCursor = {
  readonly scannedAt: string;
  readonly batchId: string;
  readonly buckets: Readonly<Record<string, RiskBucket>>;
  readonly lastDigestKey?: string;
};

export const EMPTY_RENEWAL_CURSOR: RenewalCursor = {
  scannedAt: "",
  batchId: "",
  buckets: {},
};

const isRiskBucket = (value: unknown): value is RiskBucket =>
  value === "healthy" || value === "watch" || value === "at-risk";

const asBuckets = (
  value: unknown,
): Readonly<Record<string, RiskBucket>> => {
  if (!value || typeof value !== "object") {
    return {};
  }
  const buckets: Record<string, RiskBucket> = {};
  for (const [accountId, bucket] of Object.entries(
    value as Record<string, unknown>,
  )) {
    if (accountId && isRiskBucket(bucket)) {
      buckets[accountId] = bucket;
    }
  }
  return buckets;
};

const asCursor = (value: unknown): RenewalCursor => {
  if (!value || typeof value !== "object") {
    return EMPTY_RENEWAL_CURSOR;
  }
  const record = value as Record<string, unknown>;
  return {
    scannedAt: typeof record.scannedAt === "string" ? record.scannedAt : "",
    batchId: typeof record.batchId === "string" ? record.batchId : "",
    buckets: asBuckets(record.buckets),
    lastDigestKey:
      typeof record.lastDigestKey === "string"
        ? record.lastDigestKey
        : undefined,
  };
};

export function createCursorStore(filePath: string): {
  readonly path: string;
  read(): RenewalCursor;
  rememberScore(input: {
    readonly scannedAt: string;
    readonly batchId: string;
    readonly buckets: Readonly<Record<string, RiskBucket>>;
  }): RenewalCursor;
  rememberDigestKey(lastDigestKey: string): RenewalCursor;
} {
  const write = (next: RenewalCursor): RenewalCursor => {
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, `${JSON.stringify(next)}\n`, "utf8");
    return next;
  };

  return {
    path: filePath,
    read() {
      if (!existsSync(filePath)) {
        return EMPTY_RENEWAL_CURSOR;
      }
      try {
        return asCursor(JSON.parse(readFileSync(filePath, "utf8")));
      } catch {
        return EMPTY_RENEWAL_CURSOR;
      }
    },
    rememberScore({ scannedAt, batchId, buckets }) {
      const current = this.read();
      return write({
        scannedAt,
        batchId,
        buckets,
        lastDigestKey: current.lastDigestKey,
      });
    },
    rememberDigestKey(lastDigestKey) {
      const current = this.read();
      return write({
        ...current,
        lastDigestKey,
      });
    },
  };
}

export function bucketsFromScores(
  scores: readonly {
    readonly accountId: string;
    readonly bucket: RiskBucket;
  }[],
): Readonly<Record<string, RiskBucket>> {
  const buckets: Record<string, RiskBucket> = {};
  for (const score of scores) {
    buckets[score.accountId] = score.bucket;
  }
  return buckets;
}
