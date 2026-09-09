import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  invoiceChaseConfig,
  isMailboxConfigured,
  isSlackDeliveryConfigured,
  isWeekdayCron,
  missingChaseConfig,
} from "../lib/chase-config";

export default defineTool({
  description:
    "Load the configured AR provider, mailbox, weekday cron, and whether Slack Connect is set. Does not return Connect UIDs, API keys, or other secrets. Call this first on a scheduled run.",
  inputSchema: z.object({}),
  execute() {
    const missing = missingChaseConfig();
    return {
      arProvider: invoiceChaseConfig.arProvider,
      mailboxProvider: invoiceChaseConfig.mailboxProvider,
      cron: invoiceChaseConfig.cron,
      weekdayCron: isWeekdayCron(invoiceChaseConfig.cron),
      maxInvoices: invoiceChaseConfig.maxInvoices,
      mailboxConfigured: isMailboxConfigured(),
      delivery: {
        slackConfigured: isSlackDeliveryConfigured(),
        subject: invoiceChaseConfig.digestSubject,
      },
      missingEnv: missing,
      notConfigured: missing.length > 0,
      sent: false,
    };
  },
});
