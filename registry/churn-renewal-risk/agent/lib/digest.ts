import { countByBucket, utcDateStamp, type ScoreBatch } from "./score";

export type DigestDraft = {
  readonly subject: string;
  readonly slackText: string;
  readonly moverCount: number;
  readonly skippedCount: number;
};

export type DigestDeliveryKey =
  | {
      readonly ok: true;
      readonly runDate: string;
      readonly idempotencyKey: string;
    }
  | {
      readonly ok: false;
      readonly runDate: string;
      readonly expected: string;
    };

export const buildDigestIdempotencyKey = (runDate: string): string =>
  `churn-renewal-risk-${runDate}`;

export const resolveDigestDeliveryKey = (input: {
  readonly runDate?: string;
  readonly idempotencyKey: string;
}): DigestDeliveryKey => {
  const runDate = input.runDate ?? utcDateStamp();
  const expected = buildDigestIdempotencyKey(runDate);
  if (input.idempotencyKey !== expected) {
    return { ok: false, runDate, expected };
  }
  return { ok: true, runDate, idempotencyKey: expected };
};

export const escapeSlackMrkdwn = (value: string): string =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export const buildDigestDraft = (
  batch: ScoreBatch,
  options: {
    readonly runDate?: string;
    readonly subject?: string;
  } = {},
): DigestDraft => {
  const runDate = options.runDate ?? utcDateStamp();
  const subject = `${options.subject ?? "Renewal risk digest"} — ${runDate}`;
  const counts = countByBucket(batch.scored);
  const movers = batch.movers;
  const lines = movers.slice(0, 20).map((row) => {
    const name = escapeSlackMrkdwn(row.account.name);
    const previous = row.previousBucket ?? "new";
    const renewal = row.account.renewalDate ?? "unknown";
    return `• ${name} ${previous} → ${row.bucket} (renewal ${renewal})`;
  });
  const slackText = [
    `Renewal risk digest (${runDate})`,
    `${movers.length} Healthy/Watch/At-risk mover(s). ${batch.skipped.length} fail-closed health skip(s).`,
    `Buckets: Healthy ${counts.healthy}, Watch ${counts.watch}, At-risk ${counts["at-risk"]}.`,
    "No customer email was sent. CRM notes wait for draft_save_play after approval.",
    ...lines,
  ].join("\n");

  return {
    subject,
    slackText,
    moverCount: movers.length,
    skippedCount: batch.skipped.length,
  };
};
