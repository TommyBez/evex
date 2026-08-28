import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const DEFAULT_RATE_LIMIT_PREFIX = "evex:github-ci-explainer";
const DEFAULT_CHECK_COOLDOWN_SECONDS = 900;
const DEFAULT_PRIVATE_REPO_DAILY_LIMIT = 50;
const DEFAULT_PUBLIC_REPO_DAILY_LIMIT = 20;
const PUBLICATION_TTL_SECONDS = 86_400;
const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

type FailureMode = "public_closed" | "closed" | "open";
type RateLimitReason =
  | "check_cooldown"
  | "repo_daily_limit"
  | "rate_limit_unavailable";

type RateLimitConfig = {
  checkCooldownSeconds: number;
  enabled: boolean;
  failureMode: FailureMode;
  prefix: string;
  privateRepoDailyLimit: number;
  publicRepoDailyLimit: number;
};

type RateLimiter = ReturnType<typeof createRateLimiter>;
type RateLimiterBundle = ReturnType<typeof createRateLimiterBundle>;

export type CiExplainerRateLimitInput = {
  checkRunId: number;
  headSha: string | null | undefined;
  installationId: number | null | undefined;
  isPrivateRepository: boolean;
  repositoryId: number;
};

export type CiPublicationClaimInput = {
  headSha: string | null | undefined;
  installationId: number | null | undefined;
  pullRequestNumber: number | null | undefined;
  repositoryId: number;
  toolCallId: string;
};

export type RateLimitDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason: RateLimitReason;
      resetAt?: number;
      retryAfterSeconds?: number;
    };

let cachedRedis: Redis | null = null;
let cachedLimiters: RateLimiterBundle | null = null;

export async function checkCiExplainerRateLimit(
  input: CiExplainerRateLimitInput,
): Promise<RateLimitDecision> {
  const config = readRateLimitConfig();

  if (!config.enabled) {
    return { allowed: true };
  }

  if (!hasUpstashEnvironment()) {
    return unavailableDecision(config, input.isPrivateRepository);
  }

  try {
    if (!input.isPrivateRepository && config.publicRepoDailyLimit <= 0) {
      return { allowed: false, reason: "repo_daily_limit" };
    }

    if (input.isPrivateRepository && config.privateRepoDailyLimit <= 0) {
      return { allowed: false, reason: "repo_daily_limit" };
    }

    const limiters = getRateLimiters(config);

    // Short-circuit: a per-check cooldown must not consume the daily quota.
    const checkDecision = await checkLimiter(
      limiters.check,
      identifierForCheck(input),
      "check_cooldown",
    );
    if (!checkDecision.allowed) {
      return checkDecision;
    }

    return await checkLimiter(
      input.isPrivateRepository
        ? limiters.privateRepoDaily
        : limiters.publicRepoDaily,
      identifierForRepoDaily(input),
      "repo_daily_limit",
    );
  } catch {
    return unavailableDecision(config, input.isPrivateRepository);
  }
}

function publicationKey(input: CiPublicationClaimInput): string {
  const config = readRateLimitConfig();
  return `${config.prefix}:ci-publish:${hashParts([
    "ci-publish",
    input.installationId ?? "unknown-installation",
    input.repositoryId,
    input.pullRequestNumber ?? "no-pr",
    input.headSha ?? "unknown-sha",
    input.toolCallId,
  ])}`;
}

/**
 * Idempotency claim so webhook retries and duplicate tool calls do not post
 * multiple comments for the same failed check.
 */
export async function claimCiPublication(
  input: CiPublicationClaimInput,
): Promise<boolean> {
  if (!hasUpstashEnvironment()) {
    return true;
  }

  try {
    const redis = getRedis();
    const result = await redis.set(publicationKey(input), "1", {
      ex: PUBLICATION_TTL_SECONDS,
      nx: true,
    });

    return result === "OK";
  } catch {
    return true;
  }
}

export async function releaseCiPublication(
  input: CiPublicationClaimInput,
): Promise<void> {
  if (!hasUpstashEnvironment()) {
    return;
  }

  try {
    await getRedis().del(publicationKey(input));
  } catch {
    // Best-effort release; the TTL still expires the claim.
  }
}

/**
 * Claim keyed only by check run so channel-side commit comments (no model
 * toolCallId) stay one-shot across webhook retries.
 */
export async function claimCheckRunHandled(input: {
  checkRunId: number;
  installationId: number | null | undefined;
  repositoryId: number;
}): Promise<boolean> {
  if (!hasUpstashEnvironment()) {
    return true;
  }

  const config = readRateLimitConfig();
  const key = `${config.prefix}:check-handled:${hashParts([
    "check-handled",
    input.installationId ?? "unknown-installation",
    input.repositoryId,
    input.checkRunId,
  ])}`;

  try {
    const result = await getRedis().set(key, "1", {
      ex: PUBLICATION_TTL_SECONDS,
      nx: true,
    });
    return result === "OK";
  } catch {
    return true;
  }
}

function checkLimiter(
  limiter: RateLimiter,
  identifier: string,
  reason: RateLimitReason,
): Promise<RateLimitDecision> {
  return limiter.limit(identifier).then((result) => {
    void result.pending.catch(() => undefined);

    if (result.success) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason,
      resetAt: result.reset,
      retryAfterSeconds: retryAfterSeconds(result.reset),
    };
  });
}

function createRateLimiter(
  redis: Redis,
  limit: number,
  windowSeconds: number,
  prefix: string,
) {
  return new Ratelimit({
    analytics: false,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    prefix,
    redis,
  });
}

function createRateLimiterBundle(config: RateLimitConfig) {
  const redis = getRedis();

  return {
    configKey: JSON.stringify(config),
    check: createRateLimiter(
      redis,
      1,
      config.checkCooldownSeconds,
      `${config.prefix}:check`,
    ),
    privateRepoDaily: createRateLimiter(
      redis,
      Math.max(1, config.privateRepoDailyLimit),
      86_400,
      `${config.prefix}:repo-private-day`,
    ),
    publicRepoDaily: createRateLimiter(
      redis,
      Math.max(1, config.publicRepoDailyLimit),
      86_400,
      `${config.prefix}:repo-public-day`,
    ),
  };
}

function getRateLimiters(config: RateLimitConfig) {
  const configKey = JSON.stringify(config);
  if (cachedLimiters?.configKey === configKey) {
    return cachedLimiters;
  }

  cachedLimiters = createRateLimiterBundle(config);
  return cachedLimiters;
}

function getRedis() {
  if (cachedRedis) {
    return cachedRedis;
  }

  cachedRedis = Redis.fromEnv();
  return cachedRedis;
}

function hasUpstashEnvironment() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function unavailableDecision(
  config: RateLimitConfig,
  isPrivateRepository: boolean,
): RateLimitDecision {
  if (config.failureMode === "open") {
    return { allowed: true };
  }

  if (config.failureMode === "closed") {
    return { allowed: false, reason: "rate_limit_unavailable" };
  }

  return isPrivateRepository
    ? { allowed: true }
    : { allowed: false, reason: "rate_limit_unavailable" };
}

function identifierForCheck(input: CiExplainerRateLimitInput) {
  return hashParts([
    "check",
    input.installationId ?? "unknown-installation",
    input.repositoryId,
    input.checkRunId,
    input.headSha ?? "unknown-sha",
  ]);
}

function identifierForRepoDaily(input: CiExplainerRateLimitInput) {
  return hashParts([
    "repo-day",
    input.installationId ?? "unknown-installation",
    input.repositoryId,
    input.isPrivateRepository ? "private" : "public",
  ]);
}

function hashParts(parts: readonly (number | string)[]) {
  return createHash("sha256").update(parts.map(String).join(":")).digest("hex");
}

function retryAfterSeconds(resetAt: number) {
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
}

function readRateLimitConfig(): RateLimitConfig {
  return {
    checkCooldownSeconds: readPositiveInteger(
      process.env.CI_EXPLAINER_CHECK_COOLDOWN_SECONDS,
      DEFAULT_CHECK_COOLDOWN_SECONDS,
    ),
    enabled: readBoolean(process.env.CI_EXPLAINER_RATE_LIMIT_ENABLED, true),
    failureMode: readFailureMode(
      process.env.CI_EXPLAINER_RATE_LIMIT_FAILURE_MODE,
    ),
    prefix:
      process.env.CI_EXPLAINER_RATE_LIMIT_PREFIX?.trim() ||
      DEFAULT_RATE_LIMIT_PREFIX,
    privateRepoDailyLimit: readNonNegativeInteger(
      process.env.CI_EXPLAINER_PRIVATE_REPO_DAILY_LIMIT,
      DEFAULT_PRIVATE_REPO_DAILY_LIMIT,
    ),
    publicRepoDailyLimit: readNonNegativeInteger(
      process.env.CI_EXPLAINER_PUBLIC_REPO_DAILY_LIMIT,
      DEFAULT_PUBLIC_REPO_DAILY_LIMIT,
    ),
  };
}

function readBoolean(value: string | undefined, fallback: boolean) {
  if (!value) {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();
  if (TRUE_VALUES.has(normalizedValue)) {
    return true;
  }

  if (FALSE_VALUES.has(normalizedValue)) {
    return false;
  }

  return fallback;
}

function readFailureMode(value: string | undefined): FailureMode {
  if (value === "closed" || value === "open" || value === "public_closed") {
    return value;
  }

  return "public_closed";
}

function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsedValue = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function readNonNegativeInteger(value: string | undefined, fallback: number) {
  const parsedValue = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsedValue) && parsedValue >= 0
    ? parsedValue
    : fallback;
}
