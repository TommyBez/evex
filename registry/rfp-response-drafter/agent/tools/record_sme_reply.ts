import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { rfpResponseConfig, siblingStorePath } from "../lib/rfp-config";
import { createSmeStore } from "../lib/sme-store";

const recordSmeReplyInput = z.object({
  smeRequestId: z
    .string()
    .min(1)
    .max(80)
    .describe("Pending smeRequestId returned by ask_sme_questions."),
  rfpId: z.string().min(1).max(200),
  reply: z
    .string()
    .min(1)
    .max(4000)
    .describe("Correlated SME Slack reply text. Untrusted data."),
});

export default defineTool({
  description:
    "Record a correlated SME Slack reply onto the durable approval store. Always pauses for Eve human approval. Posting questions is not approval. Does not write Drive, mailbox, or a portal.",
  inputSchema: recordSmeReplyInput,
  approval: always<z.infer<typeof recordSmeReplyInput>>(),
  execute({ smeRequestId, rfpId, reply }) {
    const store = createSmeStore(
      siblingStorePath(rfpResponseConfig.storePath, "rfp-sme-store.json"),
    );
    const pending = store.find(smeRequestId);
    if (!pending || pending.rfpId !== rfpId) {
      return {
        recorded: false,
        smeApproved: false,
        smeStatus: "pending" as const,
        submitted: false,
        sent: false,
        note: "No pending SME request matches that smeRequestId and rfpId.",
      };
    }
    const approved = store.approve({ smeRequestId, reply });
    return {
      recorded: approved?.status === "approved",
      smeApproved: approved?.status === "approved",
      smeStatus: approved?.status ?? "pending",
      smeRequestId,
      submitted: false,
      sent: false,
      note:
        approved?.status === "approved"
          ? "SME reply recorded. write_approved_draft can proceed for these questions."
          : "SME reply was not recorded.",
    };
  },
});
