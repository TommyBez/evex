import { describe, expect, it } from "vitest";

import { fetchCompetitorPage, loadRobotsTxt } from "../agent/lib/fetch-page";
import { isUrlAllowedByRobots, parseRobotsTxt } from "../agent/lib/robots";

const USER_AGENT = "EveCompetitorIntelMonitor/1.0";

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
});

describe("fetch + robots", () => {
  it("skips the page when robots.txt disallows it", async () => {
    const fetchImpl = async (input: string) => {
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
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.blockedByRobots).toBe(true);
      expect(result.reason).toBe("robots-disallow");
    }
  });

  it("fetches the page when robots.txt is missing (404)", async () => {
    const fetchImpl = async (input: string) => {
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
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.body).toContain("Hello pricing");
    }
  });

  it("does not fetch the page when robots.txt is unreachable", async () => {
    const fetchImpl = async (input: string) => {
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
    );
    expect(robots.ok).toBe(false);

    const result = await fetchCompetitorPage(
      "https://example.com/pricing",
      USER_AGENT,
      fetchImpl,
      new Map(),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.blockedByRobots).toBe(true);
      expect(result.reason).toBe("robots-unreachable");
    }
  });
});
