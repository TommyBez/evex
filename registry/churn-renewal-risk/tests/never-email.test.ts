import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_CURSOR_PATH,
  DEFAULT_RENEWAL_CRON,
  loadChurnRenewalConfig,
} from "../agent/lib/renewal-config";
import {
  assertNeverEmailCustomer,
  assertNotEmailIntent,
  isForbiddenSendUrl,
  isForbiddenSmtpEndpoint,
} from "../agent/lib/send-guard";
import churnRenewalScan, {
  CHURN_RENEWAL_SCAN_PROMPT,
} from "../agent/schedules/churn-renewal-scan";

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
    expect(empty.cursorPath).toBe(DEFAULT_CURSOR_PATH);
    expect(DEFAULT_RENEWAL_CRON.split(/\s+/)[4]).toBe("1");
    expect(scheduleSource).toContain("defineSchedule");
    expect(scheduleSource).toContain("churnRenewalConfig.cron");
    expect(scheduleSource).toContain("async run({ to, waitUntil, appAuth })");
    expect(scheduleSource).toContain("auth: appAuth");
    expect(CHURN_RENEWAL_SCAN_PROMPT).toContain("load_renewal_config");
    expect(CHURN_RENEWAL_SCAN_PROMPT).toContain("scan_renewal_accounts");
    expect(CHURN_RENEWAL_SCAN_PROMPT).toContain("load_stripe_health");
    expect(CHURN_RENEWAL_SCAN_PROMPT).toContain("score_renewal_risk");
    expect(CHURN_RENEWAL_SCAN_PROMPT).toContain("confirmSend=true");
    expect(CHURN_RENEWAL_SCAN_PROMPT).toContain(
      "Do not call draft_save_play on the cron path",
    );
    expect(CHURN_RENEWAL_SCAN_PROMPT).toContain("Never email the customer");
    expect(CHURN_RENEWAL_SCAN_PROMPT).toContain(
      "The Slack digest is not a customer email",
    );
    expect(churnRenewalScan).toBeDefined();
    expect(churnRenewalScan).toHaveProperty("run");
  });
});
