import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { createAuditLog } from "../lib/audit-log";
import { deliverRenewalDigest } from "../lib/deliver-digest";
import { resolveDigestDeliveryKey } from "../lib/digest";
import {
  churnRenewalConfig,
  isSlackDeliveryConfigured,
  missingDeliveryEnv,
} from "../lib/renewal-config";
import type { ScoreBatch } from "../lib/score";

const accountSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ownerName: z.string().optional(),
  ownerEmail: z.string().optional(),
  renewalDate: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  domain: z.string().optional(),
});

const scoredSchema = z.object({
  account: accountSchema,
  bucket: z.enum(["healthy", "watch", "at-risk"]),
  previousBucket: z.enum(["healthy", "watch", "at-risk"]).optional(),
  moved: z.boolean(),
  reasons: z.array(z.string()),
  failClosed: z.literal(false),
});

const deliverDigestInput = z.object({
  batch: z.object({
    batchId: z.string().min(1),
    provider: z.string().min(1),
    scannedAt: z.string().min(1),
    scored: z.array(scoredSchema),
    skipped: z.array(
      z.object({
        account: accountSchema,
        failClosed: z.literal(true),
        note: z.string().min(1),
      }),
    ),
    movers: z.array(scoredSchema),
  }),
  runDate: z.string().min(1).optional(),
  confirmSend: z
    .boolean()
    .describe("Must be true to post Slack. Not a CRM write and not a customer email."),
  idempotencyKey: z.string().min(1).max(255),
});

export default defineTool({
  description:
    "Post the Healthy/Watch/At-risk movers digest through the Eve Slack Connect channel. Always pauses for Eve human approval. Requires confirmSend=true and the date idempotencyKey from preview_renewal_digest. Does not write the CRM and never emails the customer.",
  inputSchema: deliverDigestInput,
  approval: always<z.infer<typeof deliverDigestInput>>(),
  async execute({ batch, runDate, confirmSend, idempotencyKey }) {
    if (!confirmSend) {
      return {
        notConfirmed: true,
        sent: false,
        written: false,
        emailedCustomer: false,
        note: "confirmSend must be true to deliver. Call preview_renewal_digest first. This is not a CRM write.",
      };
    }

    const deliveryKey = resolveDigestDeliveryKey({ runDate, idempotencyKey });
    if (!deliveryKey.ok) {
      return {
        sent: false,
        written: false,
        emailedCustomer: false,
        keyMismatch: true,
        expected: deliveryKey.expected,
        runDate: deliveryKey.runDate,
        note: "idempotencyKey must equal the date key from preview_renewal_digest.",
      };
    }

    if (!isSlackDeliveryConfigured()) {
      return {
        sent: false,
        written: false,
        emailedCustomer: false,
        notConfigured: true,
        missingEnv: missingDeliveryEnv(),
      };
    }

    return deliverRenewalDigest({
      audit: createAuditLog(churnRenewalConfig.auditPath),
      batch: batch as ScoreBatch,
      slackConnectUid: churnRenewalConfig.slackConnectUid,
      slackChannelId: churnRenewalConfig.slackChannelId,
      runDate: deliveryKey.runDate,
      idempotencyKey: deliveryKey.idempotencyKey,
      cursorPath: churnRenewalConfig.cursorPath,
    });
  },
});
