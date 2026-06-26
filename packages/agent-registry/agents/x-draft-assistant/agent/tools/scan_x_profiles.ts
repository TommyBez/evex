import { defineTool } from "eve/tools";
import { z } from "zod";

import { getLookbackStartTime, hotTopicConfig } from "../lib/hot-topic-config.js";

const X_API_BASE = "https://api.x.com/2";
const TWEET_FIELDS = "created_at,public_metrics,entities,lang";
const EXCLUDE = "retweets";
const MIN_MAX_RESULTS = 5;
const MAX_MAX_RESULTS = 100;

type XPublicMetrics = {
  readonly impression_count?: number;
  readonly like_count?: number;
  readonly reply_count?: number;
  readonly retweet_count?: number;
  readonly quote_count?: number;
  readonly bookmark_count?: number;
};

type XTweet = {
  readonly id: string;
  readonly text: string;
  readonly created_at?: string;
  readonly lang?: string;
  readonly public_metrics?: XPublicMetrics;
};

type XUserLookupResponse = {
  readonly data?: { readonly id: string; readonly name: string; readonly username: string };
};

type XTweetsResponse = {
  readonly data?: readonly XTweet[];
  readonly meta?: { readonly result_count?: number; readonly newest_id?: string };
};

const userIdCache = new Map<string, string>();

async function xFetch<T>(path: string, searchParams?: URLSearchParams): Promise<T> {
  const bearer = process.env.X_BEARER_TOKEN;
  if (!bearer) {
    throw new Error("Missing X_BEARER_TOKEN environment variable.");
  }

  const url = searchParams ? `${path}?${searchParams.toString()}` : path;
  const response = await fetch(`${X_API_BASE}${url}`, {
    headers: { Authorization: `Bearer ${bearer}` },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`X API ${response.status} for ${path}: ${body.slice(0, 500)}`);
  }

  return (await response.json()) as T;
}

async function resolveUserId(handle: string): Promise<string> {
  const normalized = handle.replace(/^@/, "");
  const cached = userIdCache.get(normalized);
  if (cached) return cached;

  const lookup = await xFetch<XUserLookupResponse>(
    `/users/by/username/${encodeURIComponent(normalized)}`,
  );
  if (!lookup.data?.id) {
    throw new Error(`Could not resolve X user id for @${normalized}.`);
  }

  userIdCache.set(normalized, lookup.data.id);
  return lookup.data.id;
}

async function fetchUserTweets(handle: string, startTime: string): Promise<readonly XTweet[]> {
  const userId = await resolveUserId(handle);
  const maxResults = Math.min(
    Math.max(hotTopicConfig.maxTweetsPerProfile, MIN_MAX_RESULTS),
    MAX_MAX_RESULTS,
  );
  const params = new URLSearchParams({
    max_results: maxResults.toString(),
    "tweet.fields": TWEET_FIELDS,
    exclude: EXCLUDE,
    start_time: startTime,
  });

  const payload = await xFetch<XTweetsResponse>(`/users/${userId}/tweets`, params);
  return payload.data ?? [];
}

function withinLookback(tweet: XTweet, startTimeMs: number): boolean {
  if (!tweet.created_at) return false;
  const createdAt = Date.parse(tweet.created_at);
  return Number.isFinite(createdAt) && createdAt >= startTimeMs;
}

function summarizeTweet(tweet: XTweet) {
  return {
    id: tweet.id,
    text: tweet.text,
    createdAt: tweet.created_at,
    lang: tweet.lang,
    likes: tweet.public_metrics?.like_count ?? 0,
    replies: tweet.public_metrics?.reply_count ?? 0,
    reposts: tweet.public_metrics?.retweet_count ?? 0,
    quotes: tweet.public_metrics?.quote_count ?? 0,
    impressions: tweet.public_metrics?.impression_count ?? 0,
  };
}

export default defineTool({
  description:
    "Scan configured X (Twitter) profiles for recent posts to surface hot topics. Uses X API v2 app-only bearer auth.",
  inputSchema: z.object({
    handles: z
      .array(z.string().min(1))
      .optional()
      .describe(
        "X handles to scan. Defaults to the X_HOT_TOPIC_HANDLES environment variable.",
      ),
  }),
  async execute({ handles }) {
    const bearer = process.env.X_BEARER_TOKEN;
    if (!bearer) {
      return { authRequired: true, missingEnv: "X_BEARER_TOKEN" };
    }

    const targetHandles = handles?.length ? handles : hotTopicConfig.handles;
    if (targetHandles.length === 0) {
      return {
        scannedProfiles: 0,
        profiles: [],
        note: "No handles configured. Set X_HOT_TOPIC_HANDLES or pass handles explicitly.",
      };
    }

    const startTime = getLookbackStartTime();
    const startTimeMs = Date.parse(startTime);

    const profiles = [];
    for (const handle of targetHandles) {
      try {
        const tweets = (await fetchUserTweets(handle, startTime)).filter((tweet) =>
          withinLookback(tweet, startTimeMs),
        );
        profiles.push({
          handle,
          ok: true,
          tweetCount: tweets.length,
          tweets: tweets.map(summarizeTweet),
        });
      } catch (error) {
        profiles.push({
          handle,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const totalTweets = profiles.reduce(
      (sum, profile) => sum + (profile.ok ? (profile.tweetCount ?? 0) : 0),
      0,
    );

    return {
      scannedProfiles: profiles.length,
      totalTweets,
      lookbackHours: hotTopicConfig.lookbackHours,
      windowStart: startTime,
      profiles,
    };
  },
});
