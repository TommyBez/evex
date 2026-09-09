import type { OpenInvoice } from "./aging";
import { utcDateStamp } from "./aging";
import { buildDigestDraft, type DigestDraft } from "./digest";
import type { DeliveryStore } from "./delivery-store";
import { postSlackDigest, type SlackChannelSend } from "./slack-post";

export type DeliverArDigestInput = {
  readonly store: DeliveryStore;
  readonly invoices: readonly OpenInvoice[];
  readonly slackConnectUid?: string;
  readonly slackChannelId?: string;
  readonly runDate?: string;
  readonly idempotencyKey: string;
  readonly paidDropped?: number;
  readonly reminderCount?: number;
  readonly subject?: string;
  readonly postSlack?: SlackChannelSend;
};

export type DeliverArDigestResult = {
  readonly sent: boolean;
  readonly replayed?: boolean;
  readonly inProgress?: boolean;
  readonly idempotencyKey: string;
  readonly slackSent?: boolean;
  readonly openCount?: number;
  readonly runDate?: string;
  readonly error?: { readonly message: string; readonly name: string };
};

export const deliverArDigest = async ({
  store,
  invoices,
  slackConnectUid,
  slackChannelId,
  runDate,
  idempotencyKey,
  paidDropped,
  reminderCount,
  subject,
  postSlack = postSlackDigest,
}: DeliverArDigestInput): Promise<DeliverArDigestResult> => {
  const resolvedDate = runDate ?? utcDateStamp();
  const draft: DigestDraft = buildDigestDraft(invoices, {
    runDate: resolvedDate,
    paidDropped,
    reminderCount,
    subject,
  });
  const cached = store.find(idempotencyKey);

  if (cached?.slackSent) {
    return {
      sent: true,
      replayed: true,
      idempotencyKey,
      slackSent: true,
      openCount: draft.openCount,
      runDate: cached.runDate,
    };
  }

  if (!(slackConnectUid && slackChannelId)) {
    return {
      sent: false,
      idempotencyKey,
      runDate: resolvedDate,
      error: {
        name: "slack_not_configured",
        message: "Slack Connect UID and channel id are required.",
      },
    };
  }

  const claim = store.claim(idempotencyKey, resolvedDate);
  if (claim.replayed && claim.state?.slackSent) {
    return {
      sent: true,
      replayed: true,
      idempotencyKey,
      slackSent: true,
      openCount: draft.openCount,
      runDate: claim.state.runDate,
    };
  }
  if (!claim.acquired) {
    return {
      sent: false,
      inProgress: true,
      idempotencyKey,
      runDate: resolvedDate,
      error: {
        name: "delivery_in_progress",
        message: "Another send already claimed this idempotency key.",
      },
    };
  }

  try {
    const slackResponse = await postSlack({
      connectUid: slackConnectUid,
      channelId: slackChannelId,
      text: draft.slackText,
    });
    if (!slackResponse.ok) {
      store.release(idempotencyKey);
      return {
        sent: false,
        idempotencyKey,
        runDate: resolvedDate,
        error: {
          message: slackResponse.error ?? "Slack chat.postMessage failed.",
          name: "slack_channel_failed",
        },
      };
    }
  } catch (error) {
    store.release(idempotencyKey);
    return {
      sent: false,
      idempotencyKey,
      runDate: resolvedDate,
      error: {
        name: "slack_delivery_failed",
        message:
          error instanceof Error ? error.message : "Slack channel send failed.",
      },
    };
  }

  store.save({
    idempotencyKey,
    runDate: resolvedDate,
    slackSent: true,
    postedAt: new Date().toISOString(),
    status: "complete",
  });

  return {
    sent: true,
    idempotencyKey,
    slackSent: true,
    openCount: draft.openCount,
    runDate: resolvedDate,
  };
};
