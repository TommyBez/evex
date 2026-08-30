import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  configuredProductDocsRoots,
  isAllowedProductDocsPath,
  normalizeProductDocsPath,
} from "../lib/product-docs-paths";

const draftSupportReplyInput = z.object({
  reply: z
    .string()
    .min(20)
    .max(8000)
    .describe(
      "Customer-facing support reply in email or ticket tone. Do not claim the message was sent.",
    ),
  citedPaths: z
    .array(z.string().min(1).max(400))
    .min(1)
    .max(10)
    .describe(
      "Product documentation paths this reply is based on (must be under PRODUCT_DOCS_ROOTS).",
    ),
  customerQuestion: z
    .string()
    .min(1)
    .max(2000)
    .describe("Short restatement of the customer question being answered."),
  docsCovered: z
    .boolean()
    .describe(
      "True when product docs cover the question. False when the reply must say the docs do not cover it.",
    ),
});

export type DraftSupportReplyOutput =
  | {
      drafted: true;
      reply: string;
      citedPaths: string[];
      customerQuestion: string;
      docsCovered: boolean;
      sent: false;
    }
  | {
      drafted: false;
      note: string;
      citedPaths?: string[];
    };

/**
 * Records a customer support reply draft with citations.
 * Intentionally has no Eve approval — unattended, like
 * github-issue-maintainer triage_issue / send_digest_email and
 * docs-knowledge-assistant open_docs_issue. Never sends mail, posts to a
 * ticket API, or opens GitHub issues.
 */
export default defineTool({
  description:
    "Draft a customer-facing support reply from product docs and return the reply text plus cited paths. Call once when the draft is ready. Does not send email, post to a ticket system, or open GitHub issues. Never claim the message was delivered.",
  inputSchema: draftSupportReplyInput,
  execute(input): DraftSupportReplyOutput {
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
      reply: input.reply,
      citedPaths,
      customerQuestion: input.customerQuestion,
      docsCovered: input.docsCovered,
      sent: false,
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
        sent: false,
        citedPaths: output.citedPaths,
        docsCovered: output.docsCovered,
        replyPreview: output.reply.slice(0, 240),
      },
    };
  },
});
