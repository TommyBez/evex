export const CRM_PROVIDERS = ["hubspot", "salesforce", "pipedrive"] as const;

export type CrmProvider = (typeof CRM_PROVIDERS)[number];

export const DEFAULT_HYGIENE_CRON = "0 8 * * *";
export const DEFAULT_MAX_RECORDS = 100;
export const DEFAULT_AUDIT_PATH = ".data/crm-hygiene-audit.jsonl";
export const DEFAULT_DIGEST_SUBJECT = "CRM hygiene batch";
export const DEFAULT_AUDIT_RETENTION_DAYS = 90;

export type CrmHygieneConfig = {
  readonly provider: CrmProvider | null;
  readonly cron: string;
  readonly maxRecords: number;
  readonly auditPath: string;
  readonly slackConnectUid?: string;
  readonly slackChannelId?: string;
  readonly hubspot: {
    readonly connectUid?: string;
  };
  readonly salesforce: {
    readonly connectUid?: string;
    readonly instanceUrl?: string;
  };
  readonly pipedrive: {
    readonly connectUid?: string;
    readonly companyDomain?: string;
  };
  readonly digest: {
    readonly from?: string;
    readonly to: readonly string[];
    readonly subject: string;
  };
  readonly defaultPhoneCountryCode?: string;
  readonly auditRetentionDays: number;
};

const optional = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const compactCsv = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

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
    if (
      forced === "hubspot" ||
      forced === "salesforce" ||
      forced === "pipedrive"
    ) {
      return forced;
    }
    return null;
  }

  if (optional(env.CRM_HYGIENE_HUBSPOT_CONNECT_UID)) {
    return "hubspot";
  }
  if (optional(env.CRM_HYGIENE_SALESFORCE_CONNECT_UID)) {
    return "salesforce";
  }
  if (optional(env.CRM_HYGIENE_PIPEDRIVE_CONNECT_UID)) {
    return "pipedrive";
  }
  return null;
}

export function loadCrmHygieneConfig(
  env: NodeJS.Dict<string> = process.env,
): CrmHygieneConfig {
  return {
    provider: resolveCrmProvider(env),
    cron: optional(env.CRM_HYGIENE_CRON) ?? DEFAULT_HYGIENE_CRON,
    maxRecords: parsePositiveInteger(
      env.CRM_HYGIENE_MAX_RECORDS,
      DEFAULT_MAX_RECORDS,
    ),
    auditPath: optional(env.CRM_HYGIENE_AUDIT_PATH) ?? DEFAULT_AUDIT_PATH,
    slackConnectUid: optional(env.CRM_HYGIENE_SLACK_CONNECT_UID),
    slackChannelId: optional(env.CRM_HYGIENE_SLACK_CHANNEL_ID),
    hubspot: {
      connectUid: optional(env.CRM_HYGIENE_HUBSPOT_CONNECT_UID),
    },
    salesforce: {
      connectUid: optional(env.CRM_HYGIENE_SALESFORCE_CONNECT_UID),
      instanceUrl: optional(env.CRM_HYGIENE_SALESFORCE_INSTANCE_URL),
    },
    pipedrive: {
      connectUid: optional(env.CRM_HYGIENE_PIPEDRIVE_CONNECT_UID),
      companyDomain: optional(env.CRM_HYGIENE_PIPEDRIVE_COMPANY_DOMAIN),
    },
    digest: {
      from: optional(env.CRM_HYGIENE_DIGEST_FROM),
      to: compactCsv(env.CRM_HYGIENE_DIGEST_TO),
      subject: optional(env.CRM_HYGIENE_DIGEST_SUBJECT) ?? DEFAULT_DIGEST_SUBJECT,
    },
    defaultPhoneCountryCode: optional(
      env.CRM_HYGIENE_DEFAULT_PHONE_COUNTRY_CODE,
    )?.replace(/\D/g, "") || undefined,
    auditRetentionDays: parsePositiveInteger(
      env.CRM_HYGIENE_AUDIT_RETENTION_DAYS,
      DEFAULT_AUDIT_RETENTION_DAYS,
    ),
  };
}

export const crmHygieneConfig = loadCrmHygieneConfig();

export const isSlackDeliveryConfigured = (
  config: CrmHygieneConfig = crmHygieneConfig,
): boolean => Boolean(config.slackConnectUid && config.slackChannelId);

export const isEmailDeliveryConfigured = (
  config: CrmHygieneConfig = crmHygieneConfig,
): boolean => Boolean(config.digest.from && config.digest.to.length > 0);

export const missingDeliveryEnv = (
  config: CrmHygieneConfig = crmHygieneConfig,
): readonly string[] => {
  if (isSlackDeliveryConfigured(config) || isEmailDeliveryConfigured(config)) {
    return [];
  }
  const missing: string[] = [];
  if (!config.slackConnectUid) {
    missing.push("CRM_HYGIENE_SLACK_CONNECT_UID");
  }
  if (!config.slackChannelId) {
    missing.push("CRM_HYGIENE_SLACK_CHANNEL_ID");
  }
  if (!config.digest.from) {
    missing.push("CRM_HYGIENE_DIGEST_FROM");
  }
  if (config.digest.to.length === 0) {
    missing.push("CRM_HYGIENE_DIGEST_TO");
  }
  return missing;
};

export function missingCrmProviderEnv(
  config: CrmHygieneConfig = crmHygieneConfig,
): readonly string[] {
  if (!config.provider) {
    return ["CRM_PROVIDER"];
  }
  if (config.provider === "hubspot" && !config.hubspot.connectUid) {
    return ["CRM_HYGIENE_HUBSPOT_CONNECT_UID"];
  }
  if (config.provider === "salesforce") {
    const missing: string[] = [];
    if (!config.salesforce.connectUid) {
      missing.push("CRM_HYGIENE_SALESFORCE_CONNECT_UID");
    }
    if (!config.salesforce.instanceUrl) {
      missing.push("CRM_HYGIENE_SALESFORCE_INSTANCE_URL");
    }
    return missing;
  }
  if (config.provider === "pipedrive" && !config.pipedrive.connectUid) {
    return ["CRM_HYGIENE_PIPEDRIVE_CONNECT_UID"];
  }
  return [];
}

export const missingHygieneConfig = (
  config: CrmHygieneConfig = crmHygieneConfig,
): readonly string[] => {
  const missing = [...missingCrmProviderEnv(config), ...missingDeliveryEnv(config)];
  if (isEmailDeliveryConfigured(config) && !process.env.RESEND_API_KEY?.trim()) {
    missing.push("RESEND_API_KEY");
  }
  return missing;
};
