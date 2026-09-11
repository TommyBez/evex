import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { createDeliveryStore } from "../lib/delivery-store";
import { deliverDeadlineDigest } from "../lib/deliver-digest";
import { resolveDigestDeliveryKey } from "../lib/digest";
import {
  isEmailDigestConfigured,
  isSlackConfigured,
  missingDigestEnv,
  rfpResponseConfig,
} from "../lib/rfp-config";
import { createResendSender } from "../lib/resend-email";

const upcomingRfpSchema = z.object({
  id: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  dueDate: z.string().min(1).max(40),
  sourceId: z.string().max(400).optional(),
});

const deliverDeadlineDigestInput = z.object({
  rfps: z.array(upcomingRfpSchema).max(50),
  runDate: z.string().min(1).max(10).optional(),
  confirmSend: z
    .boolean()
    .describe(
      "Must be true to post Slack and/or the Resend digest email. Not a portal submit or RFP mailbox send.",
    ),
  idempotencyKey: z.string().min(1).max(255),
});

export default defineTool({
  description:
    "Deliver the optional RFP deadline and aging digest through Slack Connect and/or Resend email. Always pauses for Eve human approval. Requires confirmSend=true and the date key from preview_deadline_digest. Never submits a portal or claims an RFP was sent.",
  inputSchema: deliverDeadlineDigestInput,
  approval: always<z.infer<typeof deliverDeadlineDigestInput>>(),
  async execute({ rfps, runDate, confirmSend, idempotencyKey }) {
    if (!confirmSend) {
      return {
        notConfirmed: true,
        sent: false,
        submitted: false,
        note: "confirmSend must be true to deliver. Call preview_deadline_digest first. This is not a portal submit.",
      };
    }

    const deliveryKey = resolveDigestDeliveryKey({ runDate, idempotencyKey });
    if (!deliveryKey.ok) {
      return {
        sent: false,
        submitted: false,
        keyMismatch: true,
        expected: deliveryKey.expected,
        runDate: deliveryKey.runDate,
        note: "idempotencyKey must equal the date key from preview_deadline_digest.",
      };
    }

    if (!isSlackConfigured() && !isEmailDigestConfigured()) {
      return {
        sent: false,
        submitted: false,
        notConfigured: true,
        missingEnv: missingDigestEnv(),
      };
    }

    return deliverDeadlineDigest({
      store: createDeliveryStore(rfpResponseConfig.storePath),
      rfps,
      slackConnectUid: rfpResponseConfig.slackConnectUid,
      slackChannelId: rfpResponseConfig.slackChannelId,
      digestFrom: rfpResponseConfig.digestFrom,
      digestTo: rfpResponseConfig.digestTo,
      runDate: deliveryKey.runDate,
      idempotencyKey: deliveryKey.idempotencyKey,
      subject: rfpResponseConfig.digestSubject,
      sendEmail:
        isEmailDigestConfigured() && rfpResponseConfig.resendApiKey
          ? createResendSender({ apiKey: rfpResponseConfig.resendApiKey })
          : undefined,
    });
  },
});
