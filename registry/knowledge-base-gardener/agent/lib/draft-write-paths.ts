import {
  isAllowedProductDocsPath,
  normalizeProductDocsPath,
} from "./product-docs-paths";

/** Sandbox directory where optional draft files may be written. */
export const DRAFT_OUTPUT_ROOT = "drafts";

const WORKSPACE_PREFIX = "/workspace/";

export type DraftWritePathDecision =
  | { ok: true; absolutePath: string }
  | { ok: false; note: string };

const REFUSED_OUTSIDE_DRAFTS = `write_file may only create files under /workspace/${DRAFT_OUTPUT_ROOT}/. It cannot write product documentation or other protected paths.`;
const REFUSED_PRODUCT_DOCS = `Refused write under product documentation. Allowed draft root: /workspace/${DRAFT_OUTPUT_ROOT}/.`;

function isSandboxHomePath(filePath: string): boolean {
  return filePath === "$HOME" || filePath.startsWith("$HOME/");
}

function isOutsideWorkspaceAbsolute(filePath: string): boolean {
  return filePath.startsWith("/") && !filePath.startsWith(WORKSPACE_PREFIX);
}

/**
 * True when the path is a file under the draft-only sandbox root and is not
 * a configured product-docs path.
 */
export function isAllowedDraftWritePath(
  filePath: string,
  productDocsRoots: readonly string[],
): boolean {
  return evaluateDraftWritePath(filePath, productDocsRoots).ok;
}

/**
 * Resolve a model-supplied write path. Eve's write_file requires an absolute
 * sandbox path; relative `drafts/…` inputs are rewritten to
 * `/workspace/drafts/…`. Product-docs roots and other protected paths are
 * refused.
 */
export function evaluateDraftWritePath(
  filePath: string,
  productDocsRoots: readonly string[],
): DraftWritePathDecision {
  const trimmed = filePath.trim().replaceAll("\\", "/");
  if (
    trimmed.length === 0 ||
    isSandboxHomePath(trimmed) ||
    isOutsideWorkspaceAbsolute(trimmed)
  ) {
    return { ok: false, note: REFUSED_OUTSIDE_DRAFTS };
  }

  const relative = normalizeProductDocsPath(trimmed);
  const underDrafts =
    relative.startsWith(`${DRAFT_OUTPUT_ROOT}/`) &&
    relative.length > `${DRAFT_OUTPUT_ROOT}/`.length;

  if (relative.length === 0 || relative.includes("..") || !underDrafts) {
    return { ok: false, note: REFUSED_OUTSIDE_DRAFTS };
  }

  if (isAllowedProductDocsPath(relative, productDocsRoots)) {
    return { ok: false, note: REFUSED_PRODUCT_DOCS };
  }

  return { ok: true, absolutePath: `${WORKSPACE_PREFIX}${relative}` };
}
