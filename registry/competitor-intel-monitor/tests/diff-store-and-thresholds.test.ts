import { describe, expect, it } from "vitest";

import { diffNormalizedText, hashNormalizedText, normalizePageText } from "../agent/lib/page-diff";
import { MemorySnapshotStore } from "../agent/lib/snapshot-store";
import {
  changeClearsThreshold,
  changesThatClearThreshold,
  toScoredChange,
} from "../agent/lib/thresholds";

const thresholds = { minScore: 25, minChangedChars: 40 };

describe("diff + persistent store", () => {
  it("stores a baseline and only scores later changes", async () => {
    const store = new MemorySnapshotStore();
    const first = normalizePageText("<h1>Pricing</h1><p>Starts at 19 per seat.</p>");
    await store.set({
      url: "https://example.com/pricing",
      hash: hashNormalizedText(first),
      text: first,
      fetchedAt: "2026-09-06T08:00:00.000Z",
    });

    const second = normalizePageText(
      "<h1>Pricing</h1><p>Starts at 29 per seat with annual billing and a new enterprise tier.</p>",
    );
    const previous = await store.get("https://example.com/pricing");
    expect(previous?.text).toBe(first);

    const diff = diffNormalizedText(previous?.text ?? "", second);
    expect(diff.changed).toBe(true);
    expect(diff.score).toBeGreaterThan(0);
    expect(diff.changedChars).toBeGreaterThan(0);

    await store.set({
      url: "https://example.com/pricing",
      hash: hashNormalizedText(second),
      text: second,
      fetchedAt: "2026-09-07T08:00:00.000Z",
    });
    expect((await store.get("https://example.com/pricing"))?.text).toBe(second);
  });

  it("returns a zero-score unchanged diff when the snapshot matches", () => {
    const text = "Same page as yesterday.";
    const diff = diffNormalizedText(text, text);
    expect(diff).toEqual({
      changed: false,
      changedChars: 0,
      score: 0,
      addedWords: [],
      removedWords: [],
      excerpt: "",
    });
  });
});

describe("threshold gating", () => {
  it("keeps only changes that clear both score and changed-character gates", () => {
    const below = toScoredChange({
      url: "https://example.com/a",
      fetchedAt: "2026-09-07T08:00:00.000Z",
      isBaseline: false,
      diff: {
        changed: true,
        changedChars: 12,
        score: 8,
        addedWords: ["typo"],
        removedWords: [],
        excerpt: "Added: typo",
      },
      thresholds,
    });
    const above = toScoredChange({
      url: "https://example.com/b",
      fetchedAt: "2026-09-07T08:00:00.000Z",
      isBaseline: false,
      diff: {
        changed: true,
        changedChars: 92,
        score: 48,
        addedWords: ["29", "annual"],
        removedWords: ["19"],
        excerpt: "Added: 29 annual",
      },
      thresholds,
    });
    const baseline = toScoredChange({
      url: "https://example.com/c",
      fetchedAt: "2026-09-07T08:00:00.000Z",
      isBaseline: true,
      diff: {
        changed: false,
        changedChars: 0,
        score: 0,
        addedWords: [],
        removedWords: [],
        excerpt: "",
      },
      thresholds,
    });

    expect(below.clearsThreshold).toBe(false);
    expect(above.clearsThreshold).toBe(true);
    expect(baseline.clearsThreshold).toBe(false);
    expect(changeClearsThreshold(above, thresholds)).toBe(true);
    expect(changesThatClearThreshold([below, above, baseline])).toEqual([above]);
  });
});
