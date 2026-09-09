import { Resend } from "resend";
import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { createAuditLog } from "../lib/audit-log";
import {
  crmHygieneConfig,
  isEmailDeliveryConfigured,
  isSlackDeliveryConfigured,
  missingDeliveryEnv,
} from "../lib/crm-config";
import { deliverHygieneDigest } from "../lib/deliver-digest";
import type { HygieneBatch } from "../lib/hygiene";

const proposalSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["dedupe", "normalize", "enrich"]),
  recordId: z.string().min(1),
  mergeRecordId: z.string().min(1).optional(),
  before: z.record(z.string(), z.unknown()),
  after: z.record(z.string(), z.unknown()),
  reason: z.string().min(1),
});

const deliverDigestInput = z.object({
  batch: z.object({
    batchId: z.string().min(1),
    provider: z.string().min(1),
    scannedAt: z.string().min(1),
    recordCount: z.number().int().min(0),
    proposals: z.array(proposalSchema),
  }),
  runDate: z.string().min(1).optional(),
  confirmSend: z
    .boolean()
    .describe("Must be true to deliver Slack or email. Not a CRM write."),
  idempotencyKey: z.string().min(1).max(255),
});

export default defineTool({
  description:
    "Deliver the proposed CRM hygiene batch through the Eve Slack Connect channel and/or Resend email. Always pauses for Eve human approval before Slack or Resend. Requires confirmSend=true and the idempotencyKey from preview_hygiene_digest. Does not write to the CRM.",
  inputSchema: deliverDigestInput,
  approval: always<z.infer<typeof deliverDigestInput>>(),
  async execute({ batch, runDate, confirmSend, idempotencyKey }) {
    if (!confirmSend) {
      return {
        notConfirmed: true,
        written: false,
        note: "confirmSend must be true to deliver. Call preview_hygiene_digest first. This is not a CRM write.",
      };
    }

    const slackConfigured = isSlackDeliveryConfigured();
    const emailConfigured = isEmailDeliveryConfigured();
    if (!slackConfigured && !emailConfigured) {
      return {
        sent: false,
        written: false,
        notConfigured: true,
        missingEnv: missingDeliveryEnv(),
      };
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (emailConfigured && !apiKey) {
      return { sent: false, written: false, authRequired: true, missingEnv: "RESEND_API_KEY" };
    }

    const audit = createAuditLog(crmHygieneConfig.auditPath);
    return {
      written: false,
      ...(await deliverHygieneDigest({
        audit,
        batch: batch as HygieneBatch,
        digest: crmHygieneConfig.digest,
        slackConnectUid: crmHygieneConfig.slackConnectUid,
        slackChannelId: crmHygieneConfig.slackChannelId,
        runDate,
        idempotencyKey,
        sendEmail:
          emailConfigured && crmHygieneConfig.digest.from && apiKey
            ? async (payload) => {
                const resend = new Resend(apiKey);
                const { data, error } = await resend.emails.send(
                  {
                    from: payload.from,
                    to: [...payload.to],
                    subject: payload.subject,
                    html: payload.html,
                    text: payload.text,
                  },
                  { idempotencyKey: payload.idempotencyKey },
                );
                return {
                  id: data?.id,
                  error: error
                    ? { message: error.message, name: error.name }
                    : undefined,
                };
              }
            : undefined,
      })),
    };
  },
});
