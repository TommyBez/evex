import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  configuredProductDocsRoots,
  isAllowedProductDocsPath,
  normalizeProductDocsPath,
  parseProductDocsSearchHitLine,
  type ProductDocsSearchHit,
} from "../lib/product-docs-paths";

const searchProductDocsInput = z.object({
  query: z
    .string()
    .min(1)
    .max(200)
    .describe(
      "Literal or simple keyword query to search inside product documentation.",
    ),
  pathHint: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe(
      "Optional product-docs path or directory to narrow the search (must be under PRODUCT_DOCS_ROOTS).",
    ),
});

/**
 * Search product documentation only. Intentionally has no Eve approval.
 */
export default defineTool({
  description:
    "Search product documentation (product doc roots from PRODUCT_DOCS_ROOTS) for a query. Prefer this before drafting an update. Does not search application source, tests, or lockfiles.",
  inputSchema: searchProductDocsInput,
  async execute(input, ctx) {
    const configuredRoots = configuredProductDocsRoots();
    let roots: string[];
    if (input.pathHint) {
      roots = [normalizeProductDocsPath(input.pathHint)];
    } else {
      roots = [...configuredRoots];
    }

    for (const root of roots) {
      if (!isAllowedProductDocsPath(root, configuredRoots)) {
        return {
          hits: [] as ProductDocsSearchHit[],
          note: `Refused non-product-docs path: ${root}. Allowed roots: ${configuredRoots.join(", ")}.`,
          query: input.query,
          roots: configuredRoots,
        };
      }
    }

    const sandbox = await ctx.getSandbox();
    const escaped = input.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pathArgs = roots.map((root) => shellQuote(root)).join(" ");
    const command = [
      "set +e",
      `if command -v rg >/dev/null 2>&1; then rg -n -H -S --no-heading -e ${shellQuote(escaped)} ${pathArgs} 2>/dev/null | head -n 40; else grep -RInH -E ${shellQuote(escaped)} ${pathArgs} 2>/dev/null | head -n 40; fi`,
      "exit 0",
    ].join("; ");

    const result = await sandbox.run({ command });
    const stdout = result.stdout ?? "";

    const hits: ProductDocsSearchHit[] = [];
    for (const line of stdout.split("\n")) {
      if (!line.trim()) {
        continue;
      }
      const hit = parseProductDocsSearchHitLine(line);
      if (!hit) {
        continue;
      }
      if (!isAllowedProductDocsPath(hit.path, configuredRoots)) {
        continue;
      }
      hits.push(hit);
    }

    return {
      hits,
      note:
        hits.length === 0
          ? "No product-documentation matches. If the docs do not show a stale page, say so and do not invent churn."
          : `Found ${hits.length} product-documentation hit(s).`,
      query: input.query,
      roots: configuredRoots,
    };
  },
});

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}
