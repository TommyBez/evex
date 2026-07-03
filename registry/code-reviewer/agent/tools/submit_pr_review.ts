import { defineTool } from "eve/tools";
import { z } from "zod";

const reviewSide = z.enum(["RIGHT", "LEFT"]);
const reviewSeverity = z.enum(["blocking", "warning", "nit"]);

const reviewComment = z.object({
  body: z.string().min(1).max(4000),
  line: z.number().int().positive(),
  path: z.string().min(1),
  severity: reviewSeverity,
  side: reviewSide.default("RIGHT"),
  startLine: z.number().int().positive().optional(),
  startSide: reviewSide.optional(),
  suggestion: z.string().min(1).max(8000).optional(),
});

const submitPrReviewInput = z.object({
  comments: z.array(reviewComment).max(10),
  summary: z.string().min(1).max(4000),
});

export type SubmitPrReviewComment = z.infer<typeof reviewComment>;
export type SubmitPrReviewOutput = z.infer<typeof submitPrReviewInput>;

export default defineTool({
  description:
    "Submit the final pull request review as a structured summary plus inline comments. Use this exactly once when the review is ready to publish.",
  inputSchema: submitPrReviewInput,
  execute(input) {
    return input;
  },
  toModelOutput(output) {
    return {
      type: "json",
      value: {
        hasSummary: output.summary.length > 0,
        inlineCommentCount: output.comments.length,
        readyToPublish: true,
      },
    };
  },
});
