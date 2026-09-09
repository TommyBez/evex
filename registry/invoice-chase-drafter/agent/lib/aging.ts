export const AGING_BUCKETS = [
  "current",
  "1-30",
  "31-60",
  "61-90",
  "90+",
] as const;

export type AgingBucket = (typeof AGING_BUCKETS)[number];

export const PAID_BALANCE_EPSILON = 0.005;
const MS_PER_DAY = 86_400_000;

export type OpenInvoice = {
  readonly id: string;
  readonly provider: "quickbooks" | "xero";
  readonly number: string;
  readonly customerName: string;
  readonly email?: string;
  readonly balance: number;
  readonly total: number;
  readonly dueDate?: string;
  readonly issuedDate?: string;
  readonly currency?: string;
  readonly status?: string;
  readonly daysPastDue: number;
  readonly bucket: AgingBucket;
};

export function utcDateStamp(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function parseMoney(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function isPaidBalance(balance: number): boolean {
  return balance <= PAID_BALANCE_EPSILON;
}

export function parseIsoDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }
  const xeroEpoch = /\/Date\((-?\d+)(?:[+-]\d+)?\)\//.exec(value);
  if (xeroEpoch?.[1]) {
    return new Date(Number(xeroEpoch[1]));
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function daysPastDueOn(
  dueDate: string | undefined,
  now = new Date(),
): number {
  const due = parseIsoDate(dueDate);
  if (!due) {
    return 0;
  }
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const dueUtc = Date.UTC(
    due.getUTCFullYear(),
    due.getUTCMonth(),
    due.getUTCDate(),
  );
  return Math.floor((todayUtc - dueUtc) / MS_PER_DAY);
}

export function bucketForDaysPastDue(daysPastDue: number): AgingBucket {
  if (daysPastDue <= 0) {
    return "current";
  }
  if (daysPastDue <= 30) {
    return "1-30";
  }
  if (daysPastDue <= 60) {
    return "31-60";
  }
  if (daysPastDue <= 90) {
    return "61-90";
  }
  return "90+";
}

export function withAging(
  invoice: Omit<OpenInvoice, "daysPastDue" | "bucket">,
  now = new Date(),
): OpenInvoice {
  const daysPastDue = daysPastDueOn(invoice.dueDate, now);
  return {
    ...invoice,
    daysPastDue,
    bucket: bucketForDaysPastDue(daysPastDue),
  };
}

export function needsReminderDraft(invoice: OpenInvoice): boolean {
  return (
    invoice.bucket !== "current" &&
    Boolean(invoice.email) &&
    !isPaidBalance(invoice.balance)
  );
}

export function isStillOpenInvoice(invoice: OpenInvoice): boolean {
  const status = invoice.status?.trim().toUpperCase() ?? "";
  if (status === "PAID" || status === "VOIDED" || status === "DELETED") {
    return false;
  }
  return !isPaidBalance(invoice.balance);
}

export function countByBucket(
  invoices: readonly OpenInvoice[],
): Record<AgingBucket, number> {
  const counts = {
    current: 0,
    "1-30": 0,
    "31-60": 0,
    "61-90": 0,
    "90+": 0,
  } satisfies Record<AgingBucket, number>;
  for (const invoice of invoices) {
    counts[invoice.bucket] += 1;
  }
  return counts;
}
