import {
  countByBucket,
  utcDateStamp,
  type OpenInvoice,
} from "./aging";

export type DigestDraft = {
  readonly subject: string;
  readonly slackText: string;
  readonly openCount: number;
  readonly reminderCount: number;
  readonly paidDropped: number;
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
  `invoice-chase-drafter-${runDate}`;

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
  invoices: readonly OpenInvoice[],
  options: {
    readonly runDate?: string;
    readonly paidDropped?: number;
    readonly reminderCount?: number;
    readonly subject?: string;
  } = {},
): DigestDraft => {
  const runDate = options.runDate ?? utcDateStamp();
  const subject = `${options.subject ?? "AR chase digest"} — ${runDate}`;
  const counts = countByBucket(invoices);
  const reminderCount =
    options.reminderCount ??
    invoices.filter((invoice) => invoice.bucket !== "current").length;
  const paidDropped = options.paidDropped ?? 0;
  const lines = invoices.slice(0, 20).map((invoice) => {
    const email = escapeSlackMrkdwn(invoice.email ?? "no email");
    const number = escapeSlackMrkdwn(invoice.number);
    const customerName = escapeSlackMrkdwn(invoice.customerName);
    return `• ${number} ${customerName} ${invoice.balance.toFixed(2)} ${invoice.bucket} (${email})`;
  });
  const slackText = [
    `AR chase digest (${runDate})`,
    `${invoices.length} still-open invoices after paid re-check. ${paidDropped} paid rows dropped. ${reminderCount} reminder drafts staged.`,
    `Buckets: current ${counts.current}, 1-30 ${counts["1-30"]}, 31-60 ${counts["31-60"]}, 61-90 ${counts["61-90"]}, 90+ ${counts["90+"]}.`,
    ...lines,
  ].join("\n");

  return {
    subject,
    slackText,
    openCount: invoices.length,
    reminderCount,
    paidDropped,
  };
};
