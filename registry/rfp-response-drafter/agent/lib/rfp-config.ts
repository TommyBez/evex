export const MAILBOX_PROVIDERS = ["gmail", "outlook"] as const;
export const WRITEBACK_TARGETS = ["drive", "mailbox", "both"] as const;

export type MailboxProvider = (typeof MAILBOX_PROVIDERS)[number];
export type WritebackTarget = (typeof WRITEBACK_TARGETS)[number];

export const DEFAULT_DIGEST_CRON = "0 8 * * 1-5";
export const DEFAULT_STORE_PATH = ".data/rfp-response-store.json";
export const DEFAULT_DIGEST_SUBJECT = "RFP deadline digest";
export const DEFAULT_SANDBOX_ROOTS = ["rfps", "knowledge-packs"] as const;

export type RfpResponseConfig = {
  readonly mailboxProvider: MailboxProvider | null;
  readonly writeback: WritebackTarget | null;
  readonly cron: string;
  readonly storePath: string;
  readonly slackConnectUid?: string;
  readonly slackChannelId?: string;
  readonly google: {
    readonly connectUid?: string;
    readonly driveFolderId?: string;
    readonly gmailUser?: string;
  };
  readonly outlook: {
    readonly connectUid?: string;
  };
  readonly sandboxRoots: readonly string[];
  readonly draftTo?: string;
  readonly digestSubject: string;
};

const optional = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export function resolveMailboxProvider(
  env: NodeJS.Dict<string>,
): MailboxProvider | null {
  const forced = optional(env.RFP_RESPONSE_MAILBOX_PROVIDER)?.toLowerCase();
  if (forced) {
    if (forced === "gmail" || forced === "outlook") {
      return forced;
    }
    return null;
  }

  if (optional(env.RFP_RESPONSE_GOOGLE_CONNECT_UID)) {
    return "gmail";
  }
  if (optional(env.RFP_RESPONSE_MICROSOFT_CONNECT_UID)) {
    return "outlook";
  }
  return null;
}

export function resolveWritebackTarget(
  env: NodeJS.Dict<string>,
): WritebackTarget | null {
  const forced = optional(env.RFP_RESPONSE_WRITEBACK)?.toLowerCase();
  if (forced) {
    if (forced === "drive" || forced === "mailbox" || forced === "both") {
      return forced;
    }
    return null;
  }

  const drive = Boolean(optional(env.RFP_RESPONSE_GOOGLE_CONNECT_UID));
  const mailboxReady =
    resolveMailboxProvider(env) !== null &&
    Boolean(optional(env.RFP_RESPONSE_DRAFT_TO));
  if (drive && mailboxReady) {
    return "both";
  }
  if (drive) {
    return "drive";
  }
  if (mailboxReady) {
    return "mailbox";
  }
  return null;
}

export function sandboxRootsFromEnv(
  envValue: string | undefined,
): readonly string[] {
  if (envValue === undefined || envValue.trim().length === 0) {
    return [...DEFAULT_SANDBOX_ROOTS];
  }

  const roots: string[] = [];
  const seen = new Set<string>();
  for (const part of envValue.split(",")) {
    const root = part.trim().replaceAll("\\", "/").replace(/^\/+|\/+$/g, "");
    if (root.length === 0 || root.includes("..") || seen.has(root)) {
      continue;
    }
    roots.push(root);
    seen.add(root);
  }
  return roots.length > 0 ? roots : [...DEFAULT_SANDBOX_ROOTS];
}

export function loadRfpResponseConfig(
  env: NodeJS.Dict<string> = process.env,
): RfpResponseConfig {
  return {
    mailboxProvider: resolveMailboxProvider(env),
    writeback: resolveWritebackTarget(env),
    cron: optional(env.RFP_RESPONSE_CRON) ?? DEFAULT_DIGEST_CRON,
    storePath: optional(env.RFP_RESPONSE_STORE_PATH) ?? DEFAULT_STORE_PATH,
    slackConnectUid: optional(env.RFP_RESPONSE_SLACK_CONNECT_UID),
    slackChannelId: optional(env.RFP_RESPONSE_SLACK_CHANNEL_ID),
    google: {
      connectUid: optional(env.RFP_RESPONSE_GOOGLE_CONNECT_UID),
      driveFolderId: optional(env.RFP_RESPONSE_DRIVE_FOLDER_ID),
      gmailUser: optional(env.RFP_RESPONSE_GMAIL_USER),
    },
    outlook: {
      connectUid: optional(env.RFP_RESPONSE_MICROSOFT_CONNECT_UID),
    },
    sandboxRoots: sandboxRootsFromEnv(env.RFP_RESPONSE_SANDBOX_ROOTS),
    draftTo: optional(env.RFP_RESPONSE_DRAFT_TO),
    digestSubject: optional(env.RFP_RESPONSE_DIGEST_SUBJECT) ?? DEFAULT_DIGEST_SUBJECT,
  };
}

export const rfpResponseConfig = loadRfpResponseConfig();

export const isSlackConfigured = (
  config: RfpResponseConfig = rfpResponseConfig,
): boolean => Boolean(config.slackConnectUid && config.slackChannelId);

export const isDriveConfigured = (
  config: RfpResponseConfig = rfpResponseConfig,
): boolean => Boolean(config.google.connectUid);

export const isMailboxConfigured = (
  config: RfpResponseConfig = rfpResponseConfig,
): boolean => missingMailboxEnv(config).length === 0;

export function missingMailboxEnv(
  config: RfpResponseConfig = rfpResponseConfig,
): readonly string[] {
  if (!config.mailboxProvider) {
    return [];
  }
  const missing: string[] = [];
  if (config.mailboxProvider === "gmail" && !config.google.connectUid) {
    missing.push("RFP_RESPONSE_GOOGLE_CONNECT_UID");
  }
  if (config.mailboxProvider === "outlook" && !config.outlook.connectUid) {
    missing.push("RFP_RESPONSE_MICROSOFT_CONNECT_UID");
  }
  if (!config.draftTo) {
    missing.push("RFP_RESPONSE_DRAFT_TO");
  }
  return missing;
}

export function missingWritebackEnv(
  config: RfpResponseConfig = rfpResponseConfig,
): readonly string[] {
  if (config.writeback === "drive" || config.writeback === "both") {
    if (!config.google.connectUid) {
      return ["RFP_RESPONSE_GOOGLE_CONNECT_UID"];
    }
  }
  if (config.writeback === "mailbox") {
    const mailboxMissing = missingMailboxEnv(config);
    return mailboxMissing.length > 0
      ? mailboxMissing
      : [];
  }
  if (!config.writeback) {
    return ["RFP_RESPONSE_WRITEBACK"];
  }
  return [];
}

export const missingDeliveryEnv = (
  config: RfpResponseConfig = rfpResponseConfig,
): readonly string[] => {
  if (isSlackConfigured(config)) {
    return [];
  }
  const missing: string[] = [];
  if (!config.slackConnectUid) {
    missing.push("RFP_RESPONSE_SLACK_CONNECT_UID");
  }
  if (!config.slackChannelId) {
    missing.push("RFP_RESPONSE_SLACK_CHANNEL_ID");
  }
  return missing;
};

export const missingRfpConfig = (
  config: RfpResponseConfig = rfpResponseConfig,
): readonly string[] => [
  ...missingDeliveryEnv(config),
  ...missingWritebackEnv(config),
];
