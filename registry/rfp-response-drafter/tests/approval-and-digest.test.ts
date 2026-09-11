import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { bucketForDaysUntilDue, daysUntilDueOn, withAging } from "../agent/lib/aging";
import { createDeliveryStore } from "../agent/lib/delivery-store";
import { deliverDeadlineDigest } from "../agent/lib/deliver-digest";
import {
  buildDeadlineDigest,
  buildDigestIdempotencyKey,
  resolveDigestDeliveryKey,
} from "../agent/lib/digest";
import { evaluateCiteGate, evaluateSmeWriteGate } from "../agent/lib/cite-gate";
import {
  isEmailDigestConfigured,
  loadRfpResponseConfig,
  missingDigestEnv,
} from "../agent/lib/rfp-config";
import { assertDraftWriteIntent } from "../agent/lib/write-guard";

const DIGEST_KEY = "rfp-response-drafter-2026-09-11";

describe("approval before write", () => {
  it("refuses write-back without a draft intent, citations, or SME approval", () => {
    expect(() => assertDraftWriteIntent("submit")).toThrow(/portal submit/);
    const gate = evaluateCiteGate({
      sources: [],
      sections: [
        {
          heading: "Security",
          body: "We are secure.",
          claims: [
            {
              text: "We are secure.",
              citation: { sourceId: "missing" },
            },
          ],
        },
      ],
    });
    expect(gate.ok).toBe(false);
    expect(
      evaluateSmeWriteGate({
        openQuestions: ["Need the SOC 2 date"],
        smeApproved: false,
      }).ok,
    ).toBe(false);
  });
});

describe("deadline aging digest", () => {
  it("buckets open RFPs and delivers Slack or email once per date key", async () => {
    expect(buildDigestIdempotencyKey("2026-09-11")).toBe(DIGEST_KEY);
    expect(
      resolveDigestDeliveryKey({
        runDate: "2026-09-11",
        idempotencyKey: "other",
      }),
    ).toEqual({
      ok: false,
      runDate: "2026-09-11",
      expected: DIGEST_KEY,
    });

    const now = new Date("2026-09-11T00:00:00.000Z");
    expect(daysUntilDueOn("2026-09-20", now)).toBe(9);
    expect(bucketForDaysUntilDue(9)).toBe("upcoming");
    expect(withAging({ id: "late", title: "Late", dueDate: "2026-08-01" }, now).bucket).toBe(
      "30+",
    );

    const draft = buildDeadlineDigest(
      [
        { id: "acme", title: "Acme security RFP", dueDate: "2026-09-20" },
        { id: "late", title: "Late RFP", dueDate: "2026-08-01" },
      ],
      { runDate: "2026-09-11", now },
    );
    expect(draft.upcomingCount).toBe(2);
    expect(draft.aging.upcoming).toBe(1);
    expect(draft.aging["30+"]).toBe(1);
    expect(draft.slackText).toContain("Nothing is submitted");
    expect(draft.html).toContain("Aging:");

    const store = createDeliveryStore(
      path.join(mkdtempSync(path.join(tmpdir(), "rfp-")), "store.json"),
    );
    let slackPosts = 0;
    let emailPosts = 0;
    const first = await deliverDeadlineDigest({
      store,
      rfps: [{ id: "acme", title: "Acme security RFP", dueDate: "2026-09-20" }],
      slackConnectUid: "slack/rfp",
      slackChannelId: "C1",
      digestFrom: "digest@example.com",
      digestTo: ["ops@example.com"],
      runDate: "2026-09-11",
      idempotencyKey: DIGEST_KEY,
      postSlack: async () => {
        slackPosts += 1;
        return { ok: true };
      },
      sendEmail: async () => {
        emailPosts += 1;
        return { id: "email-1" };
      },
    });
    expect(first).toMatchObject({
      sent: true,
      submitted: false,
      slackSent: true,
      emailSent: true,
      emailMessageId: "email-1",
    });

    const replay = await deliverDeadlineDigest({
      store,
      rfps: [{ id: "acme", title: "Acme security RFP", dueDate: "2026-09-20" }],
      slackConnectUid: "slack/rfp",
      slackChannelId: "C1",
      digestFrom: "digest@example.com",
      digestTo: ["ops@example.com"],
      runDate: "2026-09-11",
      idempotencyKey: DIGEST_KEY,
      postSlack: async () => {
        slackPosts += 1;
        return { ok: true };
      },
      sendEmail: async () => {
        emailPosts += 1;
        return { id: "should-not-send" };
      },
    });
    expect(replay.replayed).toBe(true);
    expect(slackPosts).toBe(1);
    expect(emailPosts).toBe(1);
  });

  it("treats Slack or email as enough for digest delivery", () => {
    expect(missingDigestEnv(loadRfpResponseConfig({}))).toEqual(
      expect.arrayContaining([
        "RFP_RESPONSE_SLACK_CONNECT_UID",
        "RFP_RESPONSE_DIGEST_FROM",
        "RESEND_API_KEY",
      ]),
    );
    expect(
      isEmailDigestConfigured(
        loadRfpResponseConfig({
          RESEND_API_KEY: "re_test",
          RFP_RESPONSE_DIGEST_FROM: "digest@example.com",
          RFP_RESPONSE_DIGEST_TO: "ops@example.com",
        }),
      ),
    ).toBe(true);
    expect(
      missingDigestEnv(
        loadRfpResponseConfig({
          RESEND_API_KEY: "re_test",
          RFP_RESPONSE_DIGEST_FROM: "digest@example.com",
          RFP_RESPONSE_DIGEST_TO: "ops@example.com",
        }),
      ),
    ).toEqual([]);
  });
});
