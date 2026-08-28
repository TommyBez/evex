import { defineTool } from "eve/tools";
import { z } from "zod";

const explainCiFailureInput = z.object({
  whatFailed: z
    .string()
    .min(1)
    .max(500)
    .describe("One short sentence describing what failed in the check."),
  file: z
    .string()
    .min(1)
    .max(500)
    .optional()
    .describe("Primary source file path from the log or annotations."),
  line: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Primary line number from the log or annotations."),
  excerpt: z
    .string()
    .min(1)
    .max(2000)
    .describe("Short log excerpt that supports the failure claim."),
  comment: z
    .string()
    .min(1)
    .max(6000)
    .describe(
      "Full markdown comment body to post on the pull request or commit. Must include what failed, file:line when known, and a short log excerpt.",
    ),
});

export type ExplainCiFailureOutput = z.infer<typeof explainCiFailureInput>;

/**
 * Publishes a CI failure explanation as a regular issue/PR (or commit) comment.
 * Intentionally has no Eve approval — unattended, like github-issue-maintainer.
 */
export default defineTool({
  description:
    "Publish a CI failure explanation comment for the failed GitHub Actions check. Call exactly once. Include what failed, file:line when known, and a short log excerpt. Does not push fixes and does not publish a pull request review.",
  inputSchema: explainCiFailureInput,
  execute(input) {
    if (input.line !== undefined && !input.file?.trim()) {
      return {
        invalid: true,
        note: "file is required when line is set.",
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
        hasFileLine: Boolean(
          "file" in output && output.file && "line" in output && output.line,
        ),
        readyToPublish: true,
      },
    };
  },
});
