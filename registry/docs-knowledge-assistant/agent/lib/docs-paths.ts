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

/**
 * Static fallback roots when the workspace listing is empty (eval fixtures,
 * sparse checkouts). Prefer {@link docsSearchRootsFromListing} at runtime.
 */
export function docsSearchRoots(): readonly string[] {
  return [
    "README.md",
    "README",
    "CONTRIBUTING.md",
    "CONTRIBUTING",
    "AGENTS.md",
    "docs",
  ];
}

/**
 * Build search roots from a workspace root listing so README.* and
 * CONTRIBUTING.* variants (rst, txt, adoc, …) are included when present.
 * Stays inside documentation roots; never adds application source paths.
 */
export function docsSearchRootsFromListing(
  entries: readonly string[],
): string[] {
  const roots: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const name = entry.trim().replace(/\/+$/, "");
    if (name.length === 0 || name.includes("/") || name.includes("..")) {
      continue;
    }

    if (name === "docs") {
      if (!seen.has("docs")) {
        roots.push("docs");
        seen.add("docs");
      }
      continue;
    }

    if (!isAllowedDocsPath(name) || seen.has(name)) {
      continue;
    }

    roots.push(name);
    seen.add(name);
  }

  return roots;
}
