import { defineTool } from "eve/tools";
import { z } from "zod";

import { emailTriageConfig } from "../lib/email-config";
import { createConfiguredMailbox } from "../lib/providers/index";

export default defineTool({
  description:
    "List recent inbox threads from the configured Gmail, Outlook, or IMAP mailbox. Read-only. Never sends mail.",
  inputSchema: z.object({
    max: z
      .number()
      .int()
      .positive()
      .max(50)
      .optional()
      .describe("Maximum threads to list. Defaults to EMAIL_MAX_THREADS."),
  }),
  async execute({ max }) {
    const mailbox = createConfiguredMailbox();
    if (!mailbox.ok) {
      return {
        listed: false,
        sent: false,
        note: mailbox.note,
        missingEnv: mailbox.missingEnv,
      };
    }

    const threads = await mailbox.value.listThreads({
      max: max ?? emailTriageConfig.maxThreads,
    });
    return {
      listed: true,
      sent: false,
      provider: mailbox.value.provider,
      threads,
    };
  },
});
