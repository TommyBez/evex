import { defineTool } from "eve/tools";
import { z } from "zod";

import { AGING_BUCKETS, utcDateStamp } from "../lib/aging";
import {
  invoiceChaseConfig,
  isSlackDeliveryConfigured,
  missingDeliveryEnv,
} from "../lib/chase-config";
import {
  buildDigestDraft,
  buildDigestIdempotencyKey,
} from "../lib/digest";

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
    "Preview the Slack finance digest for still-open invoices after the paid re-check, without posting. Returns the date idempotencyKey and runDate to pass into deliver_ar_digest.",
  inputSchema: z.object({
    invoices: z.array(invoiceSchema),
    paidDropped: z.number().int().min(0).optional(),
    reminderCount: z.number().int().min(0).optional(),
    runDate: z.string().min(1).optional(),
  }),
  execute({ invoices, paidDropped, reminderCount, runDate }) {
    if (!isSlackDeliveryConfigured()) {
      return {
        dryRun: true,
        notConfigured: true,
        sent: false,
        missingEnv: missingDeliveryEnv(),
      };
    }

    const date = runDate ?? utcDateStamp();
    const draft = buildDigestDraft(invoices, {
      runDate: date,
      paidDropped,
      reminderCount,
      subject: invoiceChaseConfig.digestSubject,
    });
    return {
      dryRun: true,
      sent: false,
      openCount: draft.openCount,
      reminderCount: draft.reminderCount,
      paidDropped: draft.paidDropped,
      subject: draft.subject,
      slackTextPreview: draft.slackText.slice(0, 500),
      runDate: date,
      idempotencyKey: buildDigestIdempotencyKey(date),
    };
  },
});
