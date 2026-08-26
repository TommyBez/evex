import { defineTool } from "eve/tools";
import { z } from "zod";

const openDocsIssueInput = z.object({
  title: z
    .string()
    .min(8)
    .max(200)
    .describe("Short GitHub issue title describing the documentation gap."),
  body: z
    .string()
    .min(20)
    .max(4000)
    .describe(
      "Issue body explaining the unanswered question and which docs were checked.",
    ),
  rationale: z
    .string()
    .min(1)
    .max(500)
    .describe("One-sentence reason the docs gap is clear enough to track."),
});

export type OpenDocsIssueOutput = z.infer<typeof openDocsIssueInput>;

export default defineTool({
  description:
    "Open a documentation-gap GitHub issue when the docs clearly lack the answer. Call only for clear gaps. Never use this to label, triage, or review other issues or pull requests.",
  inputSchema: openDocsIssueInput,
  execute(input) {
    return input;
  },
  toModelOutput(output) {
    return {
      type: "json",
      value: {
        readyToOpen: true,
        title: output.title,
      },
    };
  },
});
