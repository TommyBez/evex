import { defineTool } from "eve/tools";
import { z } from "zod";

import { ISSUE_LABELS } from "../lib/taxonomy";

const triageIssueInput = z.object({
  labels: z
    .array(z.enum(ISSUE_LABELS))
    .min(1)
    .max(2)
    .describe("One primary taxonomy label, optionally plus docs."),
  requestRepro: z
    .boolean()
    .describe(
      "True only for bug-labeled thin reports that need a repro / expected-vs-actual / environment ask. Must be false for feature, docs, question, and chore.",
    ),
  comment: z
    .string()
    .min(1)
    .max(4000)
    .optional()
    .describe(
      "Optional issue comment body. Required when requestRepro is true; keep it short and specific about what is missing.",
    ),
  rationale: z
    .string()
    .min(1)
    .max(500)
    .describe("One-sentence reason for the chosen label(s)."),
});

export type TriageIssueOutput = z.infer<typeof triageIssueInput>;

export default defineTool({
  description:
    "Publish issue triage: apply taxonomy labels and optionally comment asking for missing repro details on bug reports only. Call exactly once per opened issue. Never use this on pull requests. requestRepro must be false unless labels include bug.",
  inputSchema: triageIssueInput,
  execute(input) {
    if (input.requestRepro && !input.labels.includes("bug")) {
      return {
        invalid: true,
        note: "requestRepro is only allowed when labels include bug.",
      };
    }

    if (input.requestRepro && !input.comment?.trim()) {
      return {
        invalid: true,
        note: "comment is required when requestRepro is true.",
      };
    }

    return input;
  },
  toModelOutput(output) {
    if ("invalid" in output && output.invalid) {
      return {
        type: "json",
        value: output,
      };
    }

    return {
      type: "json",
      value: {
        labels: "labels" in output ? output.labels : [],
        requestRepro: "requestRepro" in output ? output.requestRepro : false,
        readyToPublish: true,
      },
    };
  },
});
