import {
  countByBucket,
  utcDateStamp,
  withAging,
  type OpenRfp,
} from "./aging";
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
  readonly text: string;
  readonly html: string;
  readonly upcomingCount: number;
  readonly aging: ReturnType<typeof countByBucket>;
  readonly rfps: readonly OpenRfp[];
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

export { utcDateStamp };

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

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const ageOpenRfps = (
  rfps: readonly UpcomingRfp[],
  now = new Date(),
): readonly OpenRfp[] => rfps.map((rfp) => withAging(rfp, now));

export const buildDeadlineDigest = (
  rfps: readonly UpcomingRfp[],
  options: {
    readonly runDate?: string;
    readonly subject?: string;
    readonly now?: Date;
  } = {},
): DigestDraft => {
  const runDate = options.runDate ?? utcDateStamp(options.now);
  const aged = ageOpenRfps(rfps, options.now ?? new Date(`${runDate}T00:00:00.000Z`));
  const aging = countByBucket(aged);
  const subject = `${options.subject ?? "RFP deadline digest"} — ${runDate}`;
  const lines = aged.slice(0, 20).map((rfp) => {
    const title = escapeSlackMrkdwn(rfp.title);
    const dueDate = escapeSlackMrkdwn(rfp.dueDate);
    return `• ${title} due ${dueDate} (${rfp.bucket})`;
  });
  const bucketLine = `Aging: upcoming ${aging.upcoming}, due-today ${aging["due-today"]}, 1-7 ${aging["1-7"]}, 8-30 ${aging["8-30"]}, 30+ ${aging["30+"]}.`;
  const header = [
    `RFP deadline digest (${runDate})`,
    `${aged.length} open RFP${aged.length === 1 ? "" : "s"}. Drafts stay in Drive or mailbox Drafts. Nothing is submitted.`,
    bucketLine,
  ];
  const slackText = [...header, ...lines].join("\n");
  const text = slackText;
  const htmlLines = aged.slice(0, 20).map((rfp) => {
    return `<li>${escapeHtml(rfp.title)} due ${escapeHtml(rfp.dueDate)} (${escapeHtml(rfp.bucket)})</li>`;
  });
  const html = [
    `<p>RFP deadline digest (${escapeHtml(runDate)})</p>`,
    `<p>${aged.length} open RFPs. Drafts stay in Drive or mailbox Drafts. Nothing is submitted.</p>`,
    `<p>${escapeHtml(bucketLine)}</p>`,
    htmlLines.length > 0 ? `<ul>${htmlLines.join("")}</ul>` : "",
  ].join("");

  return {
    subject,
    slackText,
    text,
    html,
    upcomingCount: aged.length,
    aging,
    rfps: aged,
  };
};
