import { escapeSlackMrkdwn } from "./slack-post";

export type UpcomingRfp = {
  readonly id: string;
  readonly title: string;
  readonly dueDate: string;
  readonly sourceId?: string;
};

export type DigestDraft = {
  readonly subject: string;
  readonly slackText: string;
  readonly upcomingCount: number;
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

export const utcDateStamp = (now = new Date()): string =>
  now.toISOString().slice(0, 10);

export const buildDigestIdempotencyKey = (runDate: string): string =>
  `rfp-response-drafter-${runDate}`;

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

export const buildDeadlineDigest = (
  rfps: readonly UpcomingRfp[],
  options: {
    readonly runDate?: string;
    readonly subject?: string;
  } = {},
): DigestDraft => {
  const runDate = options.runDate ?? utcDateStamp();
  const subject = `${options.subject ?? "RFP deadline digest"} — ${runDate}`;
  const lines = rfps.slice(0, 20).map((rfp) => {
    const title = escapeSlackMrkdwn(rfp.title);
    const dueDate = escapeSlackMrkdwn(rfp.dueDate);
    return `• ${title} due ${dueDate}`;
  });
  const slackText = [
    `RFP deadline digest (${runDate})`,
    `${rfps.length} upcoming RFP deadline${rfps.length === 1 ? "" : "s"}. Drafts stay in Drive or mailbox Drafts. Nothing is submitted.`,
    ...lines,
  ].join("\n");

  return {
    subject,
    slackText,
    upcomingCount: rfps.length,
  };
};
