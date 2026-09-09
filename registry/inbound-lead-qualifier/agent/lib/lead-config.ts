export const CRM_PROVIDERS = ["hubspot", "salesforce", "pipedrive"] as const;

export type CrmProvider = (typeof CRM_PROVIDERS)[number];

export const DEFAULT_LEAD_CRON = "0 * * * *";
export const DEFAULT_CURSOR_PATH = ".data/inbound-lead-cursor.json";
export const DEFAULT_HOT_THRESHOLD = 70;

export type InboundLeadConfig = {
  readonly cron: string;
  readonly cursorPath: string;
  readonly pushWebhookSecret?: string;
  readonly slackConnectUid?: string;
  readonly slackChannelId?: string;
  readonly provider: CrmProvider | null;
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
  readonly typeform: {
    readonly connectUid?: string;
    readonly formId?: string;
  };
  readonly icp: {
    readonly domains: readonly string[];
    readonly titles: readonly string[];
    readonly keywords: readonly string[];
    readonly hotThreshold: number;
    readonly requireWorkEmail: boolean;
  };
};

const optional = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const compactCsv = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  const trimmed = value?.trim().toLowerCase();
  if (trimmed === "true" || trimmed === "1" || trimmed === "yes") {
    return true;
  }
  if (trimmed === "false" || trimmed === "0" || trimmed === "no") {
    return false;
  }
  return fallback;
};

export function isCrmProviderEnvComplete(
  provider: CrmProvider,
  env: NodeJS.Dict<string>,
): boolean {
  if (provider === "hubspot") {
    return Boolean(optional(env.INBOUND_LEAD_HUBSPOT_CONNECT_UID));
  }
  if (provider === "salesforce") {
    return Boolean(
      optional(env.INBOUND_LEAD_SALESFORCE_CONNECT_UID) &&
        optional(env.INBOUND_LEAD_SALESFORCE_INSTANCE_URL),
    );
  }
  return Boolean(optional(env.INBOUND_LEAD_PIPEDRIVE_CONNECT_UID));
}

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

  for (const provider of CRM_PROVIDERS) {
    if (isCrmProviderEnvComplete(provider, env)) {
      return provider;
    }
  }
  return null;
}

export function loadInboundLeadConfig(
  env: NodeJS.Dict<string> = process.env,
): InboundLeadConfig {
  return {
    cron: optional(env.INBOUND_LEAD_CRON) ?? DEFAULT_LEAD_CRON,
    cursorPath: optional(env.INBOUND_LEAD_CURSOR_PATH) ?? DEFAULT_CURSOR_PATH,
    pushWebhookSecret: optional(env.INBOUND_LEAD_PUSH_WEBHOOK_SECRET),
    slackConnectUid: optional(env.INBOUND_LEAD_SLACK_CONNECT_UID),
    slackChannelId: optional(env.INBOUND_LEAD_SLACK_CHANNEL_ID),
    provider: resolveCrmProvider(env),
    hubspot: {
      connectUid: optional(env.INBOUND_LEAD_HUBSPOT_CONNECT_UID),
    },
    salesforce: {
      connectUid: optional(env.INBOUND_LEAD_SALESFORCE_CONNECT_UID),
      instanceUrl: optional(env.INBOUND_LEAD_SALESFORCE_INSTANCE_URL),
    },
    pipedrive: {
      connectUid: optional(env.INBOUND_LEAD_PIPEDRIVE_CONNECT_UID),
      companyDomain: optional(env.INBOUND_LEAD_PIPEDRIVE_COMPANY_DOMAIN),
    },
    typeform: {
      connectUid: optional(env.INBOUND_LEAD_TYPEFORM_CONNECT_UID),
      formId: optional(env.INBOUND_LEAD_TYPEFORM_FORM_ID),
    },
    icp: {
      domains: compactCsv(env.INBOUND_LEAD_ICP_DOMAINS),
      titles: compactCsv(env.INBOUND_LEAD_ICP_TITLES),
      keywords: compactCsv(env.INBOUND_LEAD_ICP_KEYWORDS),
      hotThreshold: parsePositiveInteger(
        env.INBOUND_LEAD_HOT_THRESHOLD,
        DEFAULT_HOT_THRESHOLD,
      ),
      requireWorkEmail: parseBoolean(env.INBOUND_LEAD_REQUIRE_WORK_EMAIL, true),
    },
  };
}

export const inboundLeadConfig = loadInboundLeadConfig();

export const isSlackNotifyConfigured = (
  config: InboundLeadConfig = inboundLeadConfig,
): boolean => Boolean(config.slackConnectUid && config.slackChannelId);

export const isPushConfigured = (
  config: InboundLeadConfig = inboundLeadConfig,
): boolean => Boolean(config.pushWebhookSecret);

export const isTypeformConfigured = (
  config: InboundLeadConfig = inboundLeadConfig,
): boolean => Boolean(config.typeform.connectUid && config.typeform.formId);

export function missingCrmProviderEnv(
  config: InboundLeadConfig = inboundLeadConfig,
): readonly string[] {
  if (!config.provider) {
    return [];
  }
  if (config.provider === "hubspot" && !config.hubspot.connectUid) {
    return ["INBOUND_LEAD_HUBSPOT_CONNECT_UID"];
  }
  if (config.provider === "salesforce") {
    const missing: string[] = [];
    if (!config.salesforce.connectUid) {
      missing.push("INBOUND_LEAD_SALESFORCE_CONNECT_UID");
    }
    if (!config.salesforce.instanceUrl) {
      missing.push("INBOUND_LEAD_SALESFORCE_INSTANCE_URL");
    }
    return missing;
  }
  if (config.provider === "pipedrive" && !config.pipedrive.connectUid) {
    return ["INBOUND_LEAD_PIPEDRIVE_CONNECT_UID"];
  }
  return [];
}

export const isCrmConfigured = (
  config: InboundLeadConfig = inboundLeadConfig,
): boolean =>
  Boolean(config.provider) && missingCrmProviderEnv(config).length === 0;

export function missingIntakeEnv(
  config: InboundLeadConfig = inboundLeadConfig,
): readonly string[] {
  if (
    isPushConfigured(config) ||
    isTypeformConfigured(config) ||
    isCrmConfigured(config)
  ) {
    return [];
  }
  return [
    "INBOUND_LEAD_PUSH_WEBHOOK_SECRET",
    "INBOUND_LEAD_TYPEFORM_CONNECT_UID",
    "INBOUND_LEAD_HUBSPOT_CONNECT_UID",
  ];
}

export const missingLeadConfig = (
  config: InboundLeadConfig = inboundLeadConfig,
): readonly string[] => [
  ...missingIntakeEnv(config),
  ...missingCrmProviderEnv(config),
];
