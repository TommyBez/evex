import { defineTool } from "eve/tools";
import { z } from "zod";

import { AGING_BUCKETS } from "../lib/aging";
import { recheckPaidInvoices } from "../lib/invoices";
import { createConfiguredArClient } from "../lib/providers/ar";

const invoiceSchema = z.object({
  id: z.string().min(1),
  provider: z.enum(["quickbooks", "xero"]),
  number: z.string().min(1),
  customerName: z.string().min(1),
  email: z.string().optional(),
  balance: z.number(),
  total: z.number(),
  dueDate: z.string().optional(),
  issuedDate: z.string().optional(),
  currency: z.string().optional(),
  status: z.string().optional(),
  daysPastDue: z.number(),
  bucket: z.enum(AGING_BUCKETS),
});

export default defineTool({
  description:
    "Re-read each invoice from QuickBooks or Xero before drafting or posting Slack. Drops rows that are now paid so a retry does not chase a settled invoice. Read-only.",
  inputSchema: z.object({
    invoices: z.array(invoiceSchema),
  }),
  async execute({ invoices }) {
    const client = createConfiguredArClient();
    if (!client.ok) {
      return {
        ok: false,
        stillOpen: [],
        paid: [],
        sent: false,
        note: client.note,
        missingEnv: client.missingEnv,
      };
    }

    const result = await recheckPaidInvoices(invoices, client.value);
    return {
      ok: true,
      provider: client.value.provider,
      stillOpen: result.stillOpen,
      paid: result.paid,
      missing: result.missing,
      stillOpenCount: result.stillOpen.length,
      paidCount: result.paid.length,
      sent: false,
    };
  },
});
