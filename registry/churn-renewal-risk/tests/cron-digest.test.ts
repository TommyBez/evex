import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { createAuditLog } from "../agent/lib/audit-log";
import { deliverRenewalDigest } from "../agent/lib/deliver-digest";
import {
  buildDigestDraft,
  buildDigestIdempotencyKey,
  resolveDigestDeliveryKey,
} from "../agent/lib/digest";
import { scoreRenewalRisk } from "../agent/lib/score";

const now = new Date("2026-09-11T08:00:00.000Z");
const DIGEST_KEY = "churn-renewal-risk-2026-09-11";

const batch = scoreRenewalRisk({
  provider: "hubspot",
  scannedAt: "2026-09-11T08:00:00.000Z",
  now,
  accounts: [
    {
      id: "1",
      name: "Acme",
      renewalDate: "2026-10-01",
      stripeCustomerId: "cus_123",
    },
  ],
  healthByAccountId: {
    "1": {
      ok: true,
      failClosed: false,
      health: { customerId: "cus_123", delinquent: true },
    },
  },
});

describe("movers digest", () => {
  it("builds a date key and Slack preview without customer email", () => {
    expect(buildDigestIdempotencyKey("2026-09-11")).toBe(DIGEST_KEY);
    expect(
      resolveDigestDeliveryKey({
        runDate: "2026-09-11",
        idempotencyKey: DIGEST_KEY,
      }).ok,
    ).toBe(true);
    const draft = buildDigestDraft(batch, { runDate: "2026-09-11" });
    expect(draft.moverCount).toBe(1);
    expect(draft.slackText).toContain("at-risk");
    expect(draft.slackText).toContain("No customer email was sent");
  });

  it("posts Slack once and replays the same date key", async () => {
    const auditPath = path.join(
      mkdtempSync(path.join(tmpdir(), "churn-renewal-")),
      "audit.jsonl",
    );
    const audit = createAuditLog(auditPath);
    const posts: string[] = [];
    const first = await deliverRenewalDigest({
      audit,
      batch,
      slackConnectUid: "slack/churn-renewal-risk",
      slackChannelId: "C0123456789",
      runDate: "2026-09-11",
      idempotencyKey: DIGEST_KEY,
      postSlack: async (input) => {
        posts.push(input.connectUid);
        expect(input.connectUid).toBe("slack/churn-renewal-risk");
        return { ok: true };
      },
    });
    expect(first.sent).toBe(true);
    expect(first.emailedCustomer).toBe(false);
    expect(first.written).toBe(false);
    const replay = await deliverRenewalDigest({
      audit,
      batch,
      slackConnectUid: "slack/churn-renewal-risk",
      slackChannelId: "C0123456789",
      runDate: "2026-09-11",
      idempotencyKey: DIGEST_KEY,
      postSlack: async () => {
        posts.push("again");
        return { ok: true };
      },
    });
    expect(replay.replayed).toBe(true);
    expect(posts).toEqual(["slack/churn-renewal-risk"]);
    expect(audit.list().some((event) => event.type === "delivered")).toBe(true);
  });
});
