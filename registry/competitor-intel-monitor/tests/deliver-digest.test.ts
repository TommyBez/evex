import { describe, expect, it, vi } from "vitest";

import { deliverCompetitorDigest } from "../agent/lib/deliver-digest";
import { MemorySnapshotStore } from "../agent/lib/snapshot-store";
import type { ScoredChange } from "../agent/lib/thresholds";

class CommitOnceFailStore extends MemorySnapshotStore {
  #attempts = 0;

  override async commitPending(url: string) {
    this.#attempts += 1;
    if (this.#attempts === 1) {
      throw new Error("disk full");
    }
    return super.commitPending(url);
  }
}

const alert: ScoredChange = {
  url: "https://example.com/pricing",
  fetchedAt: "2026-09-07T08:00:00.000Z",
  isBaseline: false,
  changed: true,
  score: 48,
  changedChars: 92,
  excerpt: "Added: 29 annual billing",
  clearsThreshold: true,
};

const digest = {
  from: "alerts@example.com",
  to: ["ops@example.com"],
  subject: "Competitor intel digest",
};

const slackConnect = {
  slackConnectUid: "slack/competitor-intel-monitor",
  slackChannelId: "C0123456789",
} as const;

describe("deliverCompetitorDigest", () => {
  it("returns and persists the preview runDate across a later retry", async () => {
    const store = new MemorySnapshotStore();
    let posted:
      | { connectUid: string; channelId: string; text: string }
      | undefined;
    const first = await deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest,
      ...slackConnect,
      runDate: "2026-09-07",
      idempotencyKey: "competitor-intel-monitor-2026-09-07-abc",
      postSlack: async (input) => {
        posted = input;
        return { ok: true };
      },
      sendEmail: async () => ({ error: { name: "resend_error", message: "temporary" } }),
    });
    expect(first.sent).toBe(false);
    expect(first.slackSent).toBe(true);
    expect(first.runDate).toBe("2026-09-07");
    expect(posted).toEqual({
      connectUid: "slack/competitor-intel-monitor",
      channelId: "C0123456789",
      text: expect.stringContaining("2026-09-07"),
    });
    expect(posted?.text).not.toContain("hooks.slack.com");

    const retry = await deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest,
      ...slackConnect,
      runDate: "2026-09-08",
      idempotencyKey: "competitor-intel-monitor-2026-09-07-abc",
      postSlack: async () => {
        throw new Error("Slack should not be called again");
      },
      sendEmail: async (payload) => {
        expect(payload.subject).toContain("2026-09-07");
        return { id: "msg_1" };
      },
    });
    expect(retry.sent).toBe(true);
    expect(retry.runDate).toBe("2026-09-07");
    expect(retry.emailMessageId).toBe("msg_1");
  });

  it("skips Slack when Connect UID or channel id is unset", async () => {
    const store = new MemorySnapshotStore();
    let slackCalls = 0;
    const result = await deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest,
      slackConnectUid: "slack/competitor-intel-monitor",
      runDate: "2026-09-07",
      idempotencyKey: "run-slack-unset",
      postSlack: async () => {
        slackCalls += 1;
        return { ok: true };
      },
      sendEmail: async () => ({ id: "msg_email_only" }),
    });
    expect(result.sent).toBe(true);
    expect(result.slackSent).toBe(false);
    expect(result.emailMessageId).toBe("msg_email_only");
    expect(slackCalls).toBe(0);
  });

  it("claims the delivery key before Slack and rejects a concurrent sender", async () => {
    const store = new MemorySnapshotStore();
    let releaseSlack: ((value: { ok: true }) => void) | undefined;
    const slackHold = new Promise<{ ok: true }>((resolve) => {
      releaseSlack = resolve;
    });
    let slackCalls = 0;

    const first = deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest: { to: [], subject: "Competitor intel digest" },
      ...slackConnect,
      runDate: "2026-09-07",
      idempotencyKey: "run-concurrent",
      postSlack: async () => {
        slackCalls += 1;
        return slackHold;
      },
    });

    await vi.waitFor(async () => {
      expect(await store.getDelivery("run-concurrent")).not.toBeNull();
    });

    const second = await deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest: { to: [], subject: "Competitor intel digest" },
      ...slackConnect,
      runDate: "2026-09-07",
      idempotencyKey: "run-concurrent",
      postSlack: async () => {
        slackCalls += 1;
        return { ok: true };
      },
    });
    expect(second.sent).toBe(false);
    expect(second.inProgress).toBe(true);
    expect(second.error?.name).toBe("delivery_in_progress");

    releaseSlack?.({ ok: true });
    const completed = await first;
    expect(completed.sent).toBe(true);
    expect(slackCalls).toBe(1);
  });

  it("reports a clean Slack channel failure without marking it uncertain", async () => {
    const store = new MemorySnapshotStore();
    const result = await deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest: { to: [], subject: "Competitor intel digest" },
      ...slackConnect,
      runDate: "2026-09-07",
      idempotencyKey: "run-channel-failed",
      postSlack: async () => ({ ok: false, error: "channel_not_found" }),
    });
    expect(result.sent).toBe(false);
    expect(result.slackUncertain).toBeUndefined();
    expect(result.error).toEqual({
      name: "slack_channel_failed",
      message: "channel_not_found",
    });
  });

  it("does not retry Slack after an uncertain channel send", async () => {
    const store = new MemorySnapshotStore();
    const first = await deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest: { to: [], subject: "Competitor intel digest" },
      ...slackConnect,
      runDate: "2026-09-07",
      idempotencyKey: "run-uncertain",
      postSlack: async () => {
        throw new TypeError("fetch failed");
      },
    });
    expect(first.sent).toBe(false);
    expect(first.slackUncertain).toBe(true);

    const retry = await deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest: { to: [], subject: "Competitor intel digest" },
      ...slackConnect,
      runDate: "2026-09-07",
      idempotencyKey: "run-uncertain",
      postSlack: async () => {
        throw new Error("Slack must not be retried");
      },
    });
    expect(retry.sent).toBe(false);
    expect(retry.slackUncertain).toBe(true);
    expect(retry.error?.name).toBe("slack_delivery_uncertain");
  });

  it("resumes uncommitted snapshot URLs on replay after channels succeed", async () => {
    const store = new CommitOnceFailStore();
    await store.set({
      url: alert.url,
      hash: "old",
      text: "old text",
      fetchedAt: "2026-09-06T08:00:00.000Z",
      pending: {
        hash: "new",
        text: "new text",
        fetchedAt: alert.fetchedAt,
      },
    });

    const first = await deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest: { to: [], subject: "Competitor intel digest" },
      ...slackConnect,
      runDate: "2026-09-07",
      idempotencyKey: "run-commit",
      postSlack: async () => ({ ok: true }),
    });
    expect(first.sent).toBe(false);
    expect(first.slackSent).toBe(true);
    expect(first.error?.name).toBe("snapshot_commit_failed");
    expect((await store.get(alert.url))?.text).toBe("old text");

    const replay = await deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest: { to: [], subject: "Competitor intel digest" },
      ...slackConnect,
      runDate: "2026-09-08",
      idempotencyKey: "run-commit",
      postSlack: async () => {
        throw new Error("Slack should be skipped on replay");
      },
    });
    expect(replay.sent).toBe(true);
    expect(replay.replayed).toBe(true);
    expect(replay.runDate).toBe("2026-09-07");
    expect((await store.get(alert.url))?.text).toBe("new text");
    expect((await store.getDelivery("run-commit"))?.committedUrls).toEqual([alert.url]);
  });
});
