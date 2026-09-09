import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  bucketForDaysPastDue,
  daysPastDueOn,
  isStillOpenInvoice,
  withAging,
  type OpenInvoice,
} from "../agent/lib/aging";
import { deliverArDigest } from "../agent/lib/deliver-digest";
import { createDeliveryStore } from "../agent/lib/delivery-store";
import {
  buildDigestDraft,
  buildDigestIdempotencyKey,
} from "../agent/lib/digest";
import { recheckPaidInvoices } from "../agent/lib/invoices";
import type { ArClient } from "../agent/lib/providers/types";

const openRow = (overrides: Partial<OpenInvoice> = {}): OpenInvoice =>
  withAging({
    id: "inv-1",
    provider: "quickbooks",
    number: "1042",
    customerName: "Ava",
    email: "ava@example.com",
    balance: 240,
    total: 240,
    dueDate: "2026-08-01",
    ...overrides,
  });

describe("aging buckets", () => {
  it("ages current through 90+", () => {
    expect(daysPastDueOn("2026-09-09", new Date("2026-09-09T12:00:00Z"))).toBe(
      0,
    );
    expect(bucketForDaysPastDue(0)).toBe("current");
    expect(bucketForDaysPastDue(12)).toBe("1-30");
    expect(bucketForDaysPastDue(45)).toBe("31-60");
    expect(bucketForDaysPastDue(80)).toBe("61-90");
    expect(bucketForDaysPastDue(120)).toBe("90+");
    expect(isStillOpenInvoice(openRow({ balance: 0, status: "PAID" }))).toBe(
      false,
    );
  });
});

describe("paid re-check", () => {
  it("drops invoices that are paid on the second read", async () => {
    const first = openRow({ id: "inv-1", balance: 240 });
    const second = openRow({ id: "inv-2", number: "1043", balance: 80 });
    const latest: Record<string, OpenInvoice> = {
      "inv-1": openRow({ id: "inv-1", balance: 0, status: "PAID" }),
      "inv-2": second,
    };
    const client: ArClient = {
      provider: "quickbooks",
      async listOpenInvoices() {
        return [first, second];
      },
      async getInvoice(id) {
        return latest[id] ?? null;
      },
    };
    const result = await recheckPaidInvoices([first, second], client);
    expect(result.paid.map((invoice) => invoice.id)).toEqual(["inv-1"]);
    expect(result.stillOpen.map((invoice) => invoice.id)).toEqual(["inv-2"]);
  });
});

describe("digest idempotency", () => {
  it("uses a date key and does not double-post Slack", async () => {
    const invoices = [openRow()];
    const runDate = "2026-09-09";
    expect(buildDigestIdempotencyKey(runDate)).toBe(
      "invoice-chase-drafter-2026-09-09",
    );
    const draft = buildDigestDraft(invoices, {
      runDate,
      paidDropped: 1,
      reminderCount: 1,
    });
    expect(draft.slackText).toContain("paid rows dropped");
    expect(draft.slackText).toContain("1-30");

    const store = createDeliveryStore(
      path.join(mkdtempSync(path.join(tmpdir(), "invoice-chase-")), "store.json"),
    );
    let slackCalls = 0;
    const first = await deliverArDigest({
      store,
      invoices,
      slackConnectUid: "slack/invoice-chase-drafter",
      slackChannelId: "C0123456789",
      runDate,
      idempotencyKey: "invoice-chase-drafter-2026-09-09",
      paidDropped: 1,
      postSlack: async (input) => {
        slackCalls += 1;
        expect(input.connectUid).toBe("slack/invoice-chase-drafter");
        expect(input.channelId).toBe("C0123456789");
        expect(input.text).toContain("AR chase digest");
        return { ok: true };
      },
    });
    expect(first.sent).toBe(true);
    expect(first.replayed).toBeUndefined();
    expect(slackCalls).toBe(1);

    const replay = await deliverArDigest({
      store,
      invoices,
      slackConnectUid: "slack/invoice-chase-drafter",
      slackChannelId: "C0123456789",
      runDate,
      idempotencyKey: "invoice-chase-drafter-2026-09-09",
      postSlack: async () => {
        slackCalls += 1;
        return { ok: true };
      },
    });
    expect(replay.replayed).toBe(true);
    expect(replay.sent).toBe(true);
    expect(slackCalls).toBe(1);
  });

  it("refuses Slack when Connect is missing", async () => {
    const store = createDeliveryStore(
      path.join(mkdtempSync(path.join(tmpdir(), "invoice-chase-")), "store.json"),
    );
    const result = await deliverArDigest({
      store,
      invoices: [openRow()],
      runDate: "2026-09-09",
      idempotencyKey: "invoice-chase-drafter-2026-09-09",
    });
    expect(result.sent).toBe(false);
    expect(result.error?.name).toBe("slack_not_configured");
  });
});
