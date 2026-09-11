import { accountFieldsLookLikeInstructions } from "./untrusted";

export const RISK_BUCKETS = ["healthy", "watch", "at-risk"] as const;

export type RiskBucket = (typeof RISK_BUCKETS)[number];

export type RenewalAccount = {
  readonly id: string;
  readonly name: string;
  readonly ownerName?: string;
  readonly ownerEmail?: string;
  readonly renewalDate?: string;
  readonly stripeCustomerId?: string;
  readonly domain?: string;
};

export type StripeHealth = {
  readonly customerId: string;
  readonly status?: string;
  readonly delinquent?: boolean;
  readonly pastDue?: boolean;
  readonly unpaidInvoices?: number;
  readonly failedCharges30d?: number;
  readonly openInvoiceCents?: number;
  readonly subscriptionStatus?: string;
};

export type HealthLookup =
  | {
      readonly ok: true;
      readonly failClosed: false;
      readonly health: StripeHealth;
    }
  | {
      readonly ok: false;
      readonly failClosed: true;
      readonly note: string;
    };

export type ScoredAccount = {
  readonly account: RenewalAccount;
  readonly bucket: RiskBucket;
  readonly previousBucket?: RiskBucket;
  readonly moved: boolean;
  readonly reasons: readonly string[];
  readonly failClosed: false;
};

export type SkippedAccount = {
  readonly account: RenewalAccount;
  readonly failClosed: true;
  readonly note: string;
};

export type ScoreBatch = {
  readonly batchId: string;
  readonly provider: string;
  readonly scannedAt: string;
  readonly scored: readonly ScoredAccount[];
  readonly skipped: readonly SkippedAccount[];
  readonly movers: readonly ScoredAccount[];
};

const MS_PER_DAY = 86_400_000;
const WATCH_RENEWAL_DAYS = 30;
const AT_RISK_RENEWAL_DAYS = 14;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:T|$)/;

export function utcDateStamp(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function parseRenewalDate(value: string | undefined): Date | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !ISO_DATE.test(trimmed)) {
    return undefined;
  }
  const parsed = Date.parse(trimmed.length === 10 ? `${trimmed}T00:00:00.000Z` : trimmed);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return new Date(parsed);
}

export function daysUntilRenewal(
  renewalDate: string | undefined,
  now = new Date(),
): number | undefined {
  const date = parseRenewalDate(renewalDate);
  if (!date) {
    return undefined;
  }
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const renewal = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return Math.round((renewal - start) / MS_PER_DAY);
}

export function isInRenewalWindow(
  renewalDate: string | undefined,
  lookaheadDays: number,
  now = new Date(),
): boolean {
  const days = daysUntilRenewal(renewalDate, now);
  if (days === undefined) {
    return false;
  }
  return days >= 0 && days <= lookaheadDays;
}

const UNHEALTHY_SUBSCRIPTION = new Set([
  "past_due",
  "unpaid",
  "canceled",
  "incomplete_expired",
]);

export function scoreAccount(input: {
  readonly account: RenewalAccount;
  readonly health: HealthLookup;
  readonly previousBucket?: RiskBucket;
  readonly now?: Date;
}): ScoredAccount | SkippedAccount {
  const { account, health } = input;
  if (accountFieldsLookLikeInstructions(account)) {
    return {
      account,
      failClosed: true,
      note: "Health failed closed: account fields looked like instructions.",
    };
  }

  const days = daysUntilRenewal(account.renewalDate, input.now);
  if (days === undefined) {
    return {
      account,
      failClosed: true,
      note: "Health failed closed: renewal date is missing or invalid.",
    };
  }

  if (!health.ok) {
    return {
      account,
      failClosed: true,
      note: health.note,
    };
  }

  const reasons: string[] = [];
  const stripe = health.health;
  const subscription = stripe.subscriptionStatus?.toLowerCase();
  if (stripe.delinquent) {
    reasons.push("Stripe customer is delinquent.");
  }
  if (stripe.pastDue || subscription === "past_due") {
    reasons.push("Stripe subscription is past due.");
  }
  if (subscription && UNHEALTHY_SUBSCRIPTION.has(subscription)) {
    reasons.push(`Stripe subscription status is ${subscription}.`);
  }
  if ((stripe.unpaidInvoices ?? 0) > 0) {
    reasons.push(`${stripe.unpaidInvoices} unpaid Stripe invoice(s).`);
  }
  if ((stripe.failedCharges30d ?? 0) > 0) {
    reasons.push(`${stripe.failedCharges30d} failed Stripe charge(s) in 30 days.`);
  }
  if ((stripe.openInvoiceCents ?? 0) > 0) {
    reasons.push("Open Stripe invoice balance.");
  }

  let bucket: RiskBucket = "healthy";
  if (reasons.length > 0) {
    bucket = "at-risk";
  } else if (days <= AT_RISK_RENEWAL_DAYS) {
    bucket = "watch";
    reasons.push(`Renewal in ${days} day(s).`);
  } else if (days <= WATCH_RENEWAL_DAYS) {
    bucket = "watch";
    reasons.push(`Renewal in ${days} day(s).`);
  } else {
    reasons.push("Stripe payment health is current.");
  }

  const previousBucket = input.previousBucket;
  return {
    account,
    bucket,
    previousBucket,
    moved: previousBucket !== bucket,
    reasons,
    failClosed: false,
  };
}

export function scoreRenewalRisk(input: {
  readonly provider: string;
  readonly scannedAt?: string;
  readonly accounts: readonly RenewalAccount[];
  readonly healthByAccountId: Readonly<Record<string, HealthLookup>>;
  readonly previousBuckets?: Readonly<Record<string, RiskBucket>>;
  readonly now?: Date;
}): ScoreBatch {
  const scored: ScoredAccount[] = [];
  const skipped: SkippedAccount[] = [];
  for (const account of input.accounts) {
    const health = input.healthByAccountId[account.id] ?? {
      ok: false,
      failClosed: true,
      note: "Health failed closed: Stripe customer could not be resolved.",
    };
    const result = scoreAccount({
      account,
      health,
      previousBucket: input.previousBuckets?.[account.id],
      now: input.now,
    });
    if (result.failClosed) {
      skipped.push(result);
    } else {
      scored.push(result);
    }
  }

  const scannedAt = input.scannedAt ?? new Date().toISOString();
  const date = scannedAt.slice(0, 10);
  return {
    batchId: `churn-renewal-${date}-${input.provider}`,
    provider: input.provider,
    scannedAt,
    scored,
    skipped,
    movers: scored.filter((row) => row.moved),
  };
}

export function countByBucket(
  scored: readonly ScoredAccount[],
): Record<RiskBucket, number> {
  return {
    healthy: scored.filter((row) => row.bucket === "healthy").length,
    watch: scored.filter((row) => row.bucket === "watch").length,
    "at-risk": scored.filter((row) => row.bucket === "at-risk").length,
  };
}
