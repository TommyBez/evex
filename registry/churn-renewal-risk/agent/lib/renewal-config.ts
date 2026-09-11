export const CRM_PROVIDERS = ["hubspot", "salesforce"] as const;

export type CrmProvider = (typeof CRM_PROVIDERS)[number];

export const DEFAULT_RENEWAL_CRON = "0 8 * * 1";
export const DEFAULT_LOOKAHEAD_DAYS = 90;
export const DEFAULT_MAX_ACCOUNTS = 100;
export const DEFAULT_AUDIT_PATH = ".data/churn-renewal-audit.jsonl";
export const DEFAULT_AUDIT_RETENTION_DAYS = 90;
export const DEFAULT_HUBSPOT_RENEWAL_PROPERTY = "renewal_date";
export const DEFAULT_HUBSPOT_STRIPE_CUSTOMER_PROPERTY = "stripe_customer_id";
export const DEFAULT_SALESFORCE_RENEWAL_FIELD = "Renewal_Date__c";
export const DEFAULT_SALESFORCE_STRIPE_CUSTOMER_FIELD =
  "Stripe_Customer_Id__c";

export type ChurnRenewalConfig = {
  readonly provider: CrmProvider | null;
  readonly cron: string;
  readonly lookaheadDays: number;
  readonly maxAccounts: number;
  readonly auditPath: string;
  readonly auditRetentionDays: number;
  readonly slackConnectUid?: string;
  readonly slackChannelId?: string;
  readonly hubspot: {
    readonly connectUid?: string;
    readonly renewalProperty: string;
    readonly stripeCustomerProperty: string;
  };
  readonly salesforce: {
    readonly connectUid?: string;
    readonly instanceUrl?: string;
    readonly renewalField: string;
    readonly stripeCustomerField: string;
  };
  readonly stripe: {
    readonly connectUid?: string;
  };
};

const optional = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export function resolveCrmProvider(
  env: NodeJS.Dict<string>,
): CrmProvider | null {
  const forced = optional(env.CRM_PROVIDER)?.toLowerCase();
  if (forced) {
    if (forced === "hubspot" || forced === "salesforce") {
      return forced;
    }
    return null;
  }

  if (optional(env.CHURN_RENEWAL_HUBSPOT_CONNECT_UID)) {
    return "hubspot";
  }
  if (optional(env.CHURN_RENEWAL_SALESFORCE_CONNECT_UID)) {
    return "salesforce";
  }
  return null;
}

export function loadChurnRenewalConfig(
  env: NodeJS.Dict<string> = process.env,
): ChurnRenewalConfig {
  return {
    provider: resolveCrmProvider(env),
    cron: optional(env.CHURN_RENEWAL_CRON) ?? DEFAULT_RENEWAL_CRON,
    lookaheadDays: parsePositiveInteger(
      env.CHURN_RENEWAL_LOOKAHEAD_DAYS,
      DEFAULT_LOOKAHEAD_DAYS,
    ),
    maxAccounts: parsePositiveInteger(
      env.CHURN_RENEWAL_MAX_ACCOUNTS,
      DEFAULT_MAX_ACCOUNTS,
    ),
    auditPath: optional(env.CHURN_RENEWAL_AUDIT_PATH) ?? DEFAULT_AUDIT_PATH,
    auditRetentionDays: parsePositiveInteger(
      env.CHURN_RENEWAL_AUDIT_RETENTION_DAYS,
      DEFAULT_AUDIT_RETENTION_DAYS,
    ),
    slackConnectUid: optional(env.CHURN_RENEWAL_SLACK_CONNECT_UID),
    slackChannelId: optional(env.CHURN_RENEWAL_SLACK_CHANNEL_ID),
    hubspot: {
      connectUid: optional(env.CHURN_RENEWAL_HUBSPOT_CONNECT_UID),
      renewalProperty:
        optional(env.CHURN_RENEWAL_HUBSPOT_RENEWAL_PROPERTY) ??
        DEFAULT_HUBSPOT_RENEWAL_PROPERTY,
      stripeCustomerProperty:
        optional(env.CHURN_RENEWAL_HUBSPOT_STRIPE_CUSTOMER_PROPERTY) ??
        DEFAULT_HUBSPOT_STRIPE_CUSTOMER_PROPERTY,
    },
    salesforce: {
      connectUid: optional(env.CHURN_RENEWAL_SALESFORCE_CONNECT_UID),
      instanceUrl: optional(env.CHURN_RENEWAL_SALESFORCE_INSTANCE_URL),
      renewalField:
        optional(env.CHURN_RENEWAL_SALESFORCE_RENEWAL_FIELD) ??
        DEFAULT_SALESFORCE_RENEWAL_FIELD,
      stripeCustomerField:
        optional(env.CHURN_RENEWAL_SALESFORCE_STRIPE_CUSTOMER_FIELD) ??
        DEFAULT_SALESFORCE_STRIPE_CUSTOMER_FIELD,
    },
    stripe: {
      connectUid: optional(env.CHURN_RENEWAL_STRIPE_CONNECT_UID),
    },
  };
}

export const churnRenewalConfig = loadChurnRenewalConfig();

export const isSlackDeliveryConfigured = (
  config: ChurnRenewalConfig = churnRenewalConfig,
): boolean => Boolean(config.slackConnectUid && config.slackChannelId);

export const isStripeConfigured = (
  config: ChurnRenewalConfig = churnRenewalConfig,
): boolean => Boolean(config.stripe.connectUid);

export const missingDeliveryEnv = (
  config: ChurnRenewalConfig = churnRenewalConfig,
): readonly string[] => {
  if (isSlackDeliveryConfigured(config)) {
    return [];
  }
  const missing: string[] = [];
  if (!config.slackConnectUid) {
    missing.push("CHURN_RENEWAL_SLACK_CONNECT_UID");
  }
  if (!config.slackChannelId) {
    missing.push("CHURN_RENEWAL_SLACK_CHANNEL_ID");
  }
  return missing;
};

export function missingCrmProviderEnv(
  config: ChurnRenewalConfig = churnRenewalConfig,
): readonly string[] {
  if (!config.provider) {
    return ["CRM_PROVIDER"];
  }
  if (config.provider === "hubspot" && !config.hubspot.connectUid) {
    return ["CHURN_RENEWAL_HUBSPOT_CONNECT_UID"];
  }
  if (config.provider === "salesforce") {
    const missing: string[] = [];
    if (!config.salesforce.connectUid) {
      missing.push("CHURN_RENEWAL_SALESFORCE_CONNECT_UID");
    }
    if (!config.salesforce.instanceUrl) {
      missing.push("CHURN_RENEWAL_SALESFORCE_INSTANCE_URL");
    }
    return missing;
  }
  return [];
}

export function missingStripeEnv(
  config: ChurnRenewalConfig = churnRenewalConfig,
): readonly string[] {
  return config.stripe.connectUid ? [] : ["CHURN_RENEWAL_STRIPE_CONNECT_UID"];
}

export const missingRenewalConfig = (
  config: ChurnRenewalConfig = churnRenewalConfig,
): readonly string[] => [
  ...missingCrmProviderEnv(config),
  ...missingStripeEnv(config),
  ...missingDeliveryEnv(config),
];
