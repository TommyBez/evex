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
  const cached = store.find(idempotencyKey);
  const slackAlready = Boolean(cached?.slackSent);
  const emailAlready = Boolean(cached?.emailSent);

  if (
    cached &&
    (!slackConfigured || slackAlready) &&
    (!emailConfigured || emailAlready)
  ) {
    return {
      sent: true,
      submitted: false,
      replayed: true,
      idempotencyKey,
      runDate: cached.runDate,
      slackSent: slackAlready,
      emailSent: emailAlready,
      upcomingCount: draft.upcomingCount,
    };
  }

  let slackSent = slackAlready;
  if (slackConfigured && !slackAlready && slackConnectUid && slackChannelId) {
    const slack = await postSlack({
      connectUid: slackConnectUid,
      channelId: slackChannelId,
      text: draft.slackText,
    });
    if (!slack.ok) {
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
  }

  let emailSent = emailAlready;
  let emailMessageId = cached?.emailMessageId;
  if (emailConfigured && !emailAlready && digestFrom && sendEmail) {
    const emailResult = await sendEmail({
      from: digestFrom,
      to: digestTo,
      subject: draft.subject,
      html: draft.html,
      text: draft.text,
      idempotencyKey,
    });
    if (emailResult.error) {
      if (slackSent) {
        store.save({
          idempotencyKey,
          runDate,
          slackSent: true,
          emailSent: false,
          postedAt: new Date().toISOString(),
        });
      }
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
