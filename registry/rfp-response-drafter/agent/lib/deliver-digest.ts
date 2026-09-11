import type { UpcomingRfp } from "./digest";
import { buildDeadlineDigest } from "./digest";
import type { DeliveryStore } from "./delivery-store";
import type { EmailSender } from "./resend-email";
import { postSlackMessage, type SlackChannelSend } from "./slack-post";

export type DeliverDeadlineDigestInput = {
  readonly store: DeliveryStore;
  readonly rfps: readonly UpcomingRfp[];
  readonly slackConnectUid?: string;
  readonly slackChannelId?: string;
  readonly digestFrom?: string;
  readonly digestTo: readonly string[];
  readonly runDate: string;
  readonly idempotencyKey: string;
  readonly subject?: string;
  readonly sendEmail?: EmailSender;
  readonly postSlack?: SlackChannelSend;
};

export type DeliverDeadlineDigestResult = {
  readonly sent: boolean;
  readonly submitted: false;
  readonly replayed?: boolean;
  readonly inProgress?: boolean;
  readonly idempotencyKey: string;
  readonly runDate: string;
  readonly slackSent?: boolean;
  readonly emailSent?: boolean;
  readonly emailMessageId?: string;
  readonly upcomingCount?: number;
  readonly error?: { readonly message: string; readonly name: string };
};

export const deliverDeadlineDigest = async ({
  store,
  rfps,
  slackConnectUid,
  slackChannelId,
  digestFrom,
  digestTo,
  runDate,
  idempotencyKey,
  subject,
  sendEmail,
  postSlack = postSlackMessage,
}: DeliverDeadlineDigestInput): Promise<DeliverDeadlineDigestResult> => {
  const slackConfigured = Boolean(slackConnectUid && slackChannelId);
  const emailConfigured = Boolean(
    digestFrom && digestTo.length > 0 && sendEmail,
  );
  const draft = buildDeadlineDigest(rfps, { runDate, subject });

  const claim = store.claim(idempotencyKey, runDate);
  if (claim.replayed) {
    return {
      sent: true,
      submitted: false,
      replayed: true,
      idempotencyKey,
      runDate: claim.state?.runDate ?? runDate,
      slackSent: claim.state?.slackSent,
      emailSent: claim.state?.emailSent,
      upcomingCount: draft.upcomingCount,
    };
  }
  if (!claim.acquired) {
    return {
      sent: false,
      submitted: false,
      inProgress: true,
      idempotencyKey,
      runDate,
      error: {
        name: "delivery_in_progress",
        message: "Another digest already claimed this date key.",
      },
    };
  }

  const cached = claim.state;
  let slackSent = Boolean(cached?.slackSent);
  let emailSent = Boolean(cached?.emailSent);
  let emailMessageId = cached?.emailMessageId;

  if (slackConfigured && !slackSent && slackConnectUid && slackChannelId) {
    const slack = await postSlack({
      connectUid: slackConnectUid,
      channelId: slackChannelId,
      text: draft.slackText,
    });
    if (!slack.ok) {
      store.release(idempotencyKey);
      return {
        sent: false,
        submitted: false,
        idempotencyKey,
        runDate,
        slackSent,
        error: {
          name: "slack_channel_failed",
          message: slack.error ?? "Slack chat.postMessage failed.",
        },
      };
    }
    slackSent = true;
    store.save({
      idempotencyKey,
      runDate,
      slackSent: true,
      emailSent,
      emailMessageId,
      claimedAt: cached?.claimedAt,
      claimOwner: cached?.claimOwner,
      status: "in_progress",
      postedAt: new Date().toISOString(),
    });
  }

  if (emailConfigured && !emailSent && digestFrom && sendEmail) {
    const emailResult = await sendEmail({
      from: digestFrom,
      to: digestTo,
      subject: draft.subject,
      html: draft.html,
      text: draft.text,
      idempotencyKey,
    });
    if (emailResult.error) {
      store.save({
        idempotencyKey,
        runDate,
        slackSent,
        emailSent: false,
        claimedAt: cached?.claimedAt,
        claimOwner: cached?.claimOwner,
        status: "in_progress",
        postedAt: new Date().toISOString(),
      });
      return {
        sent: false,
        submitted: false,
        idempotencyKey,
        runDate,
        slackSent,
        emailSent: false,
        error: {
          name: emailResult.error.name,
          message: emailResult.error.message,
        },
      };
    }
    emailSent = true;
    emailMessageId = emailResult.id;
  }

  store.save({
    idempotencyKey,
    runDate,
    slackSent,
    emailSent,
    emailMessageId,
    postedAt: new Date().toISOString(),
    status: "complete",
  });

  return {
    sent: true,
    submitted: false,
    idempotencyKey,
    runDate,
    slackSent,
    emailSent,
    emailMessageId,
    upcomingCount: draft.upcomingCount,
  };
};
