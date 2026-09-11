import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

export type SmeRequestStatus = "pending" | "approved";

export type SmeRequest = {
  readonly smeRequestId: string;
  readonly rfpId: string;
  readonly rfpTitle: string;
  readonly questions: readonly string[];
  readonly status: SmeRequestStatus;
  readonly postedAt: string;
  readonly reply?: string;
  readonly approvedAt?: string;
};

export type SmeStore = {
  readonly path: string;
  createPending(input: {
    readonly rfpId: string;
    readonly rfpTitle: string;
    readonly questions: readonly string[];
  }): SmeRequest;
  approve(input: {
    readonly smeRequestId: string;
    readonly reply: string;
  }): SmeRequest | undefined;
  find(smeRequestId: string): SmeRequest | undefined;
  findApproved(rfpId: string): SmeRequest | undefined;
};

type StoreFile = {
  readonly requests: readonly SmeRequest[];
};

const emptyStore = (): StoreFile => ({ requests: [] });

const readStore = (filePath: string): StoreFile => {
  if (!existsSync(filePath)) {
    return emptyStore();
  }
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as StoreFile;
    return {
      requests: Array.isArray(parsed.requests) ? parsed.requests : [],
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

const replaceRequest = (
  document: StoreFile,
  request: SmeRequest,
): StoreFile => ({
  requests: [
    ...document.requests.filter(
      (item) => item.smeRequestId !== request.smeRequestId,
    ),
    request,
  ],
});

export function questionsCoveredByApproval(
  record: SmeRequest,
  openQuestions: readonly string[],
): boolean {
  if (record.status !== "approved") {
    return false;
  }
  return openQuestions.every((question) => record.questions.includes(question));
}

export function createSmeStore(filePath: string): SmeStore {
  return {
    path: filePath,
    createPending(input) {
      const request: SmeRequest = {
        smeRequestId: randomUUID(),
        rfpId: input.rfpId,
        rfpTitle: input.rfpTitle,
        questions: [...input.questions],
        status: "pending",
        postedAt: new Date().toISOString(),
      };
      writeStoreAtomically(filePath, replaceRequest(readStore(filePath), request));
      return request;
    },
    approve(input) {
      const existing = readStore(filePath).requests.find(
        (item) => item.smeRequestId === input.smeRequestId,
      );
      if (!existing) {
        return undefined;
      }
      const approved: SmeRequest = {
        ...existing,
        status: "approved",
        reply: input.reply,
        approvedAt: new Date().toISOString(),
      };
      writeStoreAtomically(filePath, replaceRequest(readStore(filePath), approved));
      return approved;
    },
    find(smeRequestId) {
      return readStore(filePath).requests.find(
        (item) => item.smeRequestId === smeRequestId,
      );
    },
    findApproved(rfpId) {
      return [...readStore(filePath).requests]
        .reverse()
        .find((item) => item.rfpId === rfpId && item.status === "approved");
    },
  };
}
