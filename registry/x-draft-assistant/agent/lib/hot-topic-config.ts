export type HotTopicConfig = {
  readonly handles: readonly string[];
  readonly dailyCron: string;
  readonly lookbackHours: number;
  readonly maxTweetsPerProfile: number;
  readonly maxHotTopics: number;
  readonly searchMaxResults: number;
  readonly searchMode: "turbo" | "basic" | "advanced";
  readonly draft: {
    readonly count: number;
    readonly madeWithAi: boolean;
    readonly tag?: string;
    readonly socialSetId?: string;
  };
};

const DEFAULT_MAX_TWEETS_PER_PROFILE = 20;
const DEFAULT_MAX_HOT_TOPICS = 5;
const DEFAULT_SEARCH_MAX_RESULTS = 5;
const DEFAULT_SEARCH_MODE = "basic";
const DEFAULT_DAILY_CRON = "0 8 * * *";
const DEFAULT_LOOKBACK_HOURS = 24;
const DEFAULT_DRAFT_COUNT = 3;
const DEFAULT_DRAFT_MADE_WITH_AI = true;

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

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  const trimmed = value?.trim().toLowerCase();
  if (trimmed === "true" || trimmed === "1" || trimmed === "yes" || trimmed === "on") {
    return true;
  }
  if (trimmed === "false" || trimmed === "0" || trimmed === "no" || trimmed === "off") {
    return false;
  }
  return fallback;
};

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
  draft: {
    count: parsePositiveInteger(
      process.env.X_HOT_TOPIC_DRAFT_COUNT,
      DEFAULT_DRAFT_COUNT,
    ),
    madeWithAi: parseBoolean(
      process.env.X_HOT_TOPIC_DRAFT_MADE_WITH_AI,
      DEFAULT_DRAFT_MADE_WITH_AI,
    ),
    tag: optional(process.env.X_HOT_TOPIC_DRAFT_TAG),
    socialSetId: optional(process.env.TYPEFULLY_SOCIAL_SET_ID),
  },
} satisfies HotTopicConfig;
