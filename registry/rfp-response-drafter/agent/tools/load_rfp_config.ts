import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  isDriveConfigured,
  isEmailDigestConfigured,
  isMailboxConfigured,
  isSlackConfigured,
  missingRfpConfig,
  resolveDrivePackFolderId,
  resolveDriveRfpFolderId,
  rfpResponseConfig,
} from "../lib/rfp-config";

export default defineTool({
  description:
    "Load the configured Drive RFP and knowledge folders, sandbox roots, mailbox, write-back target, Slack SME channel, and deadline digest channels. Does not return Connect UIDs, API keys, or other secrets. Call this first.",
  inputSchema: z.object({}),
  execute() {
    const missing = missingRfpConfig();
    return {
      driveConfigured: isDriveConfigured(),
      driveRfpFolderConfigured: Boolean(resolveDriveRfpFolderId(rfpResponseConfig)),
      drivePackFolderConfigured: Boolean(
        resolveDrivePackFolderId(rfpResponseConfig),
      ),
      mailboxProvider: rfpResponseConfig.mailboxProvider,
      mailboxConfigured: isMailboxConfigured(),
      writeback: rfpResponseConfig.writeback,
      sandboxRoots: rfpResponseConfig.sandboxRoots,
      slackConfigured: isSlackConfigured(),
      emailDigestConfigured: isEmailDigestConfigured(),
      cron: rfpResponseConfig.cron,
      digestSubject: rfpResponseConfig.digestSubject,
      missingEnv: missing,
      notConfigured: missing.length > 0,
      submitted: false,
      sent: false,
    };
  },
});
