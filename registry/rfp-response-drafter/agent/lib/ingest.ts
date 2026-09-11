import type { PackSource } from "./cite-gate";
import {
  openRfpFromMaterialized,
  type DeadlineStore,
} from "./deadline-store";
import type { UpcomingRfp } from "./digest";
import {
  ingestOutputHasFileContent,
  isDriveExportCandidate,
  materializedFromDrive,
  materializedFromSandbox,
  toPackSource,
  type MaterializedFile,
} from "./materialize";
import type { DriveClient, DriveFolderListing } from "./providers/types";
import { isAllowedSandboxPath } from "./sandbox-paths";

export type IngestSandbox = {
  readTextFile(input: { path: string }): PromiseLike<string | null>;
  writeTextFile(input: { path: string; content: string }): PromiseLike<void>;
  writeBinaryFile(input: {
    path: string;
    content: Uint8Array;
  }): PromiseLike<void>;
};

export type IngestDriveFile = {
  readonly fileId: string;
  readonly kind: "rfp" | "pack";
};

export type IngestSandboxPath = {
  readonly path: string;
  readonly kind: "rfp" | "pack";
};

export type IngestResult = {
  readonly ok: boolean;
  readonly materialized: boolean;
  readonly submitted: false;
  readonly note: string;
  readonly sources: readonly PackSource[];
  readonly files: readonly MaterializedFile[];
  readonly folders?: {
    readonly rfp: DriveFolderListing;
    readonly pack: DriveFolderListing;
  };
  readonly rejected: readonly string[];
  readonly openRfps?: readonly UpcomingRfp[];
  readonly missingEnv?: readonly string[];
};

const READ_WITH_BUILTINS =
  "Read materialized files with built-in read_file, glob, or grep. Do not paste file contents into tool arguments.";

export async function ingestRfpSources(input: {
  readonly drive?: DriveClient;
  readonly sandbox: IngestSandbox;
  readonly sandboxRoots: readonly string[];
  readonly driveFiles?: readonly IngestDriveFile[];
  readonly sandboxPaths?: readonly IngestSandboxPath[];
  readonly deadlineStore?: DeadlineStore;
}): Promise<IngestResult> {
  const files: MaterializedFile[] = [];
  const rejected: string[] = [];
  const discoveredRfps: UpcomingRfp[] = [];
  let folders: IngestResult["folders"];

  if (input.drive) {
    folders = await input.drive.listConfiguredFolders();
    const requested = input.driveFiles ?? [];
    const autoExport =
      requested.length === 0
        ? [
            ...folders.rfp.files
              .filter((file) => isDriveExportCandidate(file.mimeType))
              .map((file) => ({ fileId: file.id, kind: "rfp" as const })),
            ...folders.pack.files
              .filter((file) => isDriveExportCandidate(file.mimeType))
              .map((file) => ({ fileId: file.id, kind: "pack" as const })),
          ]
        : requested;

    const seen = new Set<string>();
    for (const driveFile of autoExport) {
      const key = `${driveFile.kind}:${driveFile.fileId}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      const exported = await input.drive.exportFile({
        fileId: driveFile.fileId,
        kind: driveFile.kind,
      });
      const materialized = materializedFromDrive({
        fileId: exported.id,
        name: exported.name,
        mimeType: exported.mimeType,
        kind: driveFile.kind,
        webViewLink: exported.webViewLink,
      });
      const recorded: MaterializedFile = {
        ...materialized,
        truncated: exported.truncated,
        charCount: exported.charCount,
        chunkIndex: exported.chunkIndex,
        chunkCount: exported.chunkCount,
      };
      if (exported.encoding === "binary") {
        if (!exported.bytes) {
          rejected.push(`drive:${driveFile.fileId}: missing binary payload`);
          continue;
        }
        await input.sandbox.writeBinaryFile({
          path: recorded.path,
          content: exported.bytes,
        });
      } else {
        if (exported.text === undefined) {
          rejected.push(`drive:${driveFile.fileId}: missing text payload`);
          continue;
        }
        await input.sandbox.writeTextFile({
          path: recorded.path,
          content: exported.text,
        });
        if (driveFile.kind === "rfp") {
          discoveredRfps.push(
            openRfpFromMaterialized(recorded, exported.text),
          );
        }
      }
      files.push(recorded);
    }
  }

  for (const sandboxFile of input.sandboxPaths ?? []) {
    const materialized = materializedFromSandbox(sandboxFile);
    if (!isAllowedSandboxPath(materialized.path, input.sandboxRoots)) {
      rejected.push(materialized.path);
      continue;
    }
    try {
      const exists = await input.sandbox.readTextFile({
        path: materialized.path,
      });
      if (exists === null) {
        rejected.push(materialized.path);
        continue;
      }
      files.push(materialized);
      if (sandboxFile.kind === "rfp") {
        discoveredRfps.push(openRfpFromMaterialized(materialized, exists));
      }
    } catch {
      rejected.push(materialized.path);
    }
  }

  const sources = files.map((file) => toPackSource(file));
  if (sources.length === 0) {
    return {
      ok: false,
      materialized: false,
      submitted: false,
      note:
        rejected.length > 0
          ? `No RFP or pack files materialized. Rejected paths: ${rejected.join(", ")}.`
          : "Provide Drive file ids and/or sandbox paths, or configure RFP and knowledge Drive folders.",
      sources: [],
      files: [],
      folders,
      rejected,
    };
  }

  if (input.deadlineStore && discoveredRfps.length > 0) {
    const byId = new Map(
      input.deadlineStore.list().map((rfp) => [rfp.id, rfp] as const),
    );
    for (const rfp of discoveredRfps) {
      byId.set(rfp.id, rfp);
    }
    input.deadlineStore.save([...byId.values()]);
  }

  const result: IngestResult = {
    ok: true,
    materialized: true,
    submitted: false,
    note: READ_WITH_BUILTINS,
    sources,
    files,
    folders,
    rejected,
    openRfps: discoveredRfps,
  };

  if (ingestOutputHasFileContent(result)) {
    throw new Error("Ingest refused to return file contents. Use read_file.");
  }

  return result;
}
