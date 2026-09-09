import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_CHASE_CRON,
  isWeekdayCron,
  loadInvoiceChaseConfig,
} from "../agent/lib/chase-config";
import chaseOpenInvoices from "../agent/schedules/chase-open-invoices";

const scheduleSource = readFileSync(
  path.join(import.meta.dirname, "../agent/schedules/chase-open-invoices.ts"),
  "utf8",
);

describe("weekday cron smoke", () => {
  it("defaults to a weekday Eve cron and wires the schedule file", () => {
    const empty = loadInvoiceChaseConfig({});
    expect(empty.cron).toBe(DEFAULT_CHASE_CRON);
    expect(isWeekdayCron(DEFAULT_CHASE_CRON)).toBe(true);
    expect(DEFAULT_CHASE_CRON.split(/\s+/)[4]).toBe("1-5");
    expect(scheduleSource).toContain("defineSchedule");
    expect(scheduleSource).toContain("invoiceChaseConfig.cron");
    expect(scheduleSource).toContain("load_chase_config");
    expect(scheduleSource).toContain("list_open_invoices");
    expect(scheduleSource).toContain("recheck_paid_invoices");
    expect(scheduleSource).toContain("create_reminder_draft");
    expect(scheduleSource).toContain("confirmSend=true");
    expect(scheduleSource).toContain("Never send mail");
    expect(chaseOpenInvoices).toBeDefined();
  });

  it("accepts an explicit weekday cron override", () => {
    const config = loadInvoiceChaseConfig({
      INVOICE_CHASE_CRON: "30 7 * * 1-5",
    });
    expect(config.cron).toBe("30 7 * * 1-5");
    expect(isWeekdayCron(config.cron)).toBe(true);
    expect(isWeekdayCron("0 8 * * *")).toBe(false);
  });
});
