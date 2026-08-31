/** Default product-doc roots when PRODUCT_DOCS_ROOTS is unset. */
export const DEFAULT_PRODUCT_DOCS_ROOTS: readonly string[] = [
  "docs/help",
  "docs/support",
  "help",
  "support",
];

/** Normalize a model-supplied path to a workspace-relative candidate. */
export function normalizeProductDocsPath(input: string): string {
  const trimmed = input.trim().replaceAll("\\", "/");
  const withoutWorkspace = trimmed
    .replace(/^\/workspace\//, "")
    .replace(/^\.\//, "");
  // Strip leading and trailing separators so roots like `docs/help/` still
  // match children such as `docs/help/billing.md` (not `docs/help//billing.md`).
  return withoutWorkspace.replace(/^\/+/, "").replace(/\/+$/, "");
}

/**
 * Parse PRODUCT_DOCS_ROOTS (comma-separated). Empty / missing → defaults.
 * Roots are workspace-relative directories or files for product help docs.
 */
export function productDocsRootsFromEnv(
  envValue: string | undefined,
): readonly string[] {
  if (envValue === undefined || envValue.trim().length === 0) {
    return DEFAULT_PRODUCT_DOCS_ROOTS;
  }

  const roots: string[] = [];
  const seen = new Set<string>();
  for (const part of envValue.split(",")) {
    const root = normalizeProductDocsPath(part);
    if (root.length === 0 || root.includes("..") || seen.has(root)) {
      continue;
    }
    roots.push(root);
    seen.add(root);
  }

  return roots.length > 0 ? roots : DEFAULT_PRODUCT_DOCS_ROOTS;
}

/** True when the path sits under a configured product-docs root. */
export function isAllowedProductDocsPath(
  input: string,
  roots: readonly string[],
): boolean {
  const relative = normalizeProductDocsPath(input);
  if (relative.length === 0 || relative.includes("..")) {
    return false;
  }

  for (const root of roots) {
    const normalizedRoot = normalizeProductDocsPath(root);
    if (normalizedRoot.length === 0) {
      continue;
    }
    if (
      relative === normalizedRoot ||
      relative.startsWith(`${normalizedRoot}/`)
    ) {
      return true;
    }
  }

  return false;
}

/** Runtime product-docs roots from process.env.PRODUCT_DOCS_ROOTS. */
export function configuredProductDocsRoots(): readonly string[] {
  return productDocsRootsFromEnv(process.env.PRODUCT_DOCS_ROOTS);
}

export type ProductDocsSearchHit = {
  line: number;
  path: string;
  text: string;
};

/**
 * Parse one rg/grep `-n -H` line (`path:line:text`). Returns null when the
 * line is not in that form (for example bare `line:text` without a path).
 */
export function parseProductDocsSearchHitLine(
  line: string,
): ProductDocsSearchHit | null {
  const match = /^([^:]+):(\d+):(.*)$/.exec(line);
  if (!match) {
    return null;
  }
  return {
    path: normalizeProductDocsPath(match[1] ?? ""),
    line: Number(match[2]),
    text: (match[3] ?? "").slice(0, 240),
  };
}
