import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  configuredProductDocsRoots,
  isAllowedProductDocsPath,
  normalizeProductDocsPath,
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

type SearchHit = {
  line: number;
  path: string;
  text: string;
};

/**
 * Search product help/support documentation only. Intentionally has no Eve
 * approval — read-only, like docs-knowledge-assistant search_docs.
 */
export default defineTool({
  description:
    "Search product documentation (help/support/product doc roots from PRODUCT_DOCS_ROOTS) for a query. Prefer this before drafting a reply. Does not search application source, tests, or lockfiles.",
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
          hits: [] as SearchHit[],
          note: `Refused non-product-docs path: ${root}. Allowed roots: ${configuredRoots.join(", ")}.`,
          query: input.query,
          roots: configuredRoots,
        };
      }
    }

    const sandbox = await ctx.getSandbox();
    const escaped = input.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pathArgs = roots.map((root) => shellQuote(root)).join(" ");
    // Prefer rg when present. Do not pipe rg into head before checking
    // availability: without rg, `rg | head` still exits 0 via head and would
    // skip the grep fallback.
    const command = [
      "set +e",
      `if command -v rg >/dev/null 2>&1; then rg -n -S --no-heading -e ${shellQuote(escaped)} ${pathArgs} 2>/dev/null | head -n 40; else grep -RIn -E ${shellQuote(escaped)} ${pathArgs} 2>/dev/null | head -n 40; fi`,
      "exit 0",
    ].join("; ");

    const result = await sandbox.run({ command });
    const stdout = result.stdout ?? "";

    const hits: SearchHit[] = [];
    for (const line of stdout.split("\n")) {
      if (!line.trim()) {
        continue;
      }
      const match = /^([^:]+):(\d+):(.*)$/.exec(line);
      if (!match) {
        continue;
      }
      const path = normalizeProductDocsPath(match[1] ?? "");
      if (!isAllowedProductDocsPath(path, configuredRoots)) {
        continue;
      }
      hits.push({
        path,
        line: Number(match[2]),
        text: (match[3] ?? "").slice(0, 240),
      });
    }

    return {
      hits,
      note:
        hits.length === 0
          ? "No product-documentation matches. If the docs do not cover the question, say so and do not invent policy."
          : `Found ${hits.length} product-documentation hit(s).`,
      query: input.query,
      roots: configuredRoots,
    };
  },
});

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}
