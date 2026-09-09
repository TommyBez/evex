import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { createAuditLog } from "../agent/lib/audit-log";
import { proposeHygieneBatch } from "../agent/lib/hygiene";
import { ttlSecondsFromExpiresAt } from "../agent/lib/oauth";
import { createHubSpotClient, HUBSPOT_MAX_PAGE_SIZE } from "../agent/lib/providers/hubspot";
import {
  createSalesforceClient,
  salesforceContactFields,
  SALESFORCE_MERGE_UNSUPPORTED,
} from "../agent/lib/providers/salesforce";
import { loadCrmHygieneConfig } from "../agent/lib/crm-config";
import {
  applyWritesFailureAudit,
  createApprovalGrant,
  PartialWriteError,
  sanitizeCrmWriteAuditNote,
} from "../agent/lib/write-guard";

const hubspotConfig = loadCrmHygieneConfig({
  CRM_PROVIDER: "hubspot",
  CRM_HYGIENE_HUBSPOT_CONNECT_UID: "hubspot/crm-hygiene-agent",
});

const salesforceConfig = loadCrmHygieneConfig({
  CRM_PROVIDER: "salesforce",
  CRM_HYGIENE_SALESFORCE_CONNECT_UID: "salesforce/crm-hygiene-agent",
  CRM_HYGIENE_SALESFORCE_INSTANCE_URL: "https://example.my.salesforce.com",
});

describe("CodeRabbit review fixes", () => {
  it("throws instead of caching an expired Connect token TTL", () => {
    const now = Date.now();
    expect(() => ttlSecondsFromExpiresAt(now - 1_000, now)).toThrow(
      /already expired/,
    );
    expect(ttlSecondsFromExpiresAt(now + 90_000, now)).toBe(90);
  });

  it("keeps HTTP status and method in audit notes without provider response bodies", () => {
    const leaked =
      'CRM write failed (409) for PATCH https://api.hubapi.com/crm/v3/objects/contacts/1: {"email":"secret.person@example.com","phone":"+14155551212"}';
    expect(sanitizeCrmWriteAuditNote(leaked)).toBe(
      "CRM write failed (409) for PATCH.",
    );
    const failure = applyWritesFailureAudit(
      new PartialWriteError(["normalize-1"], new Error(leaked)),
    );
    expect(failure.note).toBe("Partial write: CRM write failed (409) for PATCH.");
    expect(failure.note).not.toContain("secret.person@example.com");
    expect(failure.note).not.toContain("+14155551212");
    expect(failure.note).not.toContain("{");
  });

  it("clamps HubSpot list limit to 100 and follows paging.next.after", async () => {
    const urls: string[] = [];
    const client = createHubSpotClient(
      hubspotConfig,
      async (input) => {
        const url = String(input);
        urls.push(url);
        const parsed = new URL(url);
        if (!parsed.searchParams.get("after")) {
          return Response.json({
            results: Array.from({ length: 100 }, (_, index) => ({
              id: String(index + 1),
            })),
            paging: { next: { after: "cursor-100" } },
          });
        }
        return Response.json({
          results: Array.from({ length: 20 }, (_, index) => ({
            id: String(index + 101),
          })),
        });
      },
      async () => ({ accessToken: "pat-test", expiresIn: 3600 }),
    );

    const records = await client.listRecords({ max: 250 });
    expect(HUBSPOT_MAX_PAGE_SIZE).toBe(100);
    expect(records).toHaveLength(120);
    expect(urls[0]).toContain("limit=100");
    expect(urls[0]).not.toContain("after=");
    expect(urls[1]).toContain("limit=100");
    expect(urls[1]).toContain("after=cursor-100");
    expect(urls).toHaveLength(2);
  });

  it("does not persist CRM field values in the audit JSONL", () => {
    const auditPath = path.join(
      mkdtempSync(path.join(tmpdir(), "crm-hygiene-")),
      "audit.jsonl",
    );
    const audit = createAuditLog(auditPath);
    const batch = proposeHygieneBatch({
      provider: "hubspot",
      scannedAt: "2026-09-09T08:00:00.000Z",
      records: [
        { id: "1", email: "secret.person@example.com", firstName: "ava", phone: "+14155551212" },
        { id: "2", email: "secret.person@example.com", firstName: "Ava" },
      ],
    });
    audit.saveBatch(batch);
    const raw = readFileSync(auditPath, "utf8");
    expect(raw).not.toContain("secret.person@example.com");
    expect(raw).not.toContain("+14155551212");
    expect(raw).not.toContain('"before"');
    expect(raw).not.toContain('"after"');
    const stored = audit.latestBatch();
    expect(stored?.proposals.every((proposal) => Array.isArray(proposal.changedFields))).toBe(
      true,
    );

    audit.append({
      type: "proposed",
      batchId: batch.batchId,
      ts: "2020-01-01T00:00:00.000Z",
      written: false,
    });
    const purged = audit.purgeExpired({
      now: new Date("2026-09-09T00:00:00.000Z"),
      retentionDays: 90,
    });
    expect(purged.removed).toBeGreaterThan(0);
    expect(audit.list().some((event) => event.ts.startsWith("2020-"))).toBe(false);
  });

  it("audits mid-batch CRM mutations as a partial write, not a full refuse", async () => {
    const grant = createApprovalGrant({
      batchId: "batch-partial",
      confirmWrite: true,
    });
    let calls = 0;
    const client = createHubSpotClient(
      hubspotConfig,
      async () => {
        calls += 1;
        if (calls === 1) {
          return Response.json({ id: "1" });
        }
        return new Response("conflict", { status: 409 });
      },
      async () => ({ accessToken: "pat-test", expiresIn: 3600 }),
    );

    const proposals = [
      {
        id: "normalize-1",
        kind: "normalize" as const,
        recordId: "1",
        before: { email: "Ava@Example.com" },
        after: { email: "ava@example.com" },
        reason: "Normalize email",
      },
      {
        id: "normalize-2",
        kind: "normalize" as const,
        recordId: "2",
        before: { email: "Sam@Example.com" },
        after: { email: "sam@example.com" },
        reason: "Normalize email",
      },
    ];

    try {
      await client.applyWrites({
        batchId: "batch-partial",
        grant,
        proposals,
      });
      throw new Error("expected PartialWriteError");
    } catch (error) {
      expect(error).toBeInstanceOf(PartialWriteError);
      if (!(error instanceof PartialWriteError)) {
        throw error;
      }
      expect(error.applied).toEqual(["normalize-1"]);
      expect(applyWritesFailureAudit(error)).toEqual({
        type: "written",
        written: true,
        applied: ["normalize-1"],
        note: expect.stringContaining("Partial write"),
      });
    }
  });

  it("fails closed on Salesforce Contact merge and omits Website from Contact PATCH", async () => {
    expect(
      salesforceContactFields({
        email: "ava@example.com",
        website: "https://acme.example",
      }),
    ).toEqual({ Email: "ava@example.com" });

    const urls: string[] = [];
    const client = createSalesforceClient(
      salesforceConfig,
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({ id: "1" });
      },
      async () => ({ accessToken: "pat-test", expiresIn: 3600 }),
    );

    await expect(
      client.applyWrites({
        batchId: "batch-sf",
        grant: createApprovalGrant({
          batchId: "batch-sf",
          confirmWrite: true,
        }),
        proposals: [
          {
            id: "dedupe-1",
            kind: "dedupe",
            recordId: "1",
            mergeRecordId: "2",
            before: { id: "2" },
            after: { id: "1" },
            reason: "Merge",
          },
        ],
      }),
    ).rejects.toThrow(SALESFORCE_MERGE_UNSUPPORTED);
    expect(urls.some((url) => url.includes("/merge"))).toBe(false);
  });

  it("keeps preview_hygiene_digest from returning the full draft", () => {
    const source = readFileSync(
      path.join(import.meta.dirname, "../agent/tools/preview_hygiene_digest.ts"),
      "utf8",
    );
    expect(source).toContain("slackTextPreview");
    expect(source).toContain("idempotencyKey");
    expect(source).not.toContain("draft,");
  });
});
