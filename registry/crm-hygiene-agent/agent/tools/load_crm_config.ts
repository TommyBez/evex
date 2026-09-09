import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  crmHygieneConfig,
  isEmailDeliveryConfigured,
  isSlackDeliveryConfigured,
  missingHygieneConfig,
} from "../lib/crm-config";

export default defineTool({
  description:
    "Load the configured CRM provider, cron, record cap, and whether Slack Connect or email digest is set. Does not return Connect UIDs, API keys, or other secrets. Call this first on a scheduled run.",
  inputSchema: z.object({}),
  execute() {
    const missing = missingHygieneConfig();
    return {
      provider: crmHygieneConfig.provider,
      cron: crmHygieneConfig.cron,
      maxRecords: crmHygieneConfig.maxRecords,
      delivery: {
        slackConfigured: isSlackDeliveryConfigured(),
        emailConfigured: isEmailDeliveryConfigured(),
        emailRecipientCount: crmHygieneConfig.digest.to.length,
        subject: crmHygieneConfig.digest.subject,
      },
      missingEnv: missing,
      notConfigured: missing.length > 0,
      written: false,
    };
  },
});
