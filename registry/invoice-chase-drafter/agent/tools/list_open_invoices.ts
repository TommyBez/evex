import { defineTool } from "eve/tools";
import { z } from "zod";

import { countByBucket } from "../lib/aging";
import { invoiceChaseConfig } from "../lib/chase-config";
import { createConfiguredArClient } from "../lib/providers/ar";

export default defineTool({
  description:
    "Read unpaid invoices from QuickBooks or Xero through Custom OAuth Connect and age them into current, 1-30, 31-60, 61-90, and 90+ buckets. Read-only. Never sends mail and never writes AR.",
  inputSchema: z.object({}),
  async execute() {
    const client = createConfiguredArClient();
    if (!client.ok) {
      return {
        ok: false,
        invoices: [],
        invoiceCount: 0,
        sent: false,
        note: client.note,
        missingEnv: client.missingEnv,
      };
    }

    const invoices = await client.value.listOpenInvoices({
      max: invoiceChaseConfig.maxInvoices,
    });
    return {
      ok: true,
      provider: client.value.provider,
      invoices,
      invoiceCount: invoices.length,
      buckets: countByBucket(invoices),
      sent: false,
    };
  },
});
