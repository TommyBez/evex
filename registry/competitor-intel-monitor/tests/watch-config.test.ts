import { describe, expect, it } from "vitest";

import {
  DEFAULT_CRON,
  isHttpsUrl,
  loadWatchConfig,
  parseWatchConfigFile,
} from "../agent/lib/watch-config";

describe("watch config and schedule", () => {
  it("defaults the cron to daily 08:00 UTC", () => {
    const config = loadWatchConfig({}, () => ({ urls: [] }));
    expect(config.cron).toBe(DEFAULT_CRON);
    expect(config.cron).toBe("0 8 * * *");
  });

  it("reads the cron and URL list from env", () => {
    const config = loadWatchConfig(
      {
        COMPETITOR_INTEL_URLS: "https://example.com/pricing,http://insecure.example/x",
        COMPETITOR_INTEL_CRON: "15 6 * * 1-5",
      },
      () => ({ urls: [] }),
    );
    expect(config.urls).toEqual(["https://example.com/pricing"]);
    expect(config.cron).toBe("15 6 * * 1-5");
  });

  it("unions env URLs with a JSON config file and lets env thresholds win", () => {
    const config = loadWatchConfig(
      {
        COMPETITOR_INTEL_URLS: "https://example.com/pricing",
        COMPETITOR_INTEL_ALERT_MIN_SCORE: "40",
        COMPETITOR_INTEL_URLS_FILE: "watch.json",
      },
      (filePath) => {
        expect(filePath).toBe("watch.json");
        return parseWatchConfigFile(
          JSON.stringify({
            urls: ["https://example.com/changelog", "https://example.com/pricing"],
            alert: { minScore: 10, minChangedChars: 80 },
          }),
        );
      },
    );
    expect(config.urls).toEqual([
      "https://example.com/pricing",
      "https://example.com/changelog",
    ]);
    expect(config.alert.minScore).toBe(40);
    expect(config.alert.minChangedChars).toBe(80);
  });

  it("parses a text URL list with comments", () => {
    const parsed = parseWatchConfigFile(`
# pricing
https://example.com/pricing
https://example.com/changelog
`);
    expect(parsed.urls).toEqual([
      "https://example.com/pricing",
      "https://example.com/changelog",
    ]);
  });

  it("rejects non-https URLs", () => {
    expect(isHttpsUrl("http://example.com")).toBe(false);
    expect(isHttpsUrl("https://example.com/pricing")).toBe(true);
  });
});
