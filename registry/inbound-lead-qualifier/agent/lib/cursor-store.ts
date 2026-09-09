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

export function createCursorStore(filePath: string): {
  readonly path: string;
  read(): LeadCursor;
  remember(input: {
    readonly ids: readonly string[];
    readonly since?: string;
    readonly now?: string;
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
    remember({ ids, since, now }) {
      const current = this.read();
      const nextSince = since ?? now ?? new Date().toISOString();
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
