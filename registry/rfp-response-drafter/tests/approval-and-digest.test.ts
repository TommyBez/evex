import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { createDeliveryStore } from "../agent/lib/delivery-store";
import {
  buildDeadlineDigest,
  buildDigestIdempotencyKey,
  resolveDigestDeliveryKey,
} from "../agent/lib/digest";
import { evaluateCiteGate } from "../agent/lib/cite-gate";
import { assertDraftWriteIntent } from "../agent/lib/write-guard";

const DIGEST_KEY = "rfp-response-drafter-2026-09-11";

describe("approval before write", () => {
  it("refuses write-back without a draft intent and without citations", () => {
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
  });
});

describe("deadline digest", () => {
  it("requires the date key and skips a replayed Slack post", () => {
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
    expect(
      resolveDigestDeliveryKey({
        runDate: "2026-09-11",
        idempotencyKey: DIGEST_KEY,
      }),
    ).toEqual({
      ok: true,
      runDate: "2026-09-11",
      idempotencyKey: DIGEST_KEY,
    });

    const draft = buildDeadlineDigest(
      [{ id: "acme", title: "Acme security RFP", dueDate: "2026-09-20" }],
      { runDate: "2026-09-11" },
    );
    expect(draft.upcomingCount).toBe(1);
    expect(draft.slackText).toContain("Nothing is submitted");

    const store = createDeliveryStore(
      path.join(mkdtempSync(path.join(tmpdir(), "rfp-")), "store.json"),
    );
    expect(store.find(DIGEST_KEY)).toBeUndefined();
    store.save({
      idempotencyKey: DIGEST_KEY,
      runDate: "2026-09-11",
      slackSent: true,
      postedAt: "2026-09-11T08:00:00.000Z",
    });
    expect(store.find(DIGEST_KEY)?.slackSent).toBe(true);
  });
});
