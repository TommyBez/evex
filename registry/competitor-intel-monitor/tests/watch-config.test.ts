import { describe, expect, it } from "vitest";

import {
  DEFAULT_CRON,
  isHttpsUrl,
  isSlackDeliveryConfigured,
  loadWatchConfig,
  missingDeliveryEnv,
  missingWatchConfig,
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

  it("treats Slack as unset unless Connect UID and channel id are both set", () => {
    expect(isSlackDeliveryConfigured(loadWatchConfig({}, () => ({ urls: [] })))).toBe(
      false,
    );
    expect(
      isSlackDeliveryConfigured(
        loadWatchConfig(
          { COMPETITOR_INTEL_SLACK_CONNECT_UID: "slack/competitor-intel-monitor" },
          () => ({ urls: [] }),
        ),
      ),
    ).toBe(false);
    expect(
      isSlackDeliveryConfigured(
        loadWatchConfig({ COMPETITOR_INTEL_SLACK_CHANNEL_ID: "C0123456789" }, () => ({
          urls: [],
        })),
      ),
    ).toBe(false);
    expect(
      isSlackDeliveryConfigured(
        loadWatchConfig(
          {
            COMPETITOR_INTEL_SLACK_CONNECT_UID: "slack/competitor-intel-monitor",
            COMPETITOR_INTEL_SLACK_CHANNEL_ID: "C0123456789",
          },
          () => ({ urls: [] }),
        ),
      ),
    ).toBe(true);
  });

  it("does not require Slack when email delivery is configured", () => {
    const missing = missingWatchConfig(
      loadWatchConfig(
        {
          COMPETITOR_INTEL_URLS: "https://example.com/pricing",
          COMPETITOR_INTEL_DIGEST_FROM: "alerts@example.com",
          COMPETITOR_INTEL_DIGEST_TO: "ops@example.com",
        },
        () => ({ urls: [] }),
      ),
    );
    expect(missing).not.toContain("COMPETITOR_INTEL_SLACK_CONNECT_UID");
    expect(missing).not.toContain("COMPETITOR_INTEL_SLACK_CHANNEL_ID");
  });

  it("reports only the unset Slack variable when Slack delivery is incomplete", () => {
    const uidOnly = missingDeliveryEnv(
      loadWatchConfig(
        { COMPETITOR_INTEL_SLACK_CONNECT_UID: "slack/competitor-intel-monitor" },
        () => ({ urls: [] }),
      ),
    );
    expect(uidOnly).toContain("COMPETITOR_INTEL_SLACK_CHANNEL_ID");
    expect(uidOnly).not.toContain("COMPETITOR_INTEL_SLACK_CONNECT_UID");

    const channelOnly = missingDeliveryEnv(
      loadWatchConfig(
        { COMPETITOR_INTEL_SLACK_CHANNEL_ID: "C0123456789" },
        () => ({ urls: [] }),
      ),
    );
    expect(channelOnly).toContain("COMPETITOR_INTEL_SLACK_CONNECT_UID");
    expect(channelOnly).not.toContain("COMPETITOR_INTEL_SLACK_CHANNEL_ID");

    const neither = missingDeliveryEnv(loadWatchConfig({}, () => ({ urls: [] })));
    expect(neither).toEqual([
      "COMPETITOR_INTEL_SLACK_CONNECT_UID",
      "COMPETITOR_INTEL_SLACK_CHANNEL_ID",
      "COMPETITOR_INTEL_DIGEST_FROM",
      "COMPETITOR_INTEL_DIGEST_TO",
    ]);
  });

  it("reports only the unset email variable when email delivery is incomplete", () => {
    const fromOnly = missingDeliveryEnv(
      loadWatchConfig(
        { COMPETITOR_INTEL_DIGEST_FROM: "alerts@example.com" },
        () => ({ urls: [] }),
      ),
    );
    expect(fromOnly).toContain("COMPETITOR_INTEL_DIGEST_TO");
    expect(fromOnly).not.toContain("COMPETITOR_INTEL_DIGEST_FROM");

    const toOnly = missingDeliveryEnv(
      loadWatchConfig(
        { COMPETITOR_INTEL_DIGEST_TO: "ops@example.com" },
        () => ({ urls: [] }),
      ),
    );
    expect(toOnly).toContain("COMPETITOR_INTEL_DIGEST_FROM");
    expect(toOnly).not.toContain("COMPETITOR_INTEL_DIGEST_TO");
  });
});
