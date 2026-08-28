import { defineTool } from "eve/tools";
import { z } from "zod";

const explainCiFailureInput = z.object({
  checkRunId: z
    .number()
    .int()
    .positive()
    .describe(
      "The check_run_id from <github_ci_failure_context>. Required so failed publishes can release the handled claim.",
    ),
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
    .optional()
    .describe(
      "Optional draft comment. Ignored at publish time — the channel always builds the posted body from whatFailed, file, line, and excerpt.",
    ),
});

export type ExplainCiFailureOutput = z.infer<typeof explainCiFailureInput>;

/**
 * Publishes a CI failure explanation as a regular issue/PR (or commit) comment.
 * Intentionally has no Eve approval — unattended, like github-issue-maintainer.
 * Publication uses structured fields only; optional `comment` is never posted raw.
 */
export default defineTool({
  description:
    "Publish a CI failure explanation for the failed GitHub Actions check. Call exactly once with checkRunId, whatFailed, file/line when known, and a short excerpt. The channel posts a structured comment from those fields (optional comment is ignored). Does not push fixes and does not publish a pull request review.",
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
        checkRunId: "checkRunId" in output ? output.checkRunId : undefined,
        hasFileLine: Boolean(
          "file" in output && output.file && "line" in output && output.line,
        ),
        readyToPublish: true,
      },
    };
  },
});
