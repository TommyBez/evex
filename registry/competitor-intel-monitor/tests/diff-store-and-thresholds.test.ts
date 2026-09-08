import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildDigestIdempotencyKey } from "../agent/lib/digest";
import { diffNormalizedText, hashNormalizedText, normalizePageText } from "../agent/lib/page-diff";
import {
  FileSnapshotStore,
  MemorySnapshotStore,
  RedisSnapshotStore,
  recordFetchedSnapshot,
} from "../agent/lib/snapshot-store";
import {
  changeClearsThreshold,
  changesThatClearThreshold,
  selectDigestAlerts,
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

  it("scores reordered tokens as a change", () => {
    const diff = diffNormalizedText("Basic $10 Pro $20", "Basic $20 Pro $10");
    expect(diff.changed).toBe(true);
    expect(diff.changedChars).toBeGreaterThan(0);
    expect(diff.score).toBeGreaterThan(0);
    expect(diff.excerpt.length).toBeGreaterThan(0);
  });

  it("rejects a hash that does not match the text", async () => {
    const store = new MemorySnapshotStore();
    const text = "Starts at 29 per seat with annual billing.";
    const result = await recordFetchedSnapshot({
      store,
      url: "https://example.com/pricing",
      text,
      hash: "not-a-real-digest",
      fetchedAt: "2026-09-07T08:00:00.000Z",
      thresholds,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.hashMismatch).toBe(true);
      expect(result.expectedHash).toBe(hashNormalizedText(text));
    }
    expect(await store.get("https://example.com/pricing")).toBeNull();
  });

  it("keeps a threshold-clearing snapshot pending until delivery is committed", async () => {
    const store = new MemorySnapshotStore();
    const first = "Starts at 19 per seat.";
    const second =
      "Starts at 29 per seat with annual billing and a new enterprise tier added today.";
    await recordFetchedSnapshot({
      store,
      url: "https://example.com/pricing",
      text: first,
      hash: hashNormalizedText(first),
      fetchedAt: "2026-09-06T08:00:00.000Z",
      thresholds,
    });
    const changed = await recordFetchedSnapshot({
      store,
      url: "https://example.com/pricing",
      text: second,
      hash: hashNormalizedText(second),
      fetchedAt: "2026-09-07T08:00:00.000Z",
      thresholds,
    });
    expect(changed.ok).toBe(true);
    if (changed.ok) {
      expect(changed.clearsThreshold).toBe(true);
      expect(changed.pendingDelivery).toBe(true);
    }
    const pending = await store.get("https://example.com/pricing");
    expect(pending?.text).toBe(first);
    expect(pending?.pending?.text).toBe(second);
    await store.commitPending("https://example.com/pricing");
    expect((await store.get("https://example.com/pricing"))?.text).toBe(second);
  });

  it("keeps pending alert snapshots until commit", async () => {
    const store = new MemorySnapshotStore();
    const baseline = "Basic $10 Pro $20";
    await store.set({
      url: "https://example.com/pricing",
      hash: hashNormalizedText(baseline),
      text: baseline,
      fetchedAt: "2026-09-06T08:00:00.000Z",
    });
    const next = "Basic $29 Pro $49 annual";
    await store.set({
      url: "https://example.com/pricing",
      hash: hashNormalizedText(baseline),
      text: baseline,
      fetchedAt: "2026-09-06T08:00:00.000Z",
      pending: {
        hash: hashNormalizedText(next),
        text: next,
        fetchedAt: "2026-09-07T08:00:00.000Z",
      },
    });

    const beforeDelivery = await store.get("https://example.com/pricing");
    expect(beforeDelivery?.hash).toBe(hashNormalizedText(baseline));
    expect(beforeDelivery?.pending?.text).toBe(next);

    await store.commitPending("https://example.com/pricing");
    const afterDelivery = await store.get("https://example.com/pricing");
    expect(afterDelivery?.text).toBe(next);
    expect(afterDelivery?.pending).toBeUndefined();
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
    const spoofed = {
      ...below,
      clearsThreshold: true,
    };

    expect(below.clearsThreshold).toBe(false);
    expect(above.clearsThreshold).toBe(true);
    expect(baseline.clearsThreshold).toBe(false);
    expect(changeClearsThreshold(above, thresholds)).toBe(true);
    expect(changesThatClearThreshold([below, above, baseline])).toEqual([above]);
    expect(selectDigestAlerts([spoofed, above, baseline], thresholds)).toEqual([above]);
  });

  it("includes the logical change set in the idempotency key", () => {
    const first = buildDigestIdempotencyKey(
      [
        {
          url: "https://example.com/pricing",
          fetchedAt: "2026-09-07T08:00:00.000Z",
          score: 48,
          changedChars: 92,
        },
      ],
      "2026-09-07",
    );
    const second = buildDigestIdempotencyKey(
      [
        {
          url: "https://example.com/pricing",
          fetchedAt: "2026-09-07T12:00:00.000Z",
          score: 61,
          changedChars: 140,
        },
      ],
      "2026-09-07",
    );
    expect(first).toMatch(/^competitor-intel-monitor-2026-09-07-[0-9a-f]{16}$/);
    expect(first).not.toBe(second);
  });
});

describe("snapshot store atomicity", () => {
  it("serializes overlapping file-store writes so both URLs survive", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "cim-store-"));
    const store = new FileSnapshotStore(path.join(directory, "store.json"));
    await Promise.all([
      store.set({
        url: "https://example.com/a",
        hash: "aaa",
        text: "A",
        fetchedAt: "2026-09-07T08:00:00.000Z",
      }),
      store.set({
        url: "https://example.com/b",
        hash: "bbb",
        text: "B",
        fetchedAt: "2026-09-07T08:00:00.000Z",
      }),
    ]);
    const listed = await store.list();
    expect(listed.map((item) => item.url).sort()).toEqual([
      "https://example.com/a",
      "https://example.com/b",
    ]);
    const raw = await readFile(path.join(directory, "store.json"), "utf8");
    expect(raw).toContain("https://example.com/a");
    expect(raw).toContain("https://example.com/b");
  });

  it("records Slack delivery independently of email", async () => {
    const store = new MemorySnapshotStore();
    await store.setDelivery("run-1", { slackSent: true });
    expect(await store.getDelivery("run-1")).toEqual({ slackSent: true });
    await store.setDelivery("run-1", { slackSent: true, emailMessageId: "msg_1" });
    expect(await store.getDelivery("run-1")).toEqual({
      slackSent: true,
      emailMessageId: "msg_1",
    });
  });

  it("writes Redis snapshots under per-URL keys", async () => {
    const calls: string[] = [];
    const documents = new Map<string, string>();
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      calls.push(`${init?.method ?? "GET"} ${url}`);
      if (url.includes("/set/")) {
        const key = decodeURIComponent(url.split("/set/")[1] ?? "");
        documents.set(key, String(init?.body ?? ""));
        return new Response("OK", { status: 200 });
      }
      if (url.includes("/sadd/")) {
        return new Response("1", { status: 200 });
      }
      if (url.includes("/get/")) {
        const key = decodeURIComponent(url.split("/get/")[1] ?? "");
        const stored = documents.get(key);
        if (!stored) {
          return new Response("missing", { status: 404 });
        }
        return Response.json({ result: stored });
      }
      return new Response("nope", { status: 500 });
    };

    const store = new RedisSnapshotStore("https://redis.example", "token", fetchImpl);
    await store.set({
      url: "https://example.com/pricing",
      hash: "abc",
      text: "hello",
      fetchedAt: "2026-09-07T08:00:00.000Z",
    });
    const decodedCalls = calls.map((call) => decodeURIComponent(call));
    expect(
      decodedCalls.some((call) =>
        call.includes("competitor-intel-monitor:snapshot:https://example.com/pricing"),
      ),
    ).toBe(true);
    expect(
      decodedCalls.some((call) => call.includes("competitor-intel-monitor:snapshot-urls")),
    ).toBe(true);
    const loaded = await store.get("https://example.com/pricing");
    expect(loaded?.text).toBe("hello");
  });
});
