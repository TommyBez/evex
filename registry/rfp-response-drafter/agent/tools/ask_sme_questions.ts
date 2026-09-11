import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import {
  isSlackConfigured,
  missingSmeEnv,
  rfpResponseConfig,
} from "../lib/rfp-config";
import { buildSmeSlackText, postSlackMessage } from "../lib/slack-post";

const askSmeQuestionsInput = z.object({
  rfpTitle: z.string().min(1).max(200),
  questions: z
    .array(z.string().min(1).max(500))
    .min(1)
    .max(20)
    .describe("Open questions that need an SME before write-back."),
});

export default defineTool({
  description:
    "Route open RFP questions to SMEs on Slack Connect and pause for SME approval before any external-facing draft leaves. Always pauses. Does not write a Drive Doc, mailbox Draft, or portal submit.",
  inputSchema: askSmeQuestionsInput,
  approval: always<z.infer<typeof askSmeQuestionsInput>>(),
  async execute({ rfpTitle, questions }) {
    if (!isSlackConfigured()) {
      return {
        posted: false,
        paused: true,
        smeApproved: false,
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

    return {
      posted: result.ok,
      paused: true,
      smeApproved: result.ok,
      submitted: false,
      sent: false,
      questionCount: questions.length,
      error: result.error,
      note: result.ok
        ? "SME questions posted. Pause for SME approval before write_approved_draft. Pass smeApproved true only after the SME replies."
        : result.error,
    };
  },
});
