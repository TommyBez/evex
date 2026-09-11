import { defineTool } from "eve/tools";
import { z } from "zod";

import { churnRenewalConfig } from "../lib/renewal-config";
import { createConfiguredCrmClient } from "../lib/providers/index";

export default defineTool({
  description:
    "Read HubSpot companies or Salesforce accounts whose renewal date falls in the configured lookahead window. Read-only. Never writes a CRM note and never emails the customer.",
  inputSchema: z.object({
    max: z.number().int().min(1).max(500).optional(),
  }),
  async execute({ max }) {
    const client = createConfiguredCrmClient();
    if (!client.ok) {
      return {
        ok: false,
        accounts: [],
        written: false,
        emailedCustomer: false,
        note: client.note,
        missingEnv: client.missingEnv,
      };
    }

    const accounts = await client.value.listRenewalAccounts({
      lookaheadDays: churnRenewalConfig.lookaheadDays,
      max: max ?? churnRenewalConfig.maxAccounts,
    });
    return {
      ok: true,
      provider: client.value.provider,
      accounts,
      accountCount: accounts.length,
      written: false,
      emailedCustomer: false,
    };
  },
});
