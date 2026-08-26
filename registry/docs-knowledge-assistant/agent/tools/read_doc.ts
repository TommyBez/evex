import { defineTool } from "eve/tools";
import { z } from "zod";

import { isAllowedDocsPath, normalizeDocsPath } from "../lib/docs-paths";

const readDocInput = z.object({
  path: z
    .string()
    .min(1)
    .max(400)
    .describe(
      "Documentation path to read (README.md, docs/**, CONTRIBUTING*, or AGENTS.md).",
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

export default defineTool({
  description:
    "Read a documentation file from the repository checkout. Refuses non-docs paths.",
  inputSchema: readDocInput,
  async execute(input, ctx) {
    const path = normalizeDocsPath(input.path);
    if (!isAllowedDocsPath(path)) {
      return {
        ok: false as const,
        path,
        note: "Path is outside documentation scope (README, docs/, CONTRIBUTING*, AGENTS.md).",
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
          note: "Documentation file not found in the workspace checkout.",
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
        note: "Documentation file not found in the workspace checkout.",
      };
    }
  },
});
