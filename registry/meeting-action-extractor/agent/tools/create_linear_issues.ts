import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { refuseLinearCreate, type LinearIssueDraft } from "../lib/linear-issue-drafts";

const linearIssueDraftInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(4000),
  teamId: z.string().max(80).nullable(),
  teamKey: z.string().max(80).nullable(),
  assigneeName: z.string().max(80).nullable(),
  dueDate: z.string().max(80).nullable(),
  sourcePath: z.string().min(1).max(400),
});

const createLinearIssuesInput = z.object({
  issues: z
    .array(linearIssueDraftInput)
    .min(1)
    .max(20)
    .describe("Draft Linear issue payloads awaiting human approval."),
});

/**
 * Human approval gate before any Linear create. Even after approval this
 * tool never creates issues — created is always false in code.
 */
export default defineTool({
  description:
    "Ask a human to approve drafted Linear issues. Always pauses for approval. Never creates Linear issues, even after approval. Do not claim issues were filed.",
  inputSchema: createLinearIssuesInput,
  approval: always<z.infer<typeof createLinearIssuesInput>>(),
  execute(input) {
    return refuseLinearCreate(input.issues as LinearIssueDraft[], true);
  },
  toModelOutput(output) {
    return {
      type: "json",
      value: {
        approved: output.approved,
        created: false,
        count: output.issues.length,
        note: output.note,
      },
    };
  },
});
