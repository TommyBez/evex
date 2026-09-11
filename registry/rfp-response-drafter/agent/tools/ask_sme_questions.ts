import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import {
  isSlackConfigured,
  missingSmeEnv,
  rfpResponseConfig,
  siblingStorePath,
} from "../lib/rfp-config";
import { createSmeStore } from "../lib/sme-store";
import { buildSmeSlackText, postSlackMessage } from "../lib/slack-post";

const askSmeQuestionsInput = z.object({
  rfpId: z.string().min(1).max(200),
  rfpTitle: z.string().min(1).max(200),
  questions: z
    .array(z.string().min(1).max(500))
    .min(1)
    .max(20)
    .describe("Open questions that need an SME before write-back."),
});

export default defineTool({
  description:
    "Route open RFP questions to SMEs on Slack Connect and create a pending approval record. Posting is not approval. Always pauses. Does not write a Drive Doc, mailbox Draft, or portal submit.",
  inputSchema: askSmeQuestionsInput,
  approval: always<z.infer<typeof askSmeQuestionsInput>>(),
  async execute({ rfpId, rfpTitle, questions }) {
    if (!isSlackConfigured()) {
      return {
        posted: false,
        paused: true,
        smeApproved: false,
        smeStatus: "pending" as const,
        submitted: false,
        sent: false,
        note: "Slack SME routing is not configured.",
        missingEnv: missingSmeEnv(),
      };
    }

    const result = await postSlackMessage({
      connectUid: rfpResponseConfig.slackConnectUid ?? "",
      channelId: rfpResponseConfig.slackChannelId ?? "",
      text: buildSmeSlackText({ rfpTitle, questions }),
    });
    if (!result.ok) {
      return {
        posted: false,
        paused: true,
        smeApproved: false,
        smeStatus: "pending" as const,
        submitted: false,
        sent: false,
        questionCount: questions.length,
        error: result.error,
        note: result.error,
      };
    }

    const request = createSmeStore(
      siblingStorePath(rfpResponseConfig.storePath, "rfp-sme-store.json"),
    ).createPending({ rfpId, rfpTitle, questions });

    return {
      posted: true,
      paused: true,
      smeApproved: false,
      smeStatus: request.status,
      smeRequestId: request.smeRequestId,
      submitted: false,
      sent: false,
      questionCount: questions.length,
      note: "SME questions posted and recorded as pending. A Slack accept is not approval. Call record_sme_reply after a correlated SME reply.",
    };
  },
});
