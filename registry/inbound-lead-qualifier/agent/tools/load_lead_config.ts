import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  inboundLeadConfig,
  isCrmConfigured,
  isPushConfigured,
  isSlackNotifyConfigured,
  isTypeformConfigured,
  missingLeadConfig,
} from "../lib/lead-config";

export default defineTool({
  description:
    "Load inbound lead intake, CRM, Typeform, ICP, and Slack configuration. Does not return Connect UIDs, HMAC secrets, or other secrets. Call this first on a scheduled or push run.",
  inputSchema: z.object({}),
  execute() {
    const missing = missingLeadConfig();
    return {
      cron: inboundLeadConfig.cron,
      provider: inboundLeadConfig.provider,
      pushConfigured: isPushConfigured(),
      typeformConfigured: isTypeformConfigured(),
      crmConfigured: isCrmConfigured(),
      slackConfigured: isSlackNotifyConfigured(),
      requireWorkEmail: inboundLeadConfig.icp.requireWorkEmail,
      hotThreshold: inboundLeadConfig.icp.hotThreshold,
      icpDomainCount: inboundLeadConfig.icp.domains.length,
      missingEnv: missing,
      notConfigured: missing.length > 0,
      written: false,
      emailedLead: false,
    };
  },
});
