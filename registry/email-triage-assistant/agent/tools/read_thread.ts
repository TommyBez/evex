import { defineTool } from "eve/tools";
import { z } from "zod";

import { createConfiguredMailbox } from "../lib/providers/index";

export default defineTool({
  description:
    "Read one inbox thread from the configured mailbox. Read-only. Never sends mail.",
  inputSchema: z.object({
    threadId: z.string().min(1).max(400),
  }),
  async execute({ threadId }) {
    const mailbox = createConfiguredMailbox();
    if (!mailbox.ok) {
      return {
        read: false,
        sent: false,
        note: mailbox.note,
        missingEnv: mailbox.missingEnv,
      };
    }

    const thread = await mailbox.value.readThread(threadId);
    return {
      read: true,
      sent: false,
      thread,
    };
  },
});
