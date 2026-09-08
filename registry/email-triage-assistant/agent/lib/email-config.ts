import { parseTriageBuckets } from "./triage-buckets";

export const EMAIL_PROVIDERS = ["gmail", "outlook", "imap"] as const;

export type EmailProvider = (typeof EMAIL_PROVIDERS)[number];

export const DEFAULT_TRIAGE_CRON = "0 */2 * * *";
export const DEFAULT_IMAP_PORT = 993;
export const DEFAULT_IMAP_DRAFTS_MAILBOX = "Drafts";
export const DEFAULT_SENT_SAMPLE_SIZE = 8;
export const DEFAULT_MAX_THREADS = 20;

export type EmailTriageConfig = {
  readonly provider: EmailProvider | null;
  readonly cron: string;
  readonly buckets: readonly string[];
  readonly sentSampleSize: number;
  readonly maxThreads: number;
  readonly pushWebhookSecret?: string;
  readonly slackConnectUid?: string;
  readonly slackChannelId?: string;
  readonly gmail: {
    readonly connectUid?: string;
    readonly user?: string;
  };
  readonly outlook: {
    readonly connectUid?: string;
  };
  readonly imap: {
    readonly host?: string;
    readonly port: number;
    readonly user?: string;
    readonly password?: string;
    readonly draftsMailbox: string;
    readonly inboxMailbox: string;
    readonly sentMailbox: string;
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

const parseImapPort = (value: string | undefined): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isInteger(parsed) && parsed > 0 && parsed < 65_536) {
    return parsed;
  }
  return DEFAULT_IMAP_PORT;
};

export function resolveEmailProvider(
  env: NodeJS.Dict<string>,
): EmailProvider | null {
  const forced = optional(env.EMAIL_PROVIDER)?.toLowerCase();
  if (forced) {
    if (forced === "gmail" || forced === "outlook" || forced === "imap") {
      return forced;
    }
    return null;
  }

  if (optional(env.EMAIL_TRIAGE_GOOGLE_CONNECT_UID)) {
    return "gmail";
  }
  if (optional(env.EMAIL_TRIAGE_MICROSOFT_CONNECT_UID)) {
    return "outlook";
  }
  if (
    optional(env.IMAP_HOST) &&
    optional(env.IMAP_USER) &&
    optional(env.IMAP_PASSWORD)
  ) {
    return "imap";
  }
  return null;
}

export function loadEmailTriageConfig(
  env: NodeJS.Dict<string> = process.env,
): EmailTriageConfig {
  return {
    provider: resolveEmailProvider(env),
    cron: optional(env.EMAIL_TRIAGE_CRON) ?? DEFAULT_TRIAGE_CRON,
    buckets: parseTriageBuckets(env.TRIAGE_BUCKETS),
    sentSampleSize: parsePositiveInteger(
      env.EMAIL_SENT_SAMPLE_SIZE,
      DEFAULT_SENT_SAMPLE_SIZE,
    ),
    maxThreads: parsePositiveInteger(env.EMAIL_MAX_THREADS, DEFAULT_MAX_THREADS),
    pushWebhookSecret: optional(env.EMAIL_PUSH_WEBHOOK_SECRET),
    slackConnectUid: optional(env.EMAIL_TRIAGE_SLACK_CONNECT_UID),
    slackChannelId: optional(env.EMAIL_TRIAGE_SLACK_CHANNEL_ID),
    gmail: {
      connectUid: optional(env.EMAIL_TRIAGE_GOOGLE_CONNECT_UID),
      user: optional(env.GMAIL_USER),
    },
    outlook: {
      connectUid: optional(env.EMAIL_TRIAGE_MICROSOFT_CONNECT_UID),
    },
    imap: {
      host: optional(env.IMAP_HOST),
      port: parseImapPort(env.IMAP_PORT),
      user: optional(env.IMAP_USER),
      password: optional(env.IMAP_PASSWORD),
      draftsMailbox:
        optional(env.IMAP_DRAFTS_MAILBOX) ?? DEFAULT_IMAP_DRAFTS_MAILBOX,
      inboxMailbox: optional(env.IMAP_INBOX_MAILBOX) ?? "INBOX",
      sentMailbox: optional(env.IMAP_SENT_MAILBOX) ?? "Sent",
    },
  };
}

export const emailTriageConfig = loadEmailTriageConfig();

export function isSlackNotifyConfigured(
  config: EmailTriageConfig = emailTriageConfig,
): boolean {
  return Boolean(config.slackConnectUid && config.slackChannelId);
}

export function missingEmailProviderEnv(
  config: EmailTriageConfig = emailTriageConfig,
): string[] {
  if (config.provider === "gmail") {
    return config.gmail.connectUid ? [] : ["EMAIL_TRIAGE_GOOGLE_CONNECT_UID"];
  }

  if (config.provider === "outlook") {
    return config.outlook.connectUid
      ? []
      : ["EMAIL_TRIAGE_MICROSOFT_CONNECT_UID"];
  }

  if (config.provider === "imap") {
    const missing: string[] = [];
    if (!config.imap.host) {
      missing.push("IMAP_HOST");
    }
    if (!config.imap.user) {
      missing.push("IMAP_USER");
    }
    if (!config.imap.password) {
      missing.push("IMAP_PASSWORD");
    }
    return missing;
  }

  return ["EMAIL_PROVIDER"];
}
