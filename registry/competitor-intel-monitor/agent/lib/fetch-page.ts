import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";

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

export type HostLookup = (hostname: string) => Promise<readonly string[]>;

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
      readonly reason: "http-error" | "invalid-url" | "not-https" | "blocked-destination";
    };

export type FetchPageOptions = {
  readonly lookup?: HostLookup;
  readonly timeoutMs?: number;
};

const FETCH_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 5;
const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);
const robotsCache = new Map<string, RobotsDecision>();

const ipv4ToInt = (ip: string): number | null => {
  const parts = ip.split(".");
  if (parts.length !== 4) {
    return null;
  }
  let value = 0;
  for (const part of parts) {
    const octet = Number.parseInt(part, 10);
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) {
      return null;
    }
    value = (value << 8) + octet;
  }
  return value >>> 0;
};

const inCidr = (ip: number, base: string, bits: number): boolean => {
  const network = ipv4ToInt(base);
  if (network === null) {
    return false;
  }
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ip & mask) === (network & mask);
};

export const isPrivateIp = (address: string): boolean => {
  const version = isIP(address);
  if (version === 4) {
    const ip = ipv4ToInt(address);
    if (ip === null) {
      return true;
    }
    return (
      inCidr(ip, "0.0.0.0", 8) ||
      inCidr(ip, "10.0.0.0", 8) ||
      inCidr(ip, "127.0.0.0", 8) ||
      inCidr(ip, "169.254.0.0", 16) ||
      inCidr(ip, "172.16.0.0", 12) ||
      inCidr(ip, "192.168.0.0", 16)
    );
  }
  if (version === 6) {
    const normalized = address.toLowerCase();
    if (normalized === "::" || normalized === "::1") {
      return true;
    }
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(normalized);
    if (mapped?.[1]) {
      return isPrivateIp(mapped[1]);
    }
    if (
      normalized.startsWith("fe8") ||
      normalized.startsWith("fe9") ||
      normalized.startsWith("fea") ||
      normalized.startsWith("feb")
    ) {
      return true;
    }
    return normalized.startsWith("fc") || normalized.startsWith("fd");
  }
  return false;
};

export const isBlockedHostname = (hostname: string): boolean => {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host === "localhost." || host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }
  return isIP(host) === 4 || isIP(host) === 6 ? isPrivateIp(host) : false;
};

export const defaultHostLookup: HostLookup = async (hostname) => {
  const records = await dnsLookup(hostname, { all: true });
  return records.map((record) => record.address);
};

export const evaluateFetchDestination = async (
  url: string,
  lookup: HostLookup = defaultHostLookup,
): Promise<
  | { readonly ok: true; readonly href: string }
  | { readonly ok: false; readonly reason: "not-https" | "invalid-url" | "blocked-destination" }
> => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: "invalid-url" };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, reason: "not-https" };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, reason: "blocked-destination" };
  }
  if (isBlockedHostname(parsed.hostname)) {
    return { ok: false, reason: "blocked-destination" };
  }
  if (isIP(parsed.hostname)) {
    return { ok: true, href: parsed.href };
  }
  try {
    const addresses = await lookup(parsed.hostname);
    if (addresses.length === 0 || addresses.some((address) => isPrivateIp(address))) {
      return { ok: false, reason: "blocked-destination" };
    }
    return { ok: true, href: parsed.href };
  } catch {
    return { ok: false, reason: "blocked-destination" };
  }
};

const robotsUrlFor = (pageUrl: string): string | null => {
  try {
    return new URL("/robots.txt", new URL(pageUrl).origin).toString();
  } catch {
    return null;
  }
};

const fetchOnce = async (
  fetchImpl: FetchImpl,
  url: string,
  headers: Record<string, string>,
  timeoutMs: number,
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, {
      headers,
      redirect: "manual",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

type FailedPage = Extract<FetchedPage, { readonly ok: false }>;

const followValidatedRedirects = async (
  url: string,
  headers: Record<string, string>,
  fetchImpl: FetchImpl,
  lookup: HostLookup,
  timeoutMs: number,
  onHop?: (nextUrl: string) => Promise<{ readonly ok: true } | { readonly ok: false; readonly page: FailedPage }>,
): Promise<
  | { readonly ok: true; readonly response: Response; readonly finalUrl: string }
  | { readonly ok: false; readonly page: FailedPage }
> => {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const destination = await evaluateFetchDestination(current, lookup);
    if (!destination.ok) {
      return {
        ok: false,
        page: { ok: false, url, blockedByRobots: false, reason: destination.reason },
      };
    }
    if (onHop) {
      const hopCheck = await onHop(current);
      if (!hopCheck.ok) {
        return hopCheck;
      }
    }
    let response: Response;
    try {
      response = await fetchOnce(fetchImpl, current, headers, timeoutMs);
    } catch {
      return { ok: false, page: { ok: false, url, blockedByRobots: false, reason: "http-error" } };
    }
    if (REDIRECT_STATUS.has(response.status)) {
      const location = response.headers.get("location");
      if (!location) {
        return {
          ok: false,
          page: { ok: false, url, blockedByRobots: false, status: response.status, reason: "http-error" },
        };
      }
      try {
        current = new URL(location, current).toString();
      } catch {
        return { ok: false, page: { ok: false, url, blockedByRobots: false, reason: "invalid-url" } };
      }
      continue;
    }
    return { ok: true, response, finalUrl: current };
  }
  return { ok: false, page: { ok: false, url, blockedByRobots: false, reason: "http-error" } };
};

export const loadRobotsTxt = async (
  pageUrl: string,
  userAgent: string,
  fetchImpl: FetchImpl = fetch,
  cache = robotsCache,
  options: FetchPageOptions = {},
): Promise<RobotsDecision> => {
  const robotsUrl = robotsUrlFor(pageUrl);
  if (!robotsUrl) {
    return { ok: false, reason: "invalid-url" };
  }

  const cached = cache.get(robotsUrl);
  if (cached) {
    return cached;
  }

  const lookup = options.lookup ?? defaultHostLookup;
  const timeoutMs = options.timeoutMs ?? FETCH_TIMEOUT_MS;
  const fetched = await followValidatedRedirects(
    robotsUrl,
    { "User-Agent": userAgent, Accept: "text/plain,*/*" },
    fetchImpl,
    lookup,
    timeoutMs,
  );
  if (!fetched.ok) {
    const failed: RobotsDecision =
      fetched.page.reason === "invalid-url"
        ? { ok: false, reason: "invalid-url" }
        : { ok: false, reason: "robots-unreachable" };
    cache.set(robotsUrl, failed);
    return failed;
  }

  try {
    if (fetched.response.status === 404) {
      const empty: RobotsDecision = { ok: true, robots: { groups: [] }, status: 404 };
      cache.set(robotsUrl, empty);
      return empty;
    }
    if (!fetched.response.ok) {
      const failed: RobotsDecision = {
        ok: false,
        reason: "robots-unreachable",
        status: fetched.response.status,
      };
      cache.set(robotsUrl, failed);
      return failed;
    }
    const decision: RobotsDecision = {
      ok: true,
      robots: parseRobotsTxt(await fetched.response.text()),
      status: fetched.response.status,
    };
    cache.set(robotsUrl, decision);
    return decision;
  } catch {
    const failed: RobotsDecision = { ok: false, reason: "robots-unreachable" };
    cache.set(robotsUrl, failed);
    return failed;
  }
};

const robotsBlock = (
  url: string,
  robotsDecision: RobotsDecision,
  matchedRule?: { readonly type: "allow" | "disallow"; readonly path: string },
): FailedPage => {
  if (!robotsDecision.ok) {
    return {
      ok: false,
      url,
      blockedByRobots: true,
      robotsStatus: robotsDecision.status,
      reason: robotsDecision.reason,
    };
  }
  return {
    ok: false,
    url,
    blockedByRobots: true,
    robotsStatus: robotsDecision.status,
    matchedRule,
    reason: "robots-disallow",
  };
};

export const fetchCompetitorPage = async (
  url: string,
  userAgent: string,
  fetchImpl: FetchImpl = fetch,
  cache: Map<string, RobotsDecision> = robotsCache,
  options: FetchPageOptions = {},
): Promise<FetchedPage> => {
  if (!isHttpsUrl(url)) {
    return { ok: false, url, blockedByRobots: false, reason: "not-https" };
  }

  const lookup = options.lookup ?? defaultHostLookup;
  const timeoutMs = options.timeoutMs ?? FETCH_TIMEOUT_MS;
  const initialDestination = await evaluateFetchDestination(url, lookup);
  if (!initialDestination.ok) {
    return { ok: false, url, blockedByRobots: false, reason: initialDestination.reason };
  }

  const fetched = await followValidatedRedirects(
    url,
    {
      "User-Agent": userAgent,
      Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
    },
    fetchImpl,
    lookup,
    timeoutMs,
    async (hopUrl) => {
      const robotsDecision = await loadRobotsTxt(hopUrl, userAgent, fetchImpl, cache, options);
      if (!robotsDecision.ok) {
        return { ok: false, page: robotsBlock(url, robotsDecision) };
      }
      const robotsCheck = isUrlAllowedByRobots(robotsDecision.robots, hopUrl, userAgent);
      if (!robotsCheck.allowed) {
        return { ok: false, page: robotsBlock(url, robotsDecision, robotsCheck.matchedRule) };
      }
      return { ok: true };
    },
  );

  if (!fetched.ok) {
    return fetched.page;
  }
  if (!fetched.response.ok) {
    return { ok: false, url, blockedByRobots: false, status: fetched.response.status, reason: "http-error" };
  }

  try {
    return {
      ok: true,
      url,
      finalUrl: fetched.finalUrl,
      status: fetched.response.status,
      contentType: fetched.response.headers.get("content-type") ?? "text/html",
      body: await fetched.response.text(),
    };
  } catch {
    return { ok: false, url, blockedByRobots: false, reason: "http-error" };
  }
};
