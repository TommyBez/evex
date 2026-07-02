export type PseoConfig = {
  readonly repo: string | undefined;
  readonly targetDir: string;
  readonly allowedPathPrefixes: readonly string[];
  readonly weeklyCron: string;
  readonly maxPagesPerRun: number;
  readonly minSearchVolume: number;
  readonly locationCode: number;
  readonly languageCode: string;
  readonly searchMode: "turbo" | "basic" | "advanced";
  readonly searchMaxResults: number;
};

const DEFAULT_TARGET_DIR = "content/programmatic";
const DEFAULT_WEEKLY_CRON = "0 7 * * 1";
const DEFAULT_MAX_PAGES_PER_RUN = 20;
const DEFAULT_MIN_SEARCH_VOLUME = 30;
const DEFAULT_LOCATION_CODE = 2840;
const DEFAULT_LANGUAGE_CODE = "en";
const DEFAULT_SEARCH_MODE = "basic";
const DEFAULT_SEARCH_MAX_RESULTS = 5;

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

const normalizePathPrefix = (prefix: string): string =>
  prefix.replace(/^\/+/, "").replace(/\/+$/, "");

const targetDir = normalizePathPrefix(
  optional(process.env.PSEO_TARGET_DIR) ?? DEFAULT_TARGET_DIR,
);

export const pseoConfig = {
  repo: optional(process.env.PSEO_GITHUB_REPO),
  targetDir,
  allowedPathPrefixes: [
    targetDir,
    ...compactCsv(process.env.PSEO_ALLOWED_PATH_PREFIXES).map(normalizePathPrefix),
  ],
  weeklyCron: optional(process.env.PSEO_WEEKLY_CRON) ?? DEFAULT_WEEKLY_CRON,
  maxPagesPerRun: parsePositiveInteger(
    process.env.PSEO_MAX_PAGES_PER_RUN,
    DEFAULT_MAX_PAGES_PER_RUN,
  ),
  minSearchVolume: parsePositiveInteger(
    process.env.PSEO_MIN_SEARCH_VOLUME,
    DEFAULT_MIN_SEARCH_VOLUME,
  ),
  locationCode: parsePositiveInteger(
    process.env.PSEO_LOCATION_CODE,
    DEFAULT_LOCATION_CODE,
  ),
  languageCode: optional(process.env.PSEO_LANGUAGE_CODE) ?? DEFAULT_LANGUAGE_CODE,
  searchMode: parseSearchMode(process.env.PSEO_SEARCH_MODE),
  searchMaxResults: parsePositiveInteger(
    process.env.PSEO_SEARCH_MAX_RESULTS,
    DEFAULT_SEARCH_MAX_RESULTS,
  ),
} satisfies PseoConfig;
