import type { AuditLog } from "./audit-log";
import { buildDigestDraft, utcDateStamp, type DigestDraft } from "./digest";
import type { HygieneBatch } from "./hygiene";
import { postSlackDigest, type SlackChannelSend } from "./slack-post";
import type { CrmHygieneConfig } from "./crm-config";

export type EmailSendResult = {
  readonly id?: string;
  readonly error?: { readonly message: string; readonly name: string };
};

export type EmailSender = (input: {
  readonly from: string;
  readonly to: readonly string[];
  readonly subject: string;
  readonly html: string;
  readonly text: string;
  readonly idempotencyKey: string;
}) => Promise<EmailSendResult>;

export type DeliverHygieneDigestInput = {
  readonly audit: AuditLog;
  readonly batch: HygieneBatch;
  readonly digest: CrmHygieneConfig["digest"];
  readonly slackConnectUid?: string;
  readonly slackChannelId?: string;
  readonly runDate?: string;
  readonly idempotencyKey: string;
  readonly sendEmail?: EmailSender;
  readonly postSlack?: SlackChannelSend;
};

export type DeliverHygieneDigestResult = {
  readonly sent: boolean;
  readonly replayed?: boolean;
  readonly idempotencyKey: string;
  readonly slackSent?: boolean;
  readonly emailMessageId?: string;
  readonly proposalCount?: number;
  readonly runDate?: string;
  readonly channel?: "slack" | "email";
  readonly error?: { readonly message: string; readonly name: string };
};

export const deliverHygieneDigest = async ({
  audit,
  batch,
  digest,
  slackConnectUid,
  slackChannelId,
  runDate,
  idempotencyKey,
  sendEmail,
  postSlack = postSlackDigest,
}: DeliverHygieneDigestInput): Promise<DeliverHygieneDigestResult> => {
  const slackConfigured = Boolean(slackConnectUid && slackChannelId);
  const emailConfigured = Boolean(digest.from && digest.to.length > 0 && sendEmail);
  const resolvedDate = runDate ?? utcDateStamp();
  const draft: DigestDraft = buildDigestDraft(batch, { digest }, resolvedDate);
  const cached = audit.findByIdempotencyKey(idempotencyKey);

  if (cached?.type === "delivered") {
    return {
      sent: true,
      replayed: true,
      idempotencyKey,
      slackSent: cached.note?.includes("slack") ?? slackConfigured,
      emailMessageId: cached.note?.includes("email") ? "replayed" : undefined,
      proposalCount: draft.proposalCount,
      runDate: resolvedDate,
    };
  }

  let slackSent = false;
  if (slackConnectUid && slackChannelId) {
    try {
      const slackResponse = await postSlack({
        connectUid: slackConnectUid,
        channelId: slackChannelId,
        text: draft.slackText,
      });
      if (!slackResponse.ok) {
        return {
          sent: false,
          idempotencyKey,
          runDate: resolvedDate,
          channel: "slack",
          error: {
            message: slackResponse.error ?? "Slack chat.postMessage failed.",
            name: "slack_channel_failed",
          },
        };
      }
      slackSent = true;
    } catch (error) {
      return {
        sent: false,
        idempotencyKey,
        runDate: resolvedDate,
        channel: "slack",
        error: {
          name: "slack_delivery_failed",
          message:
            error instanceof Error ? error.message : "Slack channel send failed.",
        },
      };
    }
  }

  let emailMessageId: string | undefined;
  if (emailConfigured && digest.from && sendEmail) {
    const emailResult = await sendEmail({
      from: digest.from,
      to: digest.to,
      subject: draft.subject,
      html: draft.html,
      text: draft.text,
      idempotencyKey,
    });
    if (emailResult.error) {
      return {
        sent: false,
        idempotencyKey,
        runDate: resolvedDate,
        slackSent,
        channel: "email",
        error: { message: emailResult.error.message, name: emailResult.error.name },
      };
    }
    emailMessageId = emailResult.id;
  }

  audit.append({
    type: "delivered",
    batchId: batch.batchId,
    idempotencyKey,
    note: [slackSent ? "slack" : null, emailMessageId ? "email" : null]
      .filter(Boolean)
      .join("+"),
    written: false,
  });

  return {
    sent: true,
    idempotencyKey,
    slackSent,
    emailMessageId,
    proposalCount: draft.proposalCount,
    runDate: resolvedDate,
  };
};
