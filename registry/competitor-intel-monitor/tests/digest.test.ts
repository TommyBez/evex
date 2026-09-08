import { describe, expect, it } from "vitest";

import { buildDigestDraft } from "../agent/lib/digest";
import type { ScoredChange } from "../agent/lib/thresholds";

const change: ScoredChange = {
  url: "https://example.com/pricing",
  fetchedAt: "2026-09-07T08:00:00.000Z",
  isBaseline: false,
  changed: true,
  score: 48,
  changedChars: 92,
  excerpt: "Added: 29 annual billing",
  clearsThreshold: true,
};

describe("digest delivery draft", () => {
  it("builds Slack text and accessible email HTML without sending", () => {
    const draft = buildDigestDraft(
      [change],
      { digest: { to: ["ops@example.com"], subject: "Competitor intel digest" } },
      "2026-09-07",
    );

    expect(draft.changeCount).toBe(1);
    expect(draft.subject).toBe("Competitor intel digest — 2026-09-07");
    expect(draft.slackText).toContain("https://example.com/pricing");
    expect(draft.slackText).toContain("score 48/100");
    expect(draft.html).toContain('lang="en"');
    expect(draft.html).toContain("<table>");
    expect(draft.html).not.toContain('role="presentation"');
    expect(draft.html).toContain("<h1>");
    expect(draft.html).toContain('href="https://example.com/pricing"');
    expect(draft.text).toContain("Added: 29 annual billing");
    expect(draft.html).not.toContain("click here");
  });
});
