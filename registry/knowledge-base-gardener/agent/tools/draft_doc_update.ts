import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  configuredProductDocsRoots,
  isAllowedProductDocsPath,
  normalizeProductDocsPath,
} from "../lib/product-docs-paths";

const draftDocUpdateInput = z.object({
  update: z
    .string()
    .min(20)
    .max(8000)
    .describe(
      "Draft documentation update. Do not claim the page was published.",
    ),
  citedPaths: z
    .array(z.string().min(1).max(400))
    .min(1)
    .max(10)
    .describe(
      "Product documentation paths this update is based on (must be under PRODUCT_DOCS_ROOTS).",
    ),
  staleReason: z
    .string()
    .min(1)
    .max(2000)
    .describe(
      "Short reason the cited page looks stale, or why it looks current.",
    ),
  staleFound: z
    .boolean()
    .describe(
      "True when the cited docs look stale. False when the pages look current.",
    ),
});

export type DraftDocUpdateOutput =
  | {
      drafted: true;
      update: string;
      citedPaths: string[];
      staleReason: string;
      staleFound: boolean;
      published: false;
    }
  | {
      drafted: false;
      note: string;
      citedPaths?: string[];
    };

/**
 * Records a documentation update draft with citations.
 * Intentionally has no Eve approval. Never publishes docs or opens GitHub
 * pull requests.
 */
export default defineTool({
  description:
    "Draft a product documentation update with file-path citations. Call once when the draft is ready. Does not publish docs, open GitHub pull requests, or send the update. Never claim the page was published.",
  inputSchema: draftDocUpdateInput,
  execute(input): DraftDocUpdateOutput {
    const roots = configuredProductDocsRoots();
    const citedPaths: string[] = [];
    const rejected: string[] = [];

    for (const raw of input.citedPaths) {
      const path = normalizeProductDocsPath(raw);
      if (!isAllowedProductDocsPath(path, roots)) {
        rejected.push(path);
        continue;
      }
      if (!citedPaths.includes(path)) {
        citedPaths.push(path);
      }
    }

    if (citedPaths.length === 0) {
      return {
        drafted: false,
        note: `Every cited path was outside product documentation scope. Allowed roots: ${roots.join(", ")}.`,
        citedPaths: rejected,
      };
    }

    if (rejected.length > 0) {
      return {
        drafted: false,
        note: `Refused non-product-docs citations: ${rejected.join(", ")}. Cite only paths under ${roots.join(", ")}.`,
        citedPaths: rejected,
      };
    }

    return {
      drafted: true,
      update: input.update,
      citedPaths,
      staleReason: input.staleReason,
      staleFound: input.staleFound,
      published: false,
    };
  },
  toModelOutput(output) {
    if (!output.drafted) {
      return {
        type: "json",
        value: {
          drafted: false,
          note: output.note,
        },
      };
    }

    return {
      type: "json",
      value: {
        drafted: true,
        published: false,
        citedPaths: output.citedPaths,
        staleFound: output.staleFound,
        updatePreview: output.update.slice(0, 240),
      },
    };
  },
});
