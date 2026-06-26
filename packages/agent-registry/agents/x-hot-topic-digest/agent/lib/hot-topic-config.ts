export type HotTopicConfig = {
  readonly handles: readonly string[];
  readonly dailyCron: string;
  readonly lookbackHours: number;
  readonly maxTweetsPerProfile: number;
  readonly maxHotTopics: number;
  readonly searchMaxResults: number;
  readonly searchMode: "turbo" | "basic" | "advanced";
  readonly digest: {
    readonly from?: string;
    readonly to: readonly string[];
    readonly subject: string;
  };
};

const DEFAULT_MAX_TWEETS_PER_PROFILE = 20;
const DEFAULT_MAX_HOT_TOPICS = 5;
const DEFAULT_SEARCH_MAX_RESULTS = 5;
const DEFAULT_SEARCH_MODE = "basic";
const DEFAULT_DAILY_CRON = "0 8 * * *";
const DEFAULT_LOOKBACK_HOURS = 24;
const DEFAULT_SUBJECT = "X Hot Topic Digest";

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

const parseSearchMode = (value: string | undefined): "turbo" | "basic" | "advanced" => {
  const trimmed = value?.trim().toLowerCase();
  if (trimmed === "turbo" || trimmed === "basic" || trimmed === "advanced") {
    return trimmed;
  }
  return DEFAULT_SEARCH_MODE;
};

const parseEmailList = (value: string | undefined): string[] => compactCsv(value);

const toRfc3339Utc = (date: Date): string =>
  date.toISOString().replace(/\.\d{3}Z$/, "Z");

export const getLookbackStartTime = (now: Date = new Date()): string =>
  toRfc3339Utc(new Date(now.getTime() - hotTopicConfig.lookbackHours * 60 * 60 * 1000));

export const hotTopicConfig = {
  handles: compactCsv(process.env.X_HOT_TOPIC_HANDLES),
  dailyCron: optional(process.env.X_HOT_TOPIC_DAILY_CRON) ?? DEFAULT_DAILY_CRON,
  lookbackHours: parsePositiveInteger(
    process.env.X_HOT_TOPIC_LOOKBACK_HOURS,
    DEFAULT_LOOKBACK_HOURS,
  ),
  maxTweetsPerProfile: parsePositiveInteger(
    process.env.X_HOT_TOPIC_MAX_TWEETS_PER_PROFILE,
    DEFAULT_MAX_TWEETS_PER_PROFILE,
  ),
  maxHotTopics: parsePositiveInteger(
    process.env.X_HOT_TOPIC_MAX_TOPICS,
    DEFAULT_MAX_HOT_TOPICS,
  ),
  searchMaxResults: parsePositiveInteger(
    process.env.X_HOT_TOPIC_SEARCH_MAX_RESULTS,
    DEFAULT_SEARCH_MAX_RESULTS,
  ),
  searchMode: parseSearchMode(process.env.X_HOT_TOPIC_SEARCH_MODE),
  digest: {
    from: optional(process.env.X_HOT_TOPIC_DIGEST_FROM),
    to: parseEmailList(process.env.X_HOT_TOPIC_DIGEST_TO),
    subject: optional(process.env.X_HOT_TOPIC_DIGEST_SUBJECT) ?? DEFAULT_SUBJECT,
  },
} satisfies HotTopicConfig;
