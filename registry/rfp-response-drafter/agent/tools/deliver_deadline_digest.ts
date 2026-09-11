import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { createDeliveryStore } from "../lib/delivery-store";
import {
  buildDeadlineDigest,
  resolveDigestDeliveryKey,
} from "../lib/digest";
import {
  isSlackConfigured,
  missingDeliveryEnv,
  rfpResponseConfig,
} from "../lib/rfp-config";
import { postSlackMessage } from "../lib/slack-post";

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
    .describe("Must be true to post Slack. Not a portal submit or mailbox send."),
  idempotencyKey: z.string().min(1).max(255),
});

export default defineTool({
  description:
    "Post the optional RFP deadline digest through the Eve Slack Connect channel. Always pauses for Eve human approval. Requires confirmSend=true and the date key from preview_deadline_digest. Never submits a portal.",
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

    if (!isSlackConfigured()) {
      return {
        sent: false,
        submitted: false,
        notConfigured: true,
        missingEnv: missingDeliveryEnv(),
      };
    }

    const store = createDeliveryStore(rfpResponseConfig.storePath);
    const cached = store.find(deliveryKey.idempotencyKey);
    if (cached?.slackSent) {
      return {
        sent: true,
        submitted: false,
        replayed: true,
        idempotencyKey: deliveryKey.idempotencyKey,
        runDate: cached.runDate,
      };
    }

    const draft = buildDeadlineDigest(rfps, {
      runDate: deliveryKey.runDate,
      subject: rfpResponseConfig.digestSubject,
    });
    const slack = await postSlackMessage({
      connectUid: rfpResponseConfig.slackConnectUid ?? "",
      channelId: rfpResponseConfig.slackChannelId ?? "",
      text: draft.slackText,
    });
    if (!slack.ok) {
      return {
        sent: false,
        submitted: false,
        idempotencyKey: deliveryKey.idempotencyKey,
        error: slack.error,
      };
    }

    store.save({
      idempotencyKey: deliveryKey.idempotencyKey,
      runDate: deliveryKey.runDate,
      slackSent: true,
      postedAt: new Date().toISOString(),
    });

    return {
      sent: true,
      submitted: false,
      idempotencyKey: deliveryKey.idempotencyKey,
      runDate: deliveryKey.runDate,
      upcomingCount: draft.upcomingCount,
    };
  },
});
