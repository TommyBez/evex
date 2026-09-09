import { mkdtempSync, readFileSync } from "node:fs";
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
  escapeSlackMrkdwn,
  resolveDigestDeliveryKey,
} from "../agent/lib/digest";
import { formatInvoiceAmount, recheckPaidInvoices } from "../agent/lib/invoices";
import type { ArClient } from "../agent/lib/providers/types";

const NOW = new Date("2026-09-09T12:00:00Z");
const RUN_DATE = "2026-09-09";
const DIGEST_KEY = "invoice-chase-drafter-2026-09-09";

const openRow = (overrides: Partial<OpenInvoice> = {}): OpenInvoice =>
  withAging(
    {
      id: "inv-1",
      provider: "quickbooks",
      number: "1042",
      customerName: "Ava",
      email: "ava@example.com",
      balance: 240,
      total: 240,
      dueDate: "2026-08-28",
      currency: "USD",
      ...overrides,
    },
    NOW,
  );

const tempStore = () =>
  createDeliveryStore(
    path.join(mkdtempSync(path.join(tmpdir(), "invoice-chase-")), "store.json"),
  );

describe("aging buckets", () => {
  it("ages current through 90+", () => {
    expect(daysPastDueOn("2026-09-09", NOW)).toBe(0);
    expect(daysPastDueOn("2026-08-28", NOW)).toBe(12);
    expect(bucketForDaysPastDue(0)).toBe("current");
    expect(bucketForDaysPastDue(12)).toBe("1-30");
    expect(bucketForDaysPastDue(45)).toBe("31-60");
    expect(bucketForDaysPastDue(80)).toBe("61-90");
    expect(bucketForDaysPastDue(120)).toBe("90+");
    expect(isStillOpenInvoice(openRow({ balance: 0, status: "PAID" }))).toBe(
      false,
    );
    expect(openRow().bucket).toBe("1-30");
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
    expect(buildDigestIdempotencyKey(RUN_DATE)).toBe(DIGEST_KEY);
    const draft = buildDigestDraft(invoices, {
      runDate: RUN_DATE,
      paidDropped: 1,
      reminderCount: 1,
    });
    expect(draft.slackText).toContain("paid rows dropped");
    expect(draft.slackText).toContain("1-30");

    const store = tempStore();
    let slackCalls = 0;
    const first = await deliverArDigest({
      store,
      invoices,
      slackConnectUid: "slack/invoice-chase-drafter",
      slackChannelId: "C0123456789",
      runDate: RUN_DATE,
      idempotencyKey: DIGEST_KEY,
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
      runDate: RUN_DATE,
      idempotencyKey: DIGEST_KEY,
      postSlack: async () => {
        slackCalls += 1;
        return { ok: true };
      },
    });
    expect(replay.replayed).toBe(true);
    expect(replay.sent).toBe(true);
    expect(slackCalls).toBe(1);
  });

  it("claims the key before Slack and rejects an overlapping sender", async () => {
    const store = tempStore();
    let releaseSlack: ((value: { ok: true }) => void) | undefined;
    const slackHold = new Promise<{ ok: true }>((resolve) => {
      releaseSlack = resolve;
    });
    let slackCalls = 0;
    const invoices = [openRow()];

    const first = deliverArDigest({
      store,
      invoices,
      slackConnectUid: "slack/invoice-chase-drafter",
      slackChannelId: "C0123456789",
      runDate: RUN_DATE,
      idempotencyKey: DIGEST_KEY,
      postSlack: async () => {
        slackCalls += 1;
        return slackHold;
      },
    });

    const claimed = store.find(DIGEST_KEY);
    expect(claimed?.status).toBe("in_progress");
    expect(claimed?.slackSent).toBe(false);

    const second = await deliverArDigest({
      store,
      invoices,
      slackConnectUid: "slack/invoice-chase-drafter",
      slackChannelId: "C0123456789",
      runDate: RUN_DATE,
      idempotencyKey: DIGEST_KEY,
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
    expect(store.find(DIGEST_KEY)?.slackSent).toBe(true);
  });

  it("releases a failed claim so a later retry can post", async () => {
    const store = tempStore();
    const invoices = [openRow()];
    const failed = await deliverArDigest({
      store,
      invoices,
      slackConnectUid: "slack/invoice-chase-drafter",
      slackChannelId: "C0123456789",
      runDate: RUN_DATE,
      idempotencyKey: DIGEST_KEY,
      postSlack: async () => ({ ok: false, error: "channel_not_found" }),
    });
    expect(failed.sent).toBe(false);
    expect(store.find(DIGEST_KEY)).toBeUndefined();

    const retried = await deliverArDigest({
      store,
      invoices,
      slackConnectUid: "slack/invoice-chase-drafter",
      slackChannelId: "C0123456789",
      runDate: RUN_DATE,
      idempotencyKey: DIGEST_KEY,
      postSlack: async () => ({ ok: true }),
    });
    expect(retried.sent).toBe(true);
  });

  it("refuses Slack when Connect is missing", async () => {
    const result = await deliverArDigest({
      store: tempStore(),
      invoices: [openRow()],
      runDate: RUN_DATE,
      idempotencyKey: DIGEST_KEY,
    });
    expect(result.sent).toBe(false);
    expect(result.error?.name).toBe("slack_not_configured");
  });

  it("derives the date key and rejects a caller-supplied mismatch", () => {
    expect(resolveDigestDeliveryKey({ runDate: RUN_DATE, idempotencyKey: DIGEST_KEY })).toEqual({
      ok: true,
      runDate: RUN_DATE,
      idempotencyKey: DIGEST_KEY,
    });
    expect(
      resolveDigestDeliveryKey({
        runDate: RUN_DATE,
        idempotencyKey: "invoice-chase-drafter-other",
      }),
    ).toEqual({
      ok: false,
      runDate: RUN_DATE,
      expected: DIGEST_KEY,
    });
  });
});

describe("Slack escape and reminder currency", () => {
  it("escapes Slack-sensitive invoice fields before chat.postMessage", () => {
    expect(escapeSlackMrkdwn("<!channel> <@U1> A & B")).toBe(
      "&lt;!channel&gt; &lt;@U1&gt; A &amp; B",
    );
    const draft = buildDigestDraft(
      [
        openRow({
          number: "<!channel>",
          customerName: "<@U123>",
          email: "pay@example.com>",
        }),
      ],
      { runDate: RUN_DATE },
    );
    expect(draft.slackText).toContain("&lt;!channel&gt;");
    expect(draft.slackText).toContain("&lt;@U123&gt;");
    expect(draft.slackText).toContain("pay@example.com&gt;");
    expect(draft.slackText).not.toContain("<!channel>");
    expect(draft.slackText).not.toContain("<@U123>");
  });

  it("includes currency in reminder copy", () => {
    expect(formatInvoiceAmount(openRow())).toBe("USD 240.00");
    expect(formatInvoiceAmount(openRow({ currency: undefined }))).toBe("240.00");
  });
});

describe("atomic delivery store", () => {
  it("writes via rename so a completed save keeps every key", () => {
    const store = tempStore();
    store.save({
      idempotencyKey: "invoice-chase-drafter-2026-09-08",
      runDate: "2026-09-08",
      slackSent: true,
      postedAt: "2026-09-08T08:00:00.000Z",
      status: "complete",
    });
    store.save({
      idempotencyKey: DIGEST_KEY,
      runDate: RUN_DATE,
      slackSent: true,
      postedAt: "2026-09-09T08:00:00.000Z",
      status: "complete",
    });
    const parsed = JSON.parse(readFileSync(store.path, "utf8")) as {
      deliveries: { idempotencyKey: string }[];
    };
    expect(parsed.deliveries.map((row) => row.idempotencyKey).sort()).toEqual([
      "invoice-chase-drafter-2026-09-08",
      DIGEST_KEY,
    ]);
    expect(store.find("invoice-chase-drafter-2026-09-08")?.slackSent).toBe(true);
    expect(store.find(DIGEST_KEY)?.slackSent).toBe(true);
  });
});
