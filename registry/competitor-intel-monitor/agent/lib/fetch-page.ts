import { isHttpsUrl } from "./watch-config.js";
import { isUrlAllowedByRobots, parseRobotsTxt, type RobotsTxt } from "./robots.js";

export type FetchImpl = (
  input: string,
  init?: {
    headers?: Record<string, string>
    redirect?: "follow" | "error" | "manual"
    signal?: AbortSignal
  },
) => Promise<Response>;

export type RobotsDecision =
  | { readonly ok: true; readonly robots: RobotsTxt; readonly status: number }
  | { readonly ok: false; readonly reason: "robots-unreachable" | "invalid-url"; readonly status?: number };

export type FetchedPage =
  | {
      readonly ok: true;
      readonly url: string;
      readonly finalUrl: string;
      readonly status: number;
      readonly contentType: string;
      readonly body: string;
    }
  | {
      readonly ok: false;
      readonly url: string;
      readonly blockedByRobots: true;
      readonly robotsStatus?: number;
      readonly matchedRule?: { readonly type: "allow" | "disallow"; readonly path: string };
      readonly reason: "robots-disallow" | "robots-unreachable" | "invalid-url";
    }
  | {
      readonly ok: false;
      readonly url: string;
      readonly blockedByRobots: false;
      readonly status?: number;
      readonly reason: "http-error" | "invalid-url" | "not-https";
    };

const FETCH_TIMEOUT_MS = 15_000;
const robotsCache = new Map<string, RobotsDecision>();

const robotsUrlFor = (pageUrl: string): string | null => {
  try {
    return new URL("/robots.txt", new URL(pageUrl).origin).toString();
  } catch {
    return null;
  }
};

export const loadRobotsTxt = async (
  pageUrl: string,
  userAgent: string,
  fetchImpl: FetchImpl = fetch,
  cache = robotsCache,
): Promise<RobotsDecision> => {
  const robotsUrl = robotsUrlFor(pageUrl);
  if (!robotsUrl) {
    return { ok: false, reason: "invalid-url" };
  }

  const cached = cache.get(robotsUrl);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchImpl(robotsUrl, {
      headers: { "User-Agent": userAgent, Accept: "text/plain,*/*" },
      redirect: "follow",
    });
    if (response.status === 404) {
      const empty: RobotsDecision = { ok: true, robots: { groups: [] }, status: 404 };
      cache.set(robotsUrl, empty);
      return empty;
    }
    if (!response.ok) {
      const failed: RobotsDecision = { ok: false, reason: "robots-unreachable", status: response.status };
      cache.set(robotsUrl, failed);
      return failed;
    }
    const decision: RobotsDecision = {
      ok: true,
      robots: parseRobotsTxt(await response.text()),
      status: response.status,
    };
    cache.set(robotsUrl, decision);
    return decision;
  } catch {
    const failed: RobotsDecision = { ok: false, reason: "robots-unreachable" };
    cache.set(robotsUrl, failed);
    return failed;
  }
};

export const fetchCompetitorPage = async (
  url: string,
  userAgent: string,
  fetchImpl: FetchImpl = fetch,
  cache: Map<string, RobotsDecision> = robotsCache,
): Promise<FetchedPage> => {
  if (!isHttpsUrl(url)) {
    return { ok: false, url, blockedByRobots: false, reason: "not-https" };
  }

  const robotsDecision = await loadRobotsTxt(url, userAgent, fetchImpl, cache);
  if (!robotsDecision.ok) {
    return {
      ok: false,
      url,
      blockedByRobots: true,
      robotsStatus: robotsDecision.status,
      reason: robotsDecision.reason,
    };
  }

  const robotsCheck = isUrlAllowedByRobots(robotsDecision.robots, url, userAgent);
  if (!robotsCheck.allowed) {
    return {
      ok: false,
      url,
      blockedByRobots: true,
      robotsStatus: robotsDecision.status,
      matchedRule: robotsCheck.matchedRule,
      reason: "robots-disallow",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      headers: { "User-Agent": userAgent, Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8" },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response.ok) {
      return { ok: false, url, blockedByRobots: false, status: response.status, reason: "http-error" };
    }

    const finalUrl = response.url || url;
    if (finalUrl !== url) {
      const finalRobots = await loadRobotsTxt(finalUrl, userAgent, fetchImpl, cache);
      if (!finalRobots.ok) {
        return {
          ok: false,
          url,
          blockedByRobots: true,
          robotsStatus: finalRobots.status,
          reason: finalRobots.reason,
        };
      }
      const finalCheck = isUrlAllowedByRobots(finalRobots.robots, finalUrl, userAgent);
      if (!finalCheck.allowed) {
        return {
          ok: false,
          url,
          blockedByRobots: true,
          robotsStatus: finalRobots.status,
          matchedRule: finalCheck.matchedRule,
          reason: "robots-disallow",
        };
      }
    }

    return {
      ok: true,
      url,
      finalUrl,
      status: response.status,
      contentType: response.headers.get("content-type") ?? "text/html",
      body: await response.text(),
    };
  } catch {
    return { ok: false, url, blockedByRobots: false, reason: "http-error" };
  } finally {
    clearTimeout(timeout);
  }
};
