import type { PackSource } from "./cite-gate";
import { DEFAULT_PACK_ROOT, DEFAULT_RFP_ROOT } from "./rfp-config";
import { normalizeSandboxPath } from "./sandbox-paths";

export const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";
export const PDF_MIME = "application/pdf";

export type MaterializedFile = {
  readonly sourceId: string;
  readonly title: string;
  readonly kind: "rfp" | "pack";
  readonly origin: "drive" | "sandbox";
  readonly path: string;
  readonly workspacePath: string;
  readonly encoding: "text" | "binary";
  readonly driveFileId?: string;
  readonly driveUrl?: string;
};

export function isGoogleDocMime(mimeType: string): boolean {
  return mimeType === GOOGLE_DOC_MIME;
}

export function isPdfMime(mimeType: string): boolean {
  return mimeType === PDF_MIME || mimeType.endsWith("/pdf");
}

export function isDriveExportCandidate(mimeType: string): boolean {
  return (
    isGoogleDocMime(mimeType) ||
    isPdfMime(mimeType) ||
    mimeType.startsWith("text/")
  );
}

export function exportEncoding(
  mimeType: string,
): "text" | "binary" {
  return isPdfMime(mimeType) && !mimeType.startsWith("text/")
    ? "binary"
    : "text";
}

export function safeFilename(name: string, mimeType: string): string {
  const cleaned = name
    .replaceAll(/[\\/]/g, "-")
    .replaceAll(/[\u0000-\u001f]/g, "")
    .trim();
  const base = cleaned.length > 0 ? cleaned : "untitled";
  if (isGoogleDocMime(mimeType) && !/\.(txt|md)$/i.test(base)) {
    return `${base}.txt`;
  }
  if (isPdfMime(mimeType) && !/\.pdf$/i.test(base)) {
    return `${base}.pdf`;
  }
  return base;
}

export function workspaceRelativePath(
  kind: "rfp" | "pack",
  filename: string,
): string {
  const root = kind === "rfp" ? DEFAULT_RFP_ROOT : DEFAULT_PACK_ROOT;
  return `${root}/${safeFilename(filename, "")}`;
}

export function workspaceAbsolutePath(relative: string): string {
  const normalized = normalizeSandboxPath(relative);
  return `/workspace/${normalized}`;
}

export function driveFileUrl(input: {
  readonly id: string;
  readonly mimeType?: string;
  readonly webViewLink?: string;
}): string {
  if (input.webViewLink?.trim()) {
    return input.webViewLink.trim();
  }
  if (input.mimeType === GOOGLE_DOC_MIME) {
    return `https://docs.google.com/document/d/${input.id}/edit`;
  }
  return `https://drive.google.com/file/d/${input.id}/view`;
}

export function toPackSource(file: MaterializedFile): PackSource {
  return {
    sourceId: file.sourceId,
    title: file.title,
    kind: file.kind,
    origin: file.origin,
    path: file.path,
    workspacePath: file.workspacePath,
    driveFileId: file.driveFileId,
    driveUrl: file.driveUrl,
  };
}

export function materializedFromDrive(input: {
  readonly fileId: string;
  readonly name: string;
  readonly mimeType: string;
  readonly kind: "rfp" | "pack";
  readonly webViewLink?: string;
}): MaterializedFile {
  const filename = safeFilename(input.name, input.mimeType);
  const path = workspaceRelativePath(input.kind, filename);
  return {
    sourceId: `drive:${input.fileId}`,
    title: input.name,
    kind: input.kind,
    origin: "drive",
    path,
    workspacePath: workspaceAbsolutePath(path),
    encoding: exportEncoding(input.mimeType),
    driveFileId: input.fileId,
    driveUrl: driveFileUrl({
      id: input.fileId,
      mimeType: input.mimeType,
      webViewLink: input.webViewLink,
    }),
  };
}

export function materializedFromSandbox(input: {
  readonly path: string;
  readonly kind: "rfp" | "pack";
}): MaterializedFile {
  const path = normalizeSandboxPath(input.path);
  return {
    sourceId: `sandbox:${path}`,
    title: path,
    kind: input.kind,
    origin: "sandbox",
    path,
    workspacePath: workspaceAbsolutePath(path),
    encoding: "text",
  };
}

export function ingestOutputHasFileContent(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as { files?: readonly unknown[] };
  for (const file of record.files ?? []) {
    if (
      file &&
      typeof file === "object" &&
      "content" in file &&
      (file as { content?: unknown }).content !== undefined
    ) {
      return true;
    }
  }
  return false;
}
