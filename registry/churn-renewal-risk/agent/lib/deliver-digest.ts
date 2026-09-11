import { createAuditLog, type AuditLog } from "./audit-log";
import { buildDigestDraft, type DigestDraft } from "./digest";
import { utcDateStamp, type ScoreBatch } from "./score";
import { postSlackDigest, type SlackChannelSend } from "./slack-post";

export type DeliverRenewalDigestInput = {
  readonly audit: AuditLog;
  readonly batch: ScoreBatch;
  readonly slackConnectUid?: string;
  readonly slackChannelId?: string;
  readonly runDate?: string;
  readonly idempotencyKey: string;
  readonly subject?: string;
  readonly postSlack?: SlackChannelSend;
};

export type DeliverRenewalDigestResult = {
  readonly sent: boolean;
  readonly replayed?: boolean;
  readonly emailedCustomer: false;
  readonly written: false;
  readonly idempotencyKey: string;
  readonly slackSent?: boolean;
  readonly moverCount?: number;
  readonly runDate?: string;
  readonly error?: { readonly message: string; readonly name: string };
};

export const deliverRenewalDigest = async ({
  audit,
  batch,
  slackConnectUid,
  slackChannelId,
  runDate,
  idempotencyKey,
  subject,
  postSlack = postSlackDigest,
}: DeliverRenewalDigestInput): Promise<DeliverRenewalDigestResult> => {
  const resolvedDate = runDate ?? utcDateStamp();
  const draft: DigestDraft = buildDigestDraft(batch, {
    runDate: resolvedDate,
    subject,
  });
  const cached = audit.findByIdempotencyKey(idempotencyKey);
  if (cached?.type === "delivered") {
    return {
      sent: true,
      replayed: true,
      emailedCustomer: false,
      written: false,
      idempotencyKey,
      slackSent: true,
      moverCount: draft.moverCount,
      runDate: resolvedDate,
    };
  }

  if (!(slackConnectUid && slackChannelId)) {
    return {
      sent: false,
      emailedCustomer: false,
      written: false,
      idempotencyKey,
      runDate: resolvedDate,
      error: {
        name: "slack_not_configured",
        message: "Slack Connect UID and channel id are required.",
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
      audit.append({
        type: "refused",
        batchId: batch.batchId,
        written: false,
        emailedCustomer: false,
        idempotencyKey,
        note: slackResponse.error ?? "Slack chat.postMessage failed.",
      });
      return {
        sent: false,
        emailedCustomer: false,
        written: false,
        idempotencyKey,
        runDate: resolvedDate,
        error: {
          message: slackResponse.error ?? "Slack chat.postMessage failed.",
          name: "slack_channel_failed",
        },
      };
    }
  } catch (error) {
    audit.append({
      type: "refused",
      batchId: batch.batchId,
      written: false,
      emailedCustomer: false,
      idempotencyKey,
      note:
        error instanceof Error ? error.message : "Slack channel send failed.",
    });
    return {
      sent: false,
      emailedCustomer: false,
      written: false,
      idempotencyKey,
      runDate: resolvedDate,
      error: {
        name: "slack_delivery_failed",
        message:
          error instanceof Error ? error.message : "Slack channel send failed.",
      },
    };
  }

  audit.append({
    type: "delivered",
    batchId: batch.batchId,
    accountIds: batch.movers.map((row) => row.account.id),
    written: false,
    emailedCustomer: false,
    idempotencyKey,
    note: "slack",
  });

  return {
    sent: true,
    emailedCustomer: false,
    written: false,
    idempotencyKey,
    slackSent: true,
    moverCount: draft.moverCount,
    runDate: resolvedDate,
  };
};

export function auditForPath(filePath: string): AuditLog {
  return createAuditLog(filePath);
}
