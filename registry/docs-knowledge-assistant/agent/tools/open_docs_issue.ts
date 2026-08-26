import { defineTool } from "eve/tools";
import type { ToolContext } from "eve/tools";
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

type OpenDocsIssueInput = z.infer<typeof openDocsIssueInput>;

export type OpenDocsIssueSuccess = OpenDocsIssueInput & {
  readyToOpen: true;
};

export type OpenDocsIssueFailure = {
  readyToOpen: false;
  note: string;
  title?: string;
};

export type OpenDocsIssueOutput = OpenDocsIssueSuccess | OpenDocsIssueFailure;

function readAuthAttribute(
  attributes: Readonly<Record<string, string | readonly string[]>> | undefined,
  key: string,
): string | undefined {
  const value = attributes?.[key];
  return typeof value === "string" ? value : undefined;
}

/** True only on GitHub issue-comment turns (publisher lives in the GitHub channel). */
function isGitHubIssueSurface(ctx: ToolContext): boolean {
  const current = ctx.session.auth.current;
  if (!current || current.authenticator !== "github-webhook") {
    return false;
  }
  return readAuthAttribute(current.attributes, "conversation_kind") === "issue";
}

export default defineTool({
  description:
    "Open a documentation-gap GitHub issue when the docs clearly lack the answer. Only works on GitHub issue-comment turns (the GitHub channel publishes the issue). Do not call from Eve chat. Never use this to label, triage, or review other issues or pull requests.",
  inputSchema: openDocsIssueInput,
  execute(input, ctx): OpenDocsIssueOutput {
    if (!isGitHubIssueSurface(ctx)) {
      return {
        readyToOpen: false,
        note: "open_docs_issue only runs on GitHub issue-comment turns. In Eve chat, say the docs gap out loud; do not claim an issue was opened.",
        title: input.title,
      };
    }

    return {
      ...input,
      readyToOpen: true,
    };
  },
  toModelOutput(output) {
    if (!output.readyToOpen) {
      return {
        type: "json",
        value: {
          readyToOpen: false,
          note: output.note,
        },
      };
    }

    return {
      type: "json",
      value: {
        readyToOpen: true,
        title: output.title,
      },
    };
  },
});
