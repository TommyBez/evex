import type { PackSource } from "./cite-gate";
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
}): Promise<IngestResult> {
  const files: MaterializedFile[] = [];
  const rejected: string[] = [];
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
      if (exported.encoding === "binary" && exported.bytes) {
        await input.sandbox.writeBinaryFile({
          path: materialized.path,
          content: exported.bytes,
        });
      } else {
        await input.sandbox.writeTextFile({
          path: materialized.path,
          content: exported.text ?? "",
        });
      }
      files.push(materialized);
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

  const result: IngestResult = {
    ok: true,
    materialized: true,
    submitted: false,
    note: READ_WITH_BUILTINS,
    sources,
    files,
    folders,
    rejected,
  };

  if (ingestOutputHasFileContent(result)) {
    throw new Error("Ingest refused to return file contents. Use read_file.");
  }

  return result;
}
