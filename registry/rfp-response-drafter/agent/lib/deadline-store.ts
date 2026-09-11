import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { UpcomingRfp } from "./digest";
import type { MaterializedFile } from "./materialize";

const LABELED_DUE =
  /(?:due(?:\s*date)?|deadline)\s*[:=]\s*(\d{4}-\d{2}-\d{2})/i;
const ISO_DATE = /\b(\d{4}-\d{2}-\d{2})\b/;

export type DeadlineStore = {
  readonly path: string;
  list(): readonly UpcomingRfp[];
  save(rfps: readonly UpcomingRfp[]): void;
};

type StoreFile = {
  readonly rfps: readonly UpcomingRfp[];
};

const emptyStore = (): StoreFile => ({ rfps: [] });

const readStore = (filePath: string): StoreFile => {
  if (!existsSync(filePath)) {
    return emptyStore();
  }
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as StoreFile;
    return {
      rfps: Array.isArray(parsed.rfps) ? parsed.rfps : [],
    };
  } catch {
    return emptyStore();
  }
};

const writeStoreAtomically = (filePath: string, document: StoreFile): void => {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(document, null, 2)}\n`);
  renameSync(tempPath, filePath);
};

export function extractDueDate(text: string): string | undefined {
  const labeled = LABELED_DUE.exec(text);
  if (labeled?.[1]) {
    return labeled[1];
  }
  const iso = ISO_DATE.exec(text);
  return iso?.[1];
}

export function openRfpFromMaterialized(
  file: MaterializedFile,
  text: string | null,
): UpcomingRfp {
  return {
    id: file.driveFileId ?? file.sourceId,
    title: file.title,
    dueDate: text ? (extractDueDate(text) ?? "") : "",
    sourceId: file.sourceId,
  };
}

export function createDeadlineStore(filePath: string): DeadlineStore {
  return {
    path: filePath,
    list() {
      return readStore(filePath).rfps;
    },
    save(rfps) {
      writeStoreAtomically(filePath, { rfps: [...rfps] });
    },
  };
}
