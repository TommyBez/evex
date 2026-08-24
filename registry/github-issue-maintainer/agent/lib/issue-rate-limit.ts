import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const DEFAULT_RATE_LIMIT_PREFIX = "evex:github-issue-maintainer";
const DEFAULT_ISSUE_COOLDOWN_SECONDS = 900;
const DEFAULT_USER_ISSUE_COOLDOWN_SECONDS = 1800;
const DEFAULT_PRIVATE_REPO_DAILY_LIMIT = 50;
const DEFAULT_PUBLIC_REPO_DAILY_LIMIT = 15;
const DEFAULT_COOLDOWN_REPLY_SECONDS = 900;
const TRIAGE_PUBLICATION_TTL_SECONDS = 86_400;
const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

type FailureMode = "public_closed" | "closed" | "open";
type RateLimitReason =
  | "user_issue_cooldown"
  | "issue_cooldown"
  | "repo_daily_limit"
  | "rate_limit_unavailable";

type RateLimitConfig = {
  cooldownReply: boolean;
  cooldownReplySeconds: number;
  enabled: boolean;
  failureMode: FailureMode;
  issueCooldownSeconds: number;
  prefix: string;
  privateRepoDailyLimit: number;
  publicRepoDailyLimit: number;
  userIssueCooldownSeconds: number;
};

type RateLimiter = ReturnType<typeof createRateLimiter>;
type RateLimiterBundle = ReturnType<typeof createRateLimiterBundle>;

export type IssueTriageRateLimitInput = {
  installationId: number | null | undefined;
  isPrivateRepository: boolean;
  issueNumber: number;
  repositoryId: number;
  senderId: number | null | undefined;
  senderLogin: string | null | undefined;
};

export type CooldownReplyRateLimitInput = {
  installationId: number | null | undefined;
  issueNumber: number;
  repositoryId: number;
};

export type TriagePublicationClaimInput = {
  installationId: number | null | undefined;
  issueNumber: number;
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

export async function checkIssueTriageRateLimit(
  input: IssueTriageRateLimitInput,
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

    // Short-circuit: a cooldown denial must not consume the repo daily quota.
    const userDecision = await checkLimiter(
      limiters.userIssue,
      identifierForUserIssue(input),
      "user_issue_cooldown",
    );
    if (!userDecision.allowed) {
      return userDecision;
    }

    const issueDecision = await checkLimiter(
      limiters.issue,
      identifierForIssue(input),
      "issue_cooldown",
    );
    if (!issueDecision.allowed) {
      return issueDecision;
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

export async function shouldPostCooldownReply(
  input: CooldownReplyRateLimitInput,
): Promise<boolean> {
  const config = readRateLimitConfig();

  if (!(config.enabled && config.cooldownReply && hasUpstashEnvironment())) {
    return false;
  }

  try {
    const { cooldownReply } = getRateLimiters(config);
    const decision = await checkLimiter(
      cooldownReply,
      identifierForCooldownReply(input),
      "issue_cooldown",
    );

    return decision.allowed;
  } catch {
    return false;
  }
}

function triagePublicationKey(input: TriagePublicationClaimInput): string {
  const config = readRateLimitConfig();
  return `${config.prefix}:triage-publish:${hashParts([
    "triage-publish",
    input.installationId ?? "unknown-installation",
    input.repositoryId,
    input.issueNumber,
    input.toolCallId,
  ])}`;
}

export async function claimTriagePublication(
  input: TriagePublicationClaimInput,
): Promise<boolean> {
  if (!hasUpstashEnvironment()) {
    return true;
  }

  try {
    const redis = getRedis();
    const result = await redis.set(triagePublicationKey(input), "1", {
      ex: TRIAGE_PUBLICATION_TTL_SECONDS,
      nx: true,
    });

    return result === "OK";
  } catch {
    return true;
  }
}

export async function releaseTriagePublication(
  input: TriagePublicationClaimInput,
): Promise<void> {
  if (!hasUpstashEnvironment()) {
    return;
  }

  try {
    await getRedis().del(triagePublicationKey(input));
  } catch {
    // Best-effort release; the TTL still expires the claim.
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
    cooldownReply: createRateLimiter(
      redis,
      1,
      config.cooldownReplySeconds,
      `${config.prefix}:cooldown-reply`,
    ),
    issue: createRateLimiter(
      redis,
      1,
      config.issueCooldownSeconds,
      `${config.prefix}:issue`,
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
    userIssue: createRateLimiter(
      redis,
      1,
      config.userIssueCooldownSeconds,
      `${config.prefix}:user-issue`,
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

function identifierForUserIssue(input: IssueTriageRateLimitInput) {
  return hashParts([
    "user-issue",
    input.installationId ?? "unknown-installation",
    input.repositoryId,
    input.issueNumber,
    input.senderId ?? input.senderLogin ?? "unknown-sender",
  ]);
}

function identifierForIssue(input: IssueTriageRateLimitInput) {
  return hashParts([
    "issue",
    input.installationId ?? "unknown-installation",
    input.repositoryId,
    input.issueNumber,
  ]);
}

function identifierForRepoDaily(input: IssueTriageRateLimitInput) {
  return hashParts([
    "repo-day",
    input.installationId ?? "unknown-installation",
    input.repositoryId,
    input.isPrivateRepository ? "private" : "public",
  ]);
}

function identifierForCooldownReply(input: CooldownReplyRateLimitInput) {
  return hashParts([
    "cooldown-reply",
    input.installationId ?? "unknown-installation",
    input.repositoryId,
    input.issueNumber,
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
    cooldownReply: readBoolean(
      process.env.ISSUE_MAINTAINER_COOLDOWN_REPLY,
      true,
    ),
    cooldownReplySeconds: readPositiveInteger(
      process.env.ISSUE_MAINTAINER_COOLDOWN_REPLY_SECONDS,
      DEFAULT_COOLDOWN_REPLY_SECONDS,
    ),
    enabled: readBoolean(
      process.env.ISSUE_MAINTAINER_RATE_LIMIT_ENABLED,
      true,
    ),
    failureMode: readFailureMode(
      process.env.ISSUE_MAINTAINER_RATE_LIMIT_FAILURE_MODE,
    ),
    issueCooldownSeconds: readPositiveInteger(
      process.env.ISSUE_MAINTAINER_ISSUE_COOLDOWN_SECONDS,
      DEFAULT_ISSUE_COOLDOWN_SECONDS,
    ),
    prefix:
      process.env.ISSUE_MAINTAINER_RATE_LIMIT_PREFIX?.trim() ||
      DEFAULT_RATE_LIMIT_PREFIX,
    privateRepoDailyLimit: readNonNegativeInteger(
      process.env.ISSUE_MAINTAINER_PRIVATE_REPO_DAILY_LIMIT,
      DEFAULT_PRIVATE_REPO_DAILY_LIMIT,
    ),
    publicRepoDailyLimit: readNonNegativeInteger(
      process.env.ISSUE_MAINTAINER_PUBLIC_REPO_DAILY_LIMIT,
      DEFAULT_PUBLIC_REPO_DAILY_LIMIT,
    ),
    userIssueCooldownSeconds: readPositiveInteger(
      process.env.ISSUE_MAINTAINER_USER_ISSUE_COOLDOWN_SECONDS,
      DEFAULT_USER_ISSUE_COOLDOWN_SECONDS,
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
