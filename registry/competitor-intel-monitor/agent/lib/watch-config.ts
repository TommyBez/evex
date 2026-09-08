import { readFileSync } from "node:fs";

export type AlertThresholds = {
  readonly minScore: number;
  readonly minChangedChars: number;
};

export type WatchConfig = {
  readonly urls: readonly string[];
  readonly cron: string;
  readonly alert: AlertThresholds;
  readonly storePath: string;
  readonly userAgent: string;
  readonly slackConnectUid?: string;
  readonly slackChannelId?: string;
  readonly digest: {
    readonly from?: string;
    readonly to: readonly string[];
    readonly subject: string;
  };
};

export const DEFAULT_CRON = "0 8 * * *";
export const DEFAULT_ALERT_MIN_SCORE = 25;
export const DEFAULT_ALERT_MIN_CHANGED_CHARS = 40;
export const DEFAULT_STORE_PATH = ".data/competitor-intel-store.json";
export const DEFAULT_USER_AGENT = "EveCompetitorIntelMonitor/1.0";
export const DEFAULT_DIGEST_SUBJECT = "Competitor intel digest";

const HTTPS_URL = /^https:\/\//i;

const compactCsv = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const optional = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseScore = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(100, Math.max(0, parsed));
};

export const isHttpsUrl = (value: string): boolean => {
  if (!HTTPS_URL.test(value)) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const uniqueHttpsUrls = (values: readonly string[]): string[] => {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!isHttpsUrl(trimmed) || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    urls.push(trimmed);
  }
  return urls;
};

type FileConfig = {
  readonly urls: readonly string[];
  readonly alert?: Partial<AlertThresholds>;
};

const parseJsonConfig = (raw: string): FileConfig | null => {
  try {
    const parsed = JSON.parse(raw) as {
      urls?: unknown;
      alert?: { minScore?: unknown; minChangedChars?: unknown };
    };
    const urls = Array.isArray(parsed.urls)
      ? parsed.urls.filter((item): item is string => typeof item === "string")
      : [];
    const alert: { minScore?: number; minChangedChars?: number } = {};
    if (typeof parsed.alert?.minScore === "number") {
      alert.minScore = Math.min(100, Math.max(0, Math.round(parsed.alert.minScore)));
    }
    if (typeof parsed.alert?.minChangedChars === "number" && parsed.alert.minChangedChars > 0) {
      alert.minChangedChars = Math.round(parsed.alert.minChangedChars);
    }
    return { urls, alert };
  } catch {
    return null;
  }
};

const parseTextUrlList = (raw: string): FileConfig => ({
  urls: raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#")),
});

export const parseWatchConfigFile = (raw: string): FileConfig => {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    return parseJsonConfig(trimmed) ?? parseTextUrlList(raw);
  }
  return parseTextUrlList(raw);
};

const readConfigFile = (filePath: string | undefined): FileConfig => {
  if (!filePath) {
    return { urls: [] };
  }
  try {
    return parseWatchConfigFile(readFileSync(filePath, "utf8"));
  } catch {
    return { urls: [] };
  }
};

export const loadWatchConfig = (
  env: NodeJS.ProcessEnv = process.env,
  readFile = readConfigFile,
): WatchConfig => {
  const fileConfig = readFile(optional(env.COMPETITOR_INTEL_URLS_FILE));
  const urls = uniqueHttpsUrls([...compactCsv(env.COMPETITOR_INTEL_URLS), ...fileConfig.urls]);

  return {
    urls,
    cron: optional(env.COMPETITOR_INTEL_CRON) ?? DEFAULT_CRON,
    alert: {
      minScore: parseScore(
        env.COMPETITOR_INTEL_ALERT_MIN_SCORE,
        fileConfig.alert?.minScore ?? DEFAULT_ALERT_MIN_SCORE,
      ),
      minChangedChars: parsePositiveInteger(
        env.COMPETITOR_INTEL_ALERT_MIN_CHANGED_CHARS,
        fileConfig.alert?.minChangedChars ?? DEFAULT_ALERT_MIN_CHANGED_CHARS,
      ),
    },
    storePath: optional(env.COMPETITOR_INTEL_STORE_PATH) ?? DEFAULT_STORE_PATH,
    userAgent: optional(env.COMPETITOR_INTEL_USER_AGENT) ?? DEFAULT_USER_AGENT,
    slackConnectUid: optional(env.COMPETITOR_INTEL_SLACK_CONNECT_UID),
    slackChannelId: optional(env.COMPETITOR_INTEL_SLACK_CHANNEL_ID),
    digest: {
      from: optional(env.COMPETITOR_INTEL_DIGEST_FROM),
      to: compactCsv(env.COMPETITOR_INTEL_DIGEST_TO),
      subject: optional(env.COMPETITOR_INTEL_DIGEST_SUBJECT) ?? DEFAULT_DIGEST_SUBJECT,
    },
  };
};

export const watchConfig = loadWatchConfig();

export const isSlackDeliveryConfigured = (
  config: WatchConfig = watchConfig,
): boolean => Boolean(config.slackConnectUid && config.slackChannelId);

export const missingWatchConfig = (
  config: WatchConfig = watchConfig,
): readonly string[] => {
  const missing: string[] = [];
  if (config.urls.length === 0) {
    missing.push("COMPETITOR_INTEL_URLS");
  }
  const hasSlack = isSlackDeliveryConfigured(config);
  const hasEmail = Boolean(config.digest.from && config.digest.to.length > 0);
  if (!hasSlack && !hasEmail) {
    missing.push("COMPETITOR_INTEL_SLACK_CONNECT_UID");
    missing.push("COMPETITOR_INTEL_SLACK_CHANNEL_ID");
    missing.push("COMPETITOR_INTEL_DIGEST_FROM");
    missing.push("COMPETITOR_INTEL_DIGEST_TO");
  }
  if (hasEmail && !process.env.RESEND_API_KEY?.trim()) {
    missing.push("RESEND_API_KEY");
  }
  return missing;
};
