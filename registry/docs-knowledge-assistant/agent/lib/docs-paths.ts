const README_PATTERN = /^README(?:\.[^./]+)?$/i;
const CONTRIBUTING_PATTERN = /^CONTRIBUTING(?:\.[^./]+)?$/i;
const AGENTS_PATTERN = /^AGENTS\.md$/i;
const DOCS_PREFIX_PATTERN = /^docs\//i;

/** Normalize a model-supplied path to a workspace-relative docs candidate. */
export function normalizeDocsPath(input: string): string {
  const trimmed = input.trim().replaceAll("\\", "/");
  const withoutWorkspace = trimmed
    .replace(/^\/workspace\//, "")
    .replace(/^\.\//, "");
  return withoutWorkspace.replace(/^\/+/, "");
}

/** True when the path is a documentation file this agent may read. */
export function isAllowedDocsPath(input: string): boolean {
  const relative = normalizeDocsPath(input);
  if (relative.length === 0 || relative.includes("..")) {
    return false;
  }

  const baseName = relative.includes("/")
    ? relative.slice(relative.lastIndexOf("/") + 1)
    : relative;

  if (README_PATTERN.test(baseName) && !relative.includes("/")) {
    return true;
  }

  if (CONTRIBUTING_PATTERN.test(baseName) && !relative.includes("/")) {
    return true;
  }

  if (AGENTS_PATTERN.test(baseName) && !relative.includes("/")) {
    return true;
  }

  return DOCS_PREFIX_PATTERN.test(relative);
}

export function docsSearchRoots(): readonly string[] {
  return ["README.md", "README", "CONTRIBUTING.md", "CONTRIBUTING", "AGENTS.md", "docs"];
}
