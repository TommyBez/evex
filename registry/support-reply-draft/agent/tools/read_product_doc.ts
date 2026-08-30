import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  configuredProductDocsRoots,
  isAllowedProductDocsPath,
  normalizeProductDocsPath,
} from "../lib/product-docs-paths";

const readProductDocInput = z.object({
  path: z
    .string()
    .min(1)
    .max(400)
    .describe(
      "Product documentation path to read (must be under PRODUCT_DOCS_ROOTS).",
    ),
  offset: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Optional 1-based start line."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(400)
    .optional()
    .describe("Optional max number of lines to return."),
});

/**
 * Read one product documentation file. Intentionally has no Eve approval —
 * read-only, like docs-knowledge-assistant read_doc.
 */
export default defineTool({
  description:
    "Read a product documentation file from the configured help/support roots. Refuses application source, tests, and paths outside PRODUCT_DOCS_ROOTS.",
  inputSchema: readProductDocInput,
  async execute(input, ctx) {
    const roots = configuredProductDocsRoots();
    const path = normalizeProductDocsPath(input.path);
    if (!isAllowedProductDocsPath(path, roots)) {
      return {
        ok: false as const,
        path,
        note: `Path is outside product documentation scope. Allowed roots: ${roots.join(", ")}.`,
      };
    }

    const sandbox = await ctx.getSandbox();
    const start = input.offset ?? 1;
    const limit = input.limit ?? 200;
    const end = start + limit - 1;

    try {
      const content = await sandbox.readTextFile({
        path,
        startLine: start,
        endLine: end,
      });

      if (content === null) {
        return {
          ok: false as const,
          path,
          note: "Product documentation file not found in the workspace checkout.",
        };
      }

      return {
        ok: true as const,
        path,
        content: content.slice(0, 24_000),
        offset: start,
        limit,
      };
    } catch {
      return {
        ok: false as const,
        path,
        note: "Product documentation file not found in the workspace checkout.",
      };
    }
  },
});
