import { defineTool } from "eve/tools";
import { z } from "zod";

import { crmHygieneConfig } from "../lib/crm-config";
import { createConfiguredCrmClient } from "../lib/providers/index";

export default defineTool({
  description:
    "Read contacts from the configured HubSpot, Salesforce, or Pipedrive connector. Read-only. Never writes, merges, or overwrites CRM records.",
  inputSchema: z.object({
    max: z.number().int().min(1).max(500).optional(),
  }),
  async execute({ max }) {
    const client = createConfiguredCrmClient();
    if (!client.ok) {
      return {
        ok: false,
        records: [],
        written: false,
        note: client.note,
        missingEnv: client.missingEnv,
      };
    }

    const records = await client.value.listRecords({
      max: max ?? crmHygieneConfig.maxRecords,
    });
    return {
      ok: true,
      provider: client.value.provider,
      records,
      recordCount: records.length,
      written: false,
    };
  },
});
