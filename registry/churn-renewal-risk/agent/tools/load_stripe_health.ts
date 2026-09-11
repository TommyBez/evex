import { defineTool } from "eve/tools";
import { z } from "zod";

import { churnRenewalConfig, missingStripeEnv } from "../lib/renewal-config";
import { createStripeClient } from "../lib/providers/stripe";
import type { HealthLookup, RenewalAccount } from "../lib/score";

const accountSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ownerName: z.string().optional(),
  ownerEmail: z.string().optional(),
  renewalDate: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  domain: z.string().optional(),
});

export default defineTool({
  description:
    "Load Stripe payment health for renewal-window CRM accounts through Vercel Connect. Read-only and fail-closed. Missing or invalid Stripe customers are skipped, not scored Healthy. Never emails the customer.",
  inputSchema: z.object({
    accounts: z.array(accountSchema),
  }),
  async execute({ accounts }) {
    const missing = missingStripeEnv();
    if (missing.length > 0) {
      return {
        ok: false,
        failClosed: true,
        written: false,
        emailedCustomer: false,
        missingEnv: missing,
        note: "Stripe Connect is not configured.",
      };
    }

    const client = createStripeClient(churnRenewalConfig);
    if (!client) {
      return {
        ok: false,
        failClosed: true,
        written: false,
        emailedCustomer: false,
        missingEnv: missing,
        note: "Stripe Connect is not configured.",
      };
    }

    const healthByAccountId: Record<string, HealthLookup> = {};
    for (const account of accounts as RenewalAccount[]) {
      healthByAccountId[account.id] = await client.loadHealth(account);
    }

    return {
      ok: true,
      healthByAccountId,
      written: false,
      emailedCustomer: false,
    };
  },
});
