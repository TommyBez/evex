import { describe, expect, it } from "vitest";

import { hmacSha256, verifyLeadHmac } from "../agent/lib/hmac";
import { parseLeadEvent } from "../agent/lib/lead-events";
import { authorizeLeadPush } from "../agent/lib/push-auth";
import {
  buildPushQualifyPrompt,
  persistPushLead,
} from "../agent/lib/push-inbox";

const SECRET = "test-inbound-hmac-secret";

describe("HMAC intake", () => {
  it("accepts a hex sha256 signature over the raw body", () => {
    const payload = JSON.stringify({
      email: "ava@acme.com",
      firstName: "Ava",
      company: "Acme",
    });
    const signature = `sha256=${hmacSha256(SECRET, payload, "hex")}`;
    expect(
      verifyLeadHmac({ secret: SECRET, payload, signature }),
    ).toBe(true);
    expect(
      authorizeLeadPush({
        request: new Request("https://example.test/leads/push", {
          method: "POST",
          headers: { "x-hub-signature-256": signature },
          body: payload,
        }),
        rawBody: payload,
        body: JSON.parse(payload),
        expectedSecret: SECRET,
      }),
    ).toEqual({ authorized: true, method: "hmac" });
  });

  it("accepts a Typeform-style base64 signature", () => {
    const payload = JSON.stringify({
      form_response: {
        token: "resp-1",
        answers: [
          { type: "email", email: "ava@acme.com", field: { ref: "email" } },
        ],
      },
    });
    const signature = `sha256=${hmacSha256(SECRET, payload, "base64")}`;
    expect(
      authorizeLeadPush({
        request: new Request("https://example.test/leads/push", {
          method: "POST",
          headers: { "typeform-signature": signature },
          body: payload,
        }),
        rawBody: payload,
        body: JSON.parse(payload),
        expectedSecret: SECRET,
      }).authorized,
    ).toBe(true);
  });

  it("rejects a bad signature and a missing secret", () => {
    const payload = '{"email":"ava@acme.com"}';
    expect(
      authorizeLeadPush({
        request: new Request("https://example.test/leads/push", {
          method: "POST",
          headers: { "x-hub-signature-256": "sha256=deadbeef" },
          body: payload,
        }),
        rawBody: payload,
        body: { email: "ava@acme.com" },
        expectedSecret: SECRET,
      }).authorized,
    ).toBe(false);
    expect(
      authorizeLeadPush({
        request: new Request("https://example.test/leads/push", {
          method: "POST",
          headers: {
            "x-hub-signature-256": `sha256=${hmacSha256(SECRET, payload, "hex")}`,
          },
          body: payload,
        }),
        rawBody: payload,
        body: { email: "ava@acme.com" },
        expectedSecret: undefined,
      }).authorized,
    ).toBe(false);
  });

  it("parses generic form and Typeform payloads", () => {
    const form = parseLeadEvent({
      body: { email: "ava@acme.com", firstName: "Ava", company: "Acme" },
    });
    expect("ignored" in form).toBe(false);
    if ("ignored" in form) {
      throw new Error("expected form lead");
    }
    expect(form.source).toBe("form");
    expect(form.lead.email).toBe("ava@acme.com");

    const typeform = parseLeadEvent({
      body: {
        form_response: {
          token: "resp-1",
          answers: [
            { type: "email", email: "ava@acme.com", field: { ref: "email" } },
            { type: "text", text: "Acme", field: { ref: "company" } },
          ],
        },
      },
    });
    expect("ignored" in typeform).toBe(false);
    if ("ignored" in typeform) {
      throw new Error("expected typeform lead");
    }
    expect(typeform.source).toBe("typeform");
    expect(typeform.lead.company).toBe("Acme");
  });

  it("embeds the sanitized lead and persist id in the queued push prompt", () => {
    const parsed = parseLeadEvent({
      body: { email: "ava@acme.com", firstName: "Ava", company: "Acme" },
    });
    expect("ignored" in parsed).toBe(false);
    if ("ignored" in parsed) {
      throw new Error("expected form lead");
    }
    const leadId = persistPushLead(parsed.lead);
    const prompt = buildPushQualifyPrompt(parsed.lead, leadId);
    expect(leadId).toMatch(/^push-lead:/);
    expect(prompt).toContain(leadId);
    expect(prompt).toContain("ava@acme.com");
    expect(prompt).toContain("Sanitized inbound lead JSON:");
    expect(prompt).toContain("ingest_lead_event");
  });
});
