import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  isDriveConfigured,
  isMailboxConfigured,
  isSlackConfigured,
  missingRfpConfig,
  rfpResponseConfig,
} from "../lib/rfp-config";

export default defineTool({
  description:
    "Load the configured Drive Connect, sandbox roots, mailbox, write-back target, Slack SME channel, and deadline cron. Does not return Connect UIDs, API keys, or other secrets. Call this first.",
  inputSchema: z.object({}),
  execute() {
    const missing = missingRfpConfig();
    return {
      driveConfigured: isDriveConfigured(),
      mailboxProvider: rfpResponseConfig.mailboxProvider,
      mailboxConfigured: isMailboxConfigured(),
      writeback: rfpResponseConfig.writeback,
      sandboxRoots: rfpResponseConfig.sandboxRoots,
      slackConfigured: isSlackConfigured(),
      cron: rfpResponseConfig.cron,
      digestSubject: rfpResponseConfig.digestSubject,
      missingEnv: missing,
      notConfigured: missing.length > 0,
      submitted: false,
      sent: false,
    };
  },
});
