import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { AGING_BUCKETS, type OpenInvoice } from "../lib/aging";
import { reminderCopy } from "../lib/invoices";
import { createConfiguredMailbox } from "../lib/providers/mailbox";
import { assertNotSendIntent } from "../lib/send-guard";

const invoiceSchema = z.object({
  id: z.string().min(1),
  provider: z.enum(["quickbooks", "xero"]),
  number: z.string().min(1),
  customerName: z.string().min(1),
  email: z.email().optional(),
  balance: z.number(),
  total: z.number(),
  dueDate: z.string().optional(),
  issuedDate: z.string().optional(),
  currency: z.string().optional(),
  status: z.string().optional(),
  daysPastDue: z.number(),
  bucket: z.enum(AGING_BUCKETS),
});

const createReminderDraftInput = z.object({
  invoice: invoiceSchema,
  intent: z
    .string()
    .max(40)
    .optional()
    .describe("Must be draft. send, smtp, and sendmail are refused."),
});

export default defineTool({
  description:
    "Write a customer reminder into the mailbox Drafts folder (Gmail drafts.create or Microsoft Graph Drafts). Always pauses for Eve human approval. Always returns sent false. There is no send, SMTP, or drafts.send path.",
  approval: always<z.infer<typeof createReminderDraftInput>>(),
  inputSchema: createReminderDraftInput,
  async execute({ invoice, intent }) {
    try {
      assertNotSendIntent(intent);
    } catch (error) {
      return {
        drafted: false,
        sent: false,
        note: error instanceof Error ? error.message : "Send intent refused.",
      };
    }

    if (intent && intent.trim().toLowerCase() !== "draft") {
      return {
        drafted: false,
        sent: false,
        note: "intent must be draft. This tool only writes Drafts.",
      };
    }

    if (!invoice.email) {
      return {
        drafted: false,
        sent: false,
        skipped: true,
        note: "Invoice has no customer email. Digest can still include the row.",
      };
    }

    const mailbox = createConfiguredMailbox();
    if (!mailbox.ok) {
      return {
        drafted: false,
        sent: false,
        note: mailbox.note,
        missingEnv: mailbox.missingEnv,
      };
    }

    const copy = reminderCopy(invoice as OpenInvoice);
    return mailbox.value.createReminderDraft({
      to: invoice.email,
      subject: copy.subject,
      body: copy.body,
      invoiceId: invoice.id,
    });
  },
});
