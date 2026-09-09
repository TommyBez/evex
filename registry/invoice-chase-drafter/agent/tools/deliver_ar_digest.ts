import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { AGING_BUCKETS } from "../lib/aging";
import {
  invoiceChaseConfig,
  isSlackDeliveryConfigured,
  missingDeliveryEnv,
} from "../lib/chase-config";
import { deliverArDigest } from "../lib/deliver-digest";
import { createDeliveryStore } from "../lib/delivery-store";
import { resolveDigestDeliveryKey } from "../lib/digest";

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

const deliverDigestInput = z.object({
  invoices: z.array(invoiceSchema),
  paidDropped: z.number().int().min(0).optional(),
  reminderCount: z.number().int().min(0).optional(),
  runDate: z.string().min(1).optional(),
  confirmSend: z
    .boolean()
    .describe("Must be true to post Slack. Not a mailbox send."),
  idempotencyKey: z.string().min(1).max(255),
});

export default defineTool({
  description:
    "Post the AR finance digest through the Eve Slack Connect channel. Always pauses for Eve human approval. Requires confirmSend=true and the date idempotencyKey from preview_ar_digest. Replays of the same date key do not double-post. Does not send email.",
  inputSchema: deliverDigestInput,
  approval: always<z.infer<typeof deliverDigestInput>>(),
  async execute({
    invoices,
    paidDropped,
    reminderCount,
    runDate,
    confirmSend,
    idempotencyKey,
  }) {
    if (!confirmSend) {
      return {
        notConfirmed: true,
        sent: false,
        note: "confirmSend must be true to deliver. Call preview_ar_digest first. This is not a mailbox send.",
      };
    }

    const deliveryKey = resolveDigestDeliveryKey({ runDate, idempotencyKey });
    if (!deliveryKey.ok) {
      return {
        sent: false,
        keyMismatch: true,
        expected: deliveryKey.expected,
        runDate: deliveryKey.runDate,
        note: "idempotencyKey must equal the date key from preview_ar_digest.",
      };
    }

    if (!isSlackDeliveryConfigured()) {
      return {
        sent: false,
        notConfigured: true,
        missingEnv: missingDeliveryEnv(),
      };
    }

    return deliverArDigest({
      store: createDeliveryStore(invoiceChaseConfig.storePath),
      invoices,
      slackConnectUid: invoiceChaseConfig.slackConnectUid,
      slackChannelId: invoiceChaseConfig.slackChannelId,
      runDate: deliveryKey.runDate,
      idempotencyKey: deliveryKey.idempotencyKey,
      paidDropped,
      reminderCount,
      subject: invoiceChaseConfig.digestSubject,
    });
  },
});
