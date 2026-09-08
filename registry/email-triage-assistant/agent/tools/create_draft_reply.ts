import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { createConfiguredMailbox } from "../lib/providers/index";
import { assertNotSendIntent } from "../lib/send-guard";

const createDraftReplyInput = z.object({
  threadId: z.string().min(1).max(400),
  to: z.string().min(3).max(300),
  subject: z.string().min(1).max(300),
  body: z.string().min(20).max(8000),
  inReplyTo: z.string().max(300).optional(),
  intent: z
    .string()
    .max(40)
    .optional()
    .describe("Must be draft. send, smtp, and sendmail are refused."),
});

export default defineTool({
  description:
    "Write a tone-matched reply into the mailbox Drafts folder (Gmail drafts.create, Microsoft Graph createReply, or IMAP APPEND to Drafts). Always pauses for Eve human approval on cron and webhook runs. Always returns sent false. There is no send, SMTP, or drafts.send path.",
  approval: always<z.infer<typeof createDraftReplyInput>>(),
  inputSchema: createDraftReplyInput,
  async execute({ threadId, to, subject, body, inReplyTo, intent }) {
    try {
      assertNotSendIntent(intent);
    } catch (error) {
      return {
        drafted: false,
        sent: false,
        note: error instanceof Error ? error.message : "Send intent refused.",
      };
    }

    if (intent && intent.trim().toLowerCase() !== "draft") {
      return {
        drafted: false,
        sent: false,
        note: "intent must be draft. This tool only writes Drafts.",
      };
    }

    const mailbox = createConfiguredMailbox();
    if (!mailbox.ok) {
      return {
        drafted: false,
        sent: false,
        note: mailbox.note,
        missingEnv: mailbox.missingEnv,
      };
    }

    const result = await mailbox.value.createDraftReply({
      threadId,
      to,
      subject,
      body,
      inReplyTo,
    });
    return result;
  },
});
