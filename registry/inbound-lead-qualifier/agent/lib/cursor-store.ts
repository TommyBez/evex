import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type LeadCursor = {
  readonly since: string;
  readonly seenIds: readonly string[];
};

const EMPTY_CURSOR: LeadCursor = {
  since: "1970-01-01T00:00:00.000Z",
  seenIds: [],
};

const MAX_SEEN_IDS = 500;
const USABLE_INSTANT =
  /^\d{4}-\d{2}-\d{2}(?:T|\s)\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:?\d{2})?$/;

export function usableCursorTimestamp(
  value: string,
  nowMs = Date.now(),
): string | undefined {
  const trimmed = value.trim();
  if (!USABLE_INSTANT.test(trimmed)) {
    return undefined;
  }
  const normalized = trimmed.includes("T")
    ? trimmed.replace(/([+-]\d{2})(\d{2})$/, "$1:$2")
    : `${trimmed.replace(" ", "T")}Z`;
  const parsed = Date.parse(normalized);
  if (!Number.isFinite(parsed) || parsed > nowMs) {
    return undefined;
  }
  return new Date(parsed).toISOString();
}

export function takeOldestEligible<T extends { readonly submittedAt?: string }>(
  leads: readonly T[],
  max: number,
): T[] {
  return [...leads]
    .sort((left, right) =>
      (left.submittedAt ?? "").localeCompare(right.submittedAt ?? ""),
    )
    .slice(0, Math.max(0, max));
}

export function nextCursorSince<T extends { readonly submittedAt?: string }>(
  leads: readonly T[],
  nowMs = Date.now(),
): string | undefined {
  const timestamps = leads
    .map((lead) =>
      lead.submittedAt ? usableCursorTimestamp(lead.submittedAt, nowMs) : undefined,
    )
    .filter((value): value is string => Boolean(value))
    .sort();
  return timestamps.at(-1);
}

export function createCursorStore(filePath: string): {
  readonly path: string;
  read(): LeadCursor;
  remember(input: {
    readonly ids: readonly string[];
    readonly since?: string;
  }): LeadCursor;
} {
  return {
    path: filePath,
    read() {
      if (!existsSync(filePath)) {
        return EMPTY_CURSOR;
      }
      try {
        const parsed = JSON.parse(readFileSync(filePath, "utf8")) as LeadCursor;
        if (typeof parsed.since !== "string") {
          return EMPTY_CURSOR;
        }
        return {
          since: parsed.since,
          seenIds: Array.isArray(parsed.seenIds)
            ? parsed.seenIds.filter((id): id is string => typeof id === "string")
            : [],
        };
      } catch {
        return EMPTY_CURSOR;
      }
    },
    remember({ ids, since }) {
      const current = this.read();
      const usableSince = since ? usableCursorTimestamp(since) : undefined;
      const nextSince =
        usableSince && usableSince > current.since
          ? usableSince
          : current.since;
      const seen = [...current.seenIds];
      for (const id of ids) {
        if (id && !seen.includes(id)) {
          seen.push(id);
        }
      }
      const next: LeadCursor = {
        since: nextSince > current.since ? nextSince : current.since,
        seenIds: seen.slice(-MAX_SEEN_IDS),
      };
      mkdirSync(path.dirname(filePath), { recursive: true });
      writeFileSync(filePath, `${JSON.stringify(next)}\n`);
      return next;
    },
  };
}

export function isNewSinceCursor(
  cursor: LeadCursor,
  input: { readonly id?: string; readonly submittedAt?: string },
): boolean {
  if (input.id && cursor.seenIds.includes(input.id)) {
    return false;
  }
  if (!input.submittedAt) {
    return true;
  }
  return input.submittedAt > cursor.since;
}
