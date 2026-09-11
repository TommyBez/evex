import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  churnRenewalConfig,
  isSlackDeliveryConfigured,
  isStripeConfigured,
  missingRenewalConfig,
} from "../lib/renewal-config";

export default defineTool({
  description:
    "Load the configured CRM provider, Stripe Connect, weekly cron, renewal lookahead, and whether Slack Connect is set. Does not return Connect UIDs, API keys, or other secrets. Call this first on a scheduled run.",
  inputSchema: z.object({}),
  execute() {
    const missing = missingRenewalConfig();
    return {
      provider: churnRenewalConfig.provider,
      cron: churnRenewalConfig.cron,
      lookaheadDays: churnRenewalConfig.lookaheadDays,
      maxAccounts: churnRenewalConfig.maxAccounts,
      stripeConfigured: isStripeConfigured(),
      delivery: {
        slackConfigured: isSlackDeliveryConfigured(),
      },
      missingEnv: missing,
      notConfigured: missing.length > 0,
      written: false,
      emailedCustomer: false,
    };
  },
});
