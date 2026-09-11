import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_RENEWAL_CRON,
  loadChurnRenewalConfig,
} from "../agent/lib/renewal-config";
import {
  assertNeverEmailCustomer,
  assertNotEmailIntent,
  isForbiddenSendUrl,
  isForbiddenSmtpEndpoint,
} from "../agent/lib/send-guard";
import churnRenewalScan from "../agent/schedules/churn-renewal-scan";

const scheduleSource = readFileSync(
  path.join(import.meta.dirname, "../agent/schedules/churn-renewal-scan.ts"),
  "utf8",
);

describe("never email the customer", () => {
  it("refuses SMTP and mailbox send URLs", () => {
    expect(
      isForbiddenSendUrl(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      ),
    ).toBe(true);
    expect(
      isForbiddenSendUrl("https://graph.microsoft.com/v1.0/me/sendMail"),
    ).toBe(true);
    expect(isForbiddenSmtpEndpoint("smtp.example.com", 587)).toBe(true);
    expect(() =>
      assertNeverEmailCustomer(
        "https://graph.microsoft.com/v1.0/me/sendMail",
        "POST",
      ),
    ).toThrow(/never emails the customer/);
    expect(() => assertNotEmailIntent("email")).toThrow(/never auto-emails/);
  });
});

describe("weekly cron is read-only", () => {
  it("defaults to a Monday Eve cron and forbids CRM writes on the schedule", () => {
    const empty = loadChurnRenewalConfig({});
    expect(empty.cron).toBe(DEFAULT_RENEWAL_CRON);
    expect(DEFAULT_RENEWAL_CRON.split(/\s+/)[4]).toBe("1");
    expect(scheduleSource).toContain("defineSchedule");
    expect(scheduleSource).toContain("churnRenewalConfig.cron");
    expect(scheduleSource).toContain("load_renewal_config");
    expect(scheduleSource).toContain("scan_renewal_accounts");
    expect(scheduleSource).toContain("load_stripe_health");
    expect(scheduleSource).toContain("score_renewal_risk");
    expect(scheduleSource).toContain("confirmSend=true");
    expect(scheduleSource).toContain("Do not call draft_save_play on the cron path");
    expect(scheduleSource).toContain("Never email the customer");
    expect(churnRenewalScan).toBeDefined();
  });
});
