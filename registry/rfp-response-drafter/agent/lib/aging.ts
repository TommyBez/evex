export const AGING_BUCKETS = [
  "upcoming",
  "due-today",
  "1-7",
  "8-30",
  "30+",
] as const;

export type AgingBucket = (typeof AGING_BUCKETS)[number];

const MS_PER_DAY = 86_400_000;

export type OpenRfp = {
  readonly id: string;
  readonly title: string;
  readonly dueDate: string;
  readonly sourceId?: string;
  readonly daysUntilDue: number;
  readonly bucket: AgingBucket;
};

export function utcDateStamp(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function parseIsoDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function daysUntilDueOn(
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
  return Math.floor((dueUtc - todayUtc) / MS_PER_DAY);
}

export function bucketForDaysUntilDue(daysUntilDue: number): AgingBucket {
  if (daysUntilDue > 0) {
    return "upcoming";
  }
  if (daysUntilDue === 0) {
    return "due-today";
  }
  const daysPastDue = Math.abs(daysUntilDue);
  if (daysPastDue <= 7) {
    return "1-7";
  }
  if (daysPastDue <= 30) {
    return "8-30";
  }
  return "30+";
}

export function withAging(
  rfp: Omit<OpenRfp, "daysUntilDue" | "bucket">,
  now = new Date(),
): OpenRfp {
  const daysUntilDue = daysUntilDueOn(rfp.dueDate, now);
  return {
    ...rfp,
    daysUntilDue,
    bucket: bucketForDaysUntilDue(daysUntilDue),
  };
}

export function countByBucket(
  rfps: readonly OpenRfp[],
): Record<AgingBucket, number> {
  const counts = {
    upcoming: 0,
    "due-today": 0,
    "1-7": 0,
    "8-30": 0,
    "30+": 0,
  } satisfies Record<AgingBucket, number>;
  for (const rfp of rfps) {
    counts[rfp.bucket] += 1;
  }
  return counts;
}
