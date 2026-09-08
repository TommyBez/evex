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

describe("deliverCompetitorDigest", () => {
  it("returns and persists the preview runDate across a later retry", async () => {
    const store = new MemorySnapshotStore();
    let postedText = "";
    const first = await deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest,
      slackWebhookUrl: "https://hooks.slack.test/hook",
      runDate: "2026-09-07",
      idempotencyKey: "competitor-intel-monitor-2026-09-07-abc",
      postSlack: async (_url, text) => {
        postedText = text;
        return new Response("ok", { status: 200 });
      },
      sendEmail: async () => ({ error: { name: "resend_error", message: "temporary" } }),
    });
    expect(first.sent).toBe(false);
    expect(first.slackSent).toBe(true);
    expect(first.runDate).toBe("2026-09-07");
    expect(postedText).toContain("2026-09-07");

    const retry = await deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest,
      slackWebhookUrl: "https://hooks.slack.test/hook",
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

  it("claims the delivery key before Slack and rejects a concurrent sender", async () => {
    const store = new MemorySnapshotStore();
    let releaseSlack: ((value: Response) => void) | undefined;
    const slackHold = new Promise<Response>((resolve) => {
      releaseSlack = resolve;
    });
    let slackCalls = 0;

    const first = deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest: { to: [], subject: "Competitor intel digest" },
      slackWebhookUrl: "https://hooks.slack.test/hook",
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
      slackWebhookUrl: "https://hooks.slack.test/hook",
      runDate: "2026-09-07",
      idempotencyKey: "run-concurrent",
      postSlack: async () => {
        slackCalls += 1;
        return new Response("ok", { status: 200 });
      },
    });
    expect(second.sent).toBe(false);
    expect(second.inProgress).toBe(true);
    expect(second.error?.name).toBe("delivery_in_progress");

    releaseSlack?.(new Response("ok", { status: 200 }));
    const completed = await first;
    expect(completed.sent).toBe(true);
    expect(slackCalls).toBe(1);
  });

  it("does not retry Slack after an uncertain fetch failure", async () => {
    const store = new MemorySnapshotStore();
    const first = await deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest: { to: [], subject: "Competitor intel digest" },
      slackWebhookUrl: "https://hooks.slack.test/hook",
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
      slackWebhookUrl: "https://hooks.slack.test/hook",
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
      slackWebhookUrl: "https://hooks.slack.test/hook",
      runDate: "2026-09-07",
      idempotencyKey: "run-commit",
      postSlack: async () => new Response("ok", { status: 200 }),
    });
    expect(first.sent).toBe(false);
    expect(first.slackSent).toBe(true);
    expect(first.error?.name).toBe("snapshot_commit_failed");
    expect((await store.get(alert.url))?.text).toBe("old text");

    const replay = await deliverCompetitorDigest({
      store,
      alerts: [alert],
      digest: { to: [], subject: "Competitor intel digest" },
      slackWebhookUrl: "https://hooks.slack.test/hook",
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
