import { describe, expect, it } from "vitest";

import {
  evaluateFetchDestination,
  fetchCompetitorPage,
  isPrivateIp,
  loadRobotsTxt,
  type FetchImpl,
  type HostLookup,
} from "../agent/lib/fetch-page";
import { isUrlAllowedByRobots, parseRobotsTxt } from "../agent/lib/robots";

const USER_AGENT = "EveCompetitorIntelMonitor/1.0";
const publicLookup: HostLookup = async () => ["93.184.216.34"];
const fetchOptions = { lookup: publicLookup, timeoutMs: 200 };

describe("robots.txt", () => {
  it("disallows a path listed for this user-agent", () => {
    const robots = parseRobotsTxt(`
User-agent: EveCompetitorIntelMonitor
Disallow: /pricing
Allow: /changelog
`);
    expect(
      isUrlAllowedByRobots(robots, "https://example.com/pricing", USER_AGENT).allowed,
    ).toBe(false);
    expect(
      isUrlAllowedByRobots(robots, "https://example.com/changelog", USER_AGENT).allowed,
    ).toBe(true);
  });

  it("treats an empty robots.txt as allow-all", () => {
    const robots = parseRobotsTxt("");
    expect(
      isUrlAllowedByRobots(robots, "https://example.com/pricing", USER_AGENT).allowed,
    ).toBe(true);
  });

  it("prefers the longest matching rule and ties to Allow", () => {
    const robots = parseRobotsTxt(`
User-agent: *
Disallow: /docs
Allow: /docs/public
`);
    expect(
      isUrlAllowedByRobots(robots, "https://example.com/docs/public/api", USER_AGENT)
        .allowed,
    ).toBe(true);
    expect(
      isUrlAllowedByRobots(robots, "https://example.com/docs/internal", USER_AGENT)
        .allowed,
    ).toBe(false);
  });

  it("matches RFC 9309 wildcards and end anchors", () => {
    const robots = parseRobotsTxt(`
User-agent: *
Disallow: /*.pdf$
Disallow: /*?
Disallow: /docs/*/internal
`);
    expect(
      isUrlAllowedByRobots(robots, "https://example.com/files/spec.pdf", USER_AGENT)
        .allowed,
    ).toBe(false);
    expect(
      isUrlAllowedByRobots(robots, "https://example.com/files/spec.pdf.bak", USER_AGENT)
        .allowed,
    ).toBe(true);
    expect(
      isUrlAllowedByRobots(robots, "https://example.com/page?q=1", USER_AGENT).allowed,
    ).toBe(false);
    expect(
      isUrlAllowedByRobots(robots, "https://example.com/docs/v2/internal", USER_AGENT)
        .allowed,
    ).toBe(false);
    expect(
      isUrlAllowedByRobots(robots, "https://example.com/docs/v2/public", USER_AGENT)
        .allowed,
    ).toBe(true);
  });
});

describe("fetch + robots", () => {
  it("skips the page when robots.txt disallows it", async () => {
    const fetchImpl: FetchImpl = async (input) => {
      if (input.endsWith("/robots.txt")) {
        return new Response("User-agent: *\nDisallow: /pricing\n", { status: 200 });
      }
      throw new Error(`unexpected fetch ${input}`);
    };

    const result = await fetchCompetitorPage(
      "https://example.com/pricing",
      USER_AGENT,
      fetchImpl,
      new Map(),
      fetchOptions,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.blockedByRobots).toBe(true);
      expect(result.reason).toBe("robots-disallow");
    }
  });

  it("fetches the page when robots.txt is missing (404)", async () => {
    const fetchImpl: FetchImpl = async (input) => {
      if (input.endsWith("/robots.txt")) {
        return new Response("not found", { status: 404 });
      }
      return new Response("<html><body>Hello pricing</body></html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    };

    const result = await fetchCompetitorPage(
      "https://example.com/pricing",
      USER_AGENT,
      fetchImpl,
      new Map(),
      fetchOptions,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.body).toContain("Hello pricing");
    }
  });

  it("does not fetch the page when robots.txt is unreachable", async () => {
    const fetchImpl: FetchImpl = async (input) => {
      if (input.endsWith("/robots.txt")) {
        return new Response("nope", { status: 503 });
      }
      throw new Error(`page should not be fetched: ${input}`);
    };

    const cache = new Map();
    const robots = await loadRobotsTxt(
      "https://example.com/pricing",
      USER_AGENT,
      fetchImpl,
      cache,
      fetchOptions,
    );
    expect(robots.ok).toBe(false);

    const result = await fetchCompetitorPage(
      "https://example.com/pricing",
      USER_AGENT,
      fetchImpl,
      new Map(),
      fetchOptions,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.blockedByRobots).toBe(true);
      expect(result.reason).toBe("robots-unreachable");
    }
  });

  it("times out an hung robots.txt request", async () => {
    const fetchImpl: FetchImpl = async (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });

    const robots = await loadRobotsTxt(
      "https://example.com/pricing",
      USER_AGENT,
      fetchImpl,
      new Map(),
      { lookup: publicLookup, timeoutMs: 20 },
    );
    expect(robots.ok).toBe(false);
    if (!robots.ok) {
      expect(robots.reason).toBe("robots-unreachable");
    }
  });

  it("validates each redirect hop against robots before following it", async () => {
    const fetchedUrls: string[] = [];
    const fetchImpl: FetchImpl = async (input) => {
      fetchedUrls.push(input);
      if (input.endsWith("/robots.txt")) {
        return new Response("User-agent: *\nDisallow: /secret\nAllow: /pricing\n", {
          status: 200,
        });
      }
      if (input === "https://example.com/pricing") {
        return new Response(null, {
          status: 302,
          headers: { location: "https://example.com/secret" },
        });
      }
      throw new Error(`body should not be fetched: ${input}`);
    };

    const result = await fetchCompetitorPage(
      "https://example.com/pricing",
      USER_AGENT,
      fetchImpl,
      new Map(),
      fetchOptions,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.blockedByRobots).toBe(true);
      expect(result.reason).toBe("robots-disallow");
    }
    expect(fetchedUrls).not.toContain("https://example.com/secret");
  });

  it("rejects a redirect to a private or non-https destination before reading a body", async () => {
    const fetchImpl: FetchImpl = async (input) => {
      if (input.endsWith("/robots.txt")) {
        return new Response("", { status: 404 });
      }
      if (input === "https://example.com/pricing") {
        return new Response("should not be read", {
          status: 302,
          headers: { location: "http://127.0.0.1/admin" },
        });
      }
      throw new Error(`should not follow ${input}`);
    };

    const result = await fetchCompetitorPage(
      "https://example.com/pricing",
      USER_AGENT,
      fetchImpl,
      new Map(),
      fetchOptions,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.blockedByRobots).toBe(false);
      expect(result.reason === "not-https" || result.reason === "blocked-destination").toBe(
        true,
      );
    }
  });

  it("rejects loopback, link-local, and RFC 1918 destinations", async () => {
    expect(isPrivateIp("127.0.0.1")).toBe(true);
    expect(isPrivateIp("10.0.0.8")).toBe(true);
    expect(isPrivateIp("192.168.1.10")).toBe(true);
    expect(isPrivateIp("169.254.12.3")).toBe(true);
    expect(isPrivateIp("172.16.4.4")).toBe(true);
    expect(isPrivateIp("::1")).toBe(true);
    expect(isPrivateIp("fd12::1")).toBe(true);
    expect(isPrivateIp("93.184.216.34")).toBe(false);

    const blocked = await evaluateFetchDestination("https://127.0.0.1/admin", publicLookup);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.reason).toBe("blocked-destination");
    }
  });
});
