import { describe, expect, it } from "vitest";

import { loadRfpResponseConfig } from "../agent/lib/rfp-config";
import { draftMailboxSubject, formatDraftBody } from "../agent/lib/draft-copy";
import { createDriveClient } from "../agent/lib/providers/drive";
import { createGmailMailbox } from "../agent/lib/providers/gmail";
import { createGraphMailbox } from "../agent/lib/providers/graph";
import { buildRfc822 } from "../agent/lib/rfc822";
import {
  assertDraftsOnlyHttp,
  assertDraftWriteIntent,
  assertNotPasteIntent,
  assertNotPortalSubmitIntent,
  isForbiddenPortalSubmitUrl,
  isForbiddenSendUrl,
} from "../agent/lib/write-guard";

describe("portal and send guard", () => {
  it("refuses portal submit, paste-to-text, Gmail send, and SMTP", () => {
    expect(
      isForbiddenPortalSubmitUrl("https://vendor.rfp-portal.example/submit"),
    ).toBe(true);
    expect(
      isForbiddenPortalSubmitUrl(
        "https://example.com/rfp-submit?id=acme",
      ),
    ).toBe(true);
    expect(
      isForbiddenSendUrl(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      ),
    ).toBe(true);
    expect(() =>
      assertDraftsOnlyHttp(
        "https://www.googleapis.com/drive/v3/files",
        "POST",
      ),
    ).not.toThrow();
    expect(() =>
      assertDraftsOnlyHttp(
        "https://vendor.rfp-portal.example/submit",
        "POST",
      ),
    ).toThrow(/never submits a portal/);
    expect(() => assertNotPortalSubmitIntent("submit")).toThrow(/portal submit/);
    expect(() => assertNotPasteIntent("paste")).toThrow(/paste-to-text/);
    expect(() => assertDraftWriteIntent("draft")).not.toThrow();
    expect(() => assertDraftWriteIntent("clipboard")).toThrow(/paste-to-text/);
  });
});

describe("draft-only write-back", () => {
  it("creates a Drive draft Doc and never hits a portal submit URL", async () => {
    const urls: string[] = [];
    const drive = createDriveClient(
      loadRfpResponseConfig({
        RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({ id: "doc-1", name: "DRAFT: Acme" });
      },
      async () => ({ accessToken: "ya29.token", expiresIn: 3600 }),
    );
    const result = await drive.createDraftDoc({
      title: "DRAFT: Acme",
      body: "# DRAFT: Acme\n\nCited answer.",
    });
    expect(result).toMatchObject({
      drafted: true,
      sent: false,
      submitted: false,
      provider: "drive",
      documentId: "doc-1",
    });
    expect(urls[0]).toBe("POST https://www.googleapis.com/drive/v3/files");
    expect(urls[1]).toContain("docs.googleapis.com/v1/documents/doc-1:batchUpdate");
    expect(urls.some((url) => /submit/i.test(url))).toBe(false);
  });

  it("writes a Gmail draft and never hits a send URL", async () => {
    const urls: string[] = [];
    const mailbox = createGmailMailbox(
      loadRfpResponseConfig({
        RFP_RESPONSE_MAILBOX_PROVIDER: "gmail",
        RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
        RFP_RESPONSE_GMAIL_USER: "rfp@example.com",
        RFP_RESPONSE_DRAFT_TO: "sme@example.com",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({ id: "draft-1", message: { id: "m1" } });
      },
      async () => ({ accessToken: "ya29.token", expiresIn: 3600 }),
    );
    const result = await mailbox.createDraft({
      to: "sme@example.com",
      subject: draftMailboxSubject("Acme security RFP"),
      body: formatDraftBody({
        rfpTitle: "Acme security RFP",
        sections: [
          {
            heading: "Encryption",
            body: "We encrypt at rest.",
            claims: [
              {
                text: "We encrypt at rest.",
                citation: { sourceId: "sandbox:knowledge-packs/security.md" },
              },
            ],
          },
        ],
      }),
      rfpId: "acme-2026",
    });
    expect(result).toEqual({
      drafted: true,
      sent: false,
      submitted: false,
      provider: "gmail",
      draftId: "draft-1",
      rfpId: "acme-2026",
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
      loadRfpResponseConfig({
        RFP_RESPONSE_MAILBOX_PROVIDER: "outlook",
        RFP_RESPONSE_MICROSOFT_CONNECT_UID: "microsoft/rfp-response-drafter",
        RFP_RESPONSE_DRAFT_TO: "sme@example.com",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({ id: "AAMkDraft" });
      },
      async () => ({ accessToken: "eyJ", expiresIn: 3600 }),
    );
    const result = await mailbox.createDraft({
      to: "sme@example.com",
      subject: "DRAFT (not submitted): Acme",
      body: "Cited answer",
      rfpId: "acme-2026",
    });
    expect(result.sent).toBe(false);
    expect(result.submitted).toBe(false);
    expect(result.mailbox).toBe("Drafts");
    expect(urls).toEqual([
      "POST https://graph.microsoft.com/v1.0/me/mailFolders/drafts/messages",
    ]);
  });

  it("builds RFC 822 without a send header", () => {
    const raw = buildRfc822({
      from: "rfp@example.com",
      to: "sme@example.com",
      subject: "DRAFT (not submitted): Acme",
      body: "Cited answer",
    });
    expect(raw).toContain("To: sme@example.com");
    expect(raw).not.toContain("X-Send");
  });
});
