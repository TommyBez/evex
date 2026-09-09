import { describe, expect, it } from "vitest";

import { loadInvoiceChaseConfig } from "../agent/lib/chase-config";
import { formatInvoiceAmount, reminderCopy } from "../agent/lib/invoices";
import { createGmailMailbox } from "../agent/lib/providers/gmail";
import { createGraphMailbox } from "../agent/lib/providers/graph";
import { buildRfc822 } from "../agent/lib/rfc822";
import {
  assertDraftsOnlyHttp,
  assertNotSendIntent,
  isForbiddenSendUrl,
  isForbiddenSmtpEndpoint,
} from "../agent/lib/send-guard";
import type { OpenInvoice } from "../agent/lib/aging";

const overdue: OpenInvoice = {
  id: "inv-1",
  provider: "quickbooks",
  number: "1042",
  customerName: "Ava",
  email: "ava@example.com",
  balance: 240,
  total: 240,
  dueDate: "2026-08-28",
  currency: "USD",
  daysPastDue: 12,
  bucket: "1-30",
};

describe("send guard", () => {
  it("refuses Gmail send, Graph sendMail, and SMTP", () => {
    expect(
      isForbiddenSendUrl(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      ),
    ).toBe(true);
    expect(
      isForbiddenSendUrl(
        "https://gmail.googleapis.com/gmail/v1/users/me/drafts/send",
      ),
    ).toBe(true);
    expect(
      isForbiddenSendUrl("https://graph.microsoft.com/v1.0/me/sendMail"),
    ).toBe(true);
    expect(isForbiddenSmtpEndpoint("smtp.example.com", 587)).toBe(true);
    expect(() =>
      assertDraftsOnlyHttp(
        "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
        "POST",
      ),
    ).not.toThrow();
    expect(() =>
      assertDraftsOnlyHttp(
        "https://graph.microsoft.com/v1.0/me/mailFolders/drafts/messages",
        "POST",
      ),
    ).not.toThrow();
    expect(() =>
      assertDraftsOnlyHttp(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        "POST",
      ),
    ).toThrow(/never sends mail/);
    expect(() => assertNotSendIntent("send")).toThrow(/Drafts/);
    expect(() => assertNotSendIntent("draft")).not.toThrow();
  });
});

describe("draft-only mailbox path", () => {
  it("writes a Gmail draft and never hits a send URL", async () => {
    const urls: string[] = [];
    const mailbox = createGmailMailbox(
      loadInvoiceChaseConfig({
        INVOICE_CHASE_MAILBOX_PROVIDER: "gmail",
        INVOICE_CHASE_GOOGLE_CONNECT_UID: "google/invoice-chase-drafter",
        INVOICE_CHASE_GMAIL_USER: "ap@example.com",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({ id: "draft-1", message: { id: "m1" } });
      },
      async () => ({ accessToken: "ya29.token", expiresIn: 3600 }),
    );
    const copy = reminderCopy(overdue);
    expect(formatInvoiceAmount(overdue)).toBe("USD 240.00");
    expect(copy.body).toContain("for USD 240.00");
    const result = await mailbox.createReminderDraft({
      to: overdue.email ?? "",
      subject: copy.subject,
      body: copy.body,
      invoiceId: overdue.id,
    });
    expect(result).toEqual({
      drafted: true,
      sent: false,
      provider: "gmail",
      draftId: "draft-1",
      invoiceId: "inv-1",
      mailbox: "Drafts",
    });
    expect(urls).toEqual([
      "POST https://gmail.googleapis.com/gmail/v1/users/me/drafts",
    ]);
    expect(urls.some((url) => /send/i.test(url))).toBe(false);
  });

  it("writes a Graph Drafts message and never calls sendMail", async () => {
    const urls: string[] = [];
    const mailbox = createGraphMailbox(
      loadInvoiceChaseConfig({
        INVOICE_CHASE_MAILBOX_PROVIDER: "outlook",
        INVOICE_CHASE_MICROSOFT_CONNECT_UID:
          "microsoft/invoice-chase-drafter",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({ id: "AAMkDraft" });
      },
      async () => ({ accessToken: "eyJ", expiresIn: 3600 }),
    );
    const result = await mailbox.createReminderDraft({
      to: "ava@example.com",
      subject: "Invoice 1042 is past due",
      body: "Please pay",
      invoiceId: "inv-1",
    });
    expect(result.sent).toBe(false);
    expect(result.drafted).toBe(true);
    expect(result.mailbox).toBe("Drafts");
    expect(urls).toEqual([
      "POST https://graph.microsoft.com/v1.0/me/mailFolders/drafts/messages",
    ]);
    expect(urls.some((url) => /sendMail/i.test(url))).toBe(false);
  });

  it("builds RFC 822 without a send header", () => {
    const raw = buildRfc822({
      from: "ap@example.com",
      to: "ava@example.com",
      subject: "Invoice 1042 is past due",
      body: "Please pay",
    });
    expect(raw).toContain("To: ava@example.com");
    expect(raw).not.toContain("X-Send");
  });
});
