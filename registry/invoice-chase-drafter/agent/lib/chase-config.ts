export const AR_PROVIDERS = ["quickbooks", "xero"] as const;
export const MAILBOX_PROVIDERS = ["gmail", "outlook"] as const;

export type ArProvider = (typeof AR_PROVIDERS)[number];
export type MailboxProvider = (typeof MAILBOX_PROVIDERS)[number];

export const DEFAULT_CHASE_CRON = "0 8 * * 1-5";
export const DEFAULT_MAX_INVOICES = 100;
export const DEFAULT_STORE_PATH = ".data/invoice-chase-store.json";
export const DEFAULT_DIGEST_SUBJECT = "AR chase digest";

export type InvoiceChaseConfig = {
  readonly arProvider: ArProvider | null;
  readonly mailboxProvider: MailboxProvider | null;
  readonly cron: string;
  readonly maxInvoices: number;
  readonly storePath: string;
  readonly slackConnectUid?: string;
  readonly slackChannelId?: string;
  readonly quickbooks: {
    readonly connectUid?: string;
    readonly realmId?: string;
    readonly environment: "production" | "sandbox";
  };
  readonly xero: {
    readonly connectUid?: string;
    readonly tenantId?: string;
  };
  readonly gmail: {
    readonly connectUid?: string;
    readonly user?: string;
  };
  readonly outlook: {
    readonly connectUid?: string;
  };
  readonly digestSubject: string;
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

export function isWeekdayCron(cron: string): boolean {
  const fields = cron.trim().split(/\s+/);
  if (fields.length !== 5) {
    return false;
  }
  const dow = fields[4] ?? "";
  return dow === "1-5" || dow === "MON-FRI" || dow === "mon-fri";
}

export function resolveArProvider(
  env: NodeJS.Dict<string>,
): ArProvider | null {
  const forced = optional(env.INVOICE_CHASE_AR_PROVIDER)?.toLowerCase();
  if (forced) {
    if (forced === "quickbooks" || forced === "xero") {
      return forced;
    }
    return null;
  }

  if (optional(env.INVOICE_CHASE_QUICKBOOKS_CONNECT_UID)) {
    return "quickbooks";
  }
  if (optional(env.INVOICE_CHASE_XERO_CONNECT_UID)) {
    return "xero";
  }
  return null;
}

export function resolveMailboxProvider(
  env: NodeJS.Dict<string>,
): MailboxProvider | null {
  const forced = optional(env.INVOICE_CHASE_MAILBOX_PROVIDER)?.toLowerCase();
  if (forced) {
    if (forced === "gmail" || forced === "outlook") {
      return forced;
    }
    return null;
  }

  if (optional(env.INVOICE_CHASE_GOOGLE_CONNECT_UID)) {
    return "gmail";
  }
  if (optional(env.INVOICE_CHASE_MICROSOFT_CONNECT_UID)) {
    return "outlook";
  }
  return null;
}

export function loadInvoiceChaseConfig(
  env: NodeJS.Dict<string> = process.env,
): InvoiceChaseConfig {
  const environment =
    optional(env.INVOICE_CHASE_QUICKBOOKS_ENVIRONMENT)?.toLowerCase() ===
    "sandbox"
      ? "sandbox"
      : "production";

  return {
    arProvider: resolveArProvider(env),
    mailboxProvider: resolveMailboxProvider(env),
    cron: optional(env.INVOICE_CHASE_CRON) ?? DEFAULT_CHASE_CRON,
    maxInvoices: parsePositiveInteger(
      env.INVOICE_CHASE_MAX_INVOICES,
      DEFAULT_MAX_INVOICES,
    ),
    storePath: optional(env.INVOICE_CHASE_STORE_PATH) ?? DEFAULT_STORE_PATH,
    slackConnectUid: optional(env.INVOICE_CHASE_SLACK_CONNECT_UID),
    slackChannelId: optional(env.INVOICE_CHASE_SLACK_CHANNEL_ID),
    quickbooks: {
      connectUid: optional(env.INVOICE_CHASE_QUICKBOOKS_CONNECT_UID),
      realmId: optional(env.INVOICE_CHASE_QUICKBOOKS_REALM_ID),
      environment,
    },
    xero: {
      connectUid: optional(env.INVOICE_CHASE_XERO_CONNECT_UID),
      tenantId: optional(env.INVOICE_CHASE_XERO_TENANT_ID),
    },
    gmail: {
      connectUid: optional(env.INVOICE_CHASE_GOOGLE_CONNECT_UID),
      user: optional(env.INVOICE_CHASE_GMAIL_USER),
    },
    outlook: {
      connectUid: optional(env.INVOICE_CHASE_MICROSOFT_CONNECT_UID),
    },
    digestSubject: DEFAULT_DIGEST_SUBJECT,
  };
}

export const invoiceChaseConfig = loadInvoiceChaseConfig();

export const isSlackDeliveryConfigured = (
  config: InvoiceChaseConfig = invoiceChaseConfig,
): boolean => Boolean(config.slackConnectUid && config.slackChannelId);

export const isMailboxConfigured = (
  config: InvoiceChaseConfig = invoiceChaseConfig,
): boolean => missingMailboxEnv(config).length === 0;

export function missingArProviderEnv(
  config: InvoiceChaseConfig = invoiceChaseConfig,
): readonly string[] {
  if (!config.arProvider) {
    return ["INVOICE_CHASE_AR_PROVIDER"];
  }
  if (config.arProvider === "quickbooks") {
    const missing: string[] = [];
    if (!config.quickbooks.connectUid) {
      missing.push("INVOICE_CHASE_QUICKBOOKS_CONNECT_UID");
    }
    if (!config.quickbooks.realmId) {
      missing.push("INVOICE_CHASE_QUICKBOOKS_REALM_ID");
    }
    return missing;
  }
  const missing: string[] = [];
  if (!config.xero.connectUid) {
    missing.push("INVOICE_CHASE_XERO_CONNECT_UID");
  }
  if (!config.xero.tenantId) {
    missing.push("INVOICE_CHASE_XERO_TENANT_ID");
  }
  return missing;
}

export function missingMailboxEnv(
  config: InvoiceChaseConfig = invoiceChaseConfig,
): readonly string[] {
  if (!config.mailboxProvider) {
    return ["INVOICE_CHASE_MAILBOX_PROVIDER"];
  }
  if (config.mailboxProvider === "gmail" && !config.gmail.connectUid) {
    return ["INVOICE_CHASE_GOOGLE_CONNECT_UID"];
  }
  if (config.mailboxProvider === "outlook" && !config.outlook.connectUid) {
    return ["INVOICE_CHASE_MICROSOFT_CONNECT_UID"];
  }
  return [];
}

export const missingDeliveryEnv = (
  config: InvoiceChaseConfig = invoiceChaseConfig,
): readonly string[] => {
  if (isSlackDeliveryConfigured(config)) {
    return [];
  }
  const missing: string[] = [];
  if (!config.slackConnectUid) {
    missing.push("INVOICE_CHASE_SLACK_CONNECT_UID");
  }
  if (!config.slackChannelId) {
    missing.push("INVOICE_CHASE_SLACK_CHANNEL_ID");
  }
  return missing;
};

export const missingChaseConfig = (
  config: InvoiceChaseConfig = invoiceChaseConfig,
): readonly string[] => [
  ...missingArProviderEnv(config),
  ...missingMailboxEnv(config),
  ...missingDeliveryEnv(config),
];
