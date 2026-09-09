import {
  isStillOpenInvoice,
  type OpenInvoice,
} from "./aging";
import type { ArClient } from "./providers/types";

export type PaidRecheckResult = {
  readonly stillOpen: OpenInvoice[];
  readonly paid: OpenInvoice[];
  readonly missing: OpenInvoice[];
};

export async function recheckPaidInvoices(
  invoices: readonly OpenInvoice[],
  client: ArClient,
): Promise<PaidRecheckResult> {
  const stillOpen: OpenInvoice[] = [];
  const paid: OpenInvoice[] = [];
  const missing: OpenInvoice[] = [];

  for (const invoice of invoices) {
    const latest = await client.getInvoice(invoice.id);
    if (!latest) {
      missing.push(invoice);
      continue;
    }
    if (isStillOpenInvoice(latest)) {
      stillOpen.push(latest);
      continue;
    }
    paid.push(latest);
  }

  return { stillOpen, paid, missing };
}

export function reminderCopy(invoice: OpenInvoice): {
  readonly subject: string;
  readonly body: string;
} {
  const amount = invoice.balance.toFixed(2);
  const due = invoice.dueDate ?? "the due date";
  return {
    subject: `Invoice ${invoice.number} is past due`,
    body: [
      `Hi ${invoice.customerName},`,
      "",
      `Invoice ${invoice.number} for ${amount} was due ${due} and still shows an open balance.`,
      `This row is in the ${invoice.bucket} aging bucket (${invoice.daysPastDue} days past due).`,
      "",
      "Please reply with payment confirmation or an updated date.",
      "",
      "Thanks",
    ].join("\n"),
  };
}
