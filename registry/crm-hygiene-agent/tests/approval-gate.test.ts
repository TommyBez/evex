import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { always, never, once } from "eve/tools/approval";
import type { ApprovalContext, ApprovalPolicy } from "eve/tools/approval";

import { createAuditLog } from "../agent/lib/audit-log";
import { loadCrmHygieneConfig } from "../agent/lib/crm-config";
import { proposeHygieneBatch } from "../agent/lib/hygiene";
import { createConfiguredCrmClient } from "../agent/lib/providers/index";
import { createHubSpotClient } from "../agent/lib/providers/hubspot";
import {
  assertReadOnlyRequest,
  createApprovalGrant,
} from "../agent/lib/write-guard";
import applyHygieneWrites from "../agent/tools/apply_hygiene_writes";
import deliverHygieneDigest from "../agent/tools/deliver_hygiene_digest";

const alreadyApprovedContext = {
  approvedTools: new Set(["apply_hygiene_writes", "deliver_hygiene_digest"]),
  callId: "crm-hygiene-approval",
  getSandbox: async () => {
    throw new Error("always() does not use getSandbox()");
  },
  getSkill: () => {
    throw new Error("always() does not use getSkill()");
  },
  session: {
    id: "crm-hygiene-approval-session",
    auth: { current: null, initiator: null },
    turn: { id: "crm-hygiene-approval-turn", sequence: 0 },
  },
  toolName: "apply_hygiene_writes",
  toolInput: {
    confirmWrite: true,
    batch: { batchId: "crm-hygiene-2026-09-09-aaaa" },
  },
} satisfies ApprovalContext;

const isApprovalPolicy = (value: unknown): value is ApprovalPolicy =>
  typeof value === "function";

describe("approval gate", () => {
  it("always pauses apply_hygiene_writes and deliver_hygiene_digest", () => {
    expect(isApprovalPolicy(applyHygieneWrites.approval)).toBe(true);
    expect(isApprovalPolicy(deliverHygieneDigest.approval)).toBe(true);
    if (!isApprovalPolicy(applyHygieneWrites.approval)) {
      throw new Error("apply_hygiene_writes.approval must be always()");
    }
    if (!isApprovalPolicy(deliverHygieneDigest.approval)) {
      throw new Error("deliver_hygiene_digest.approval must be always()");
    }
    expect(applyHygieneWrites.approval(alreadyApprovedContext)).toBe(
      "user-approval",
    );
    expect(deliverHygieneDigest.approval(alreadyApprovedContext)).toBe(
      "user-approval",
    );
    expect(always()(alreadyApprovedContext)).toBe("user-approval");
    expect(once()(alreadyApprovedContext)).toBe("not-applicable");
    expect(never()(alreadyApprovedContext)).toBe("not-applicable");
  });

  it("refuses a CRM mutation without an ApprovalGrant", async () => {
    expect(() => assertReadOnlyRequest("PATCH", "/contacts/1")).toThrow(
      /apply_hygiene_writes/,
    );
    expect(() =>
      createApprovalGrant({ batchId: "batch-1", confirmWrite: false }),
    ).toThrow(/confirmWrite/);

    const urls: string[] = [];
    const client = createHubSpotClient(
      loadCrmHygieneConfig({
        CRM_PROVIDER: "hubspot",
        CRM_HYGIENE_HUBSPOT_CONNECT_UID: "hubspot/crm-hygiene-agent",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({ results: [] });
      },
      async () => ({ accessToken: "pat-test", expiresIn: 3600 }),
    );

    await expect(
      client.applyWrites({
        batchId: "batch-1",
        grant: undefined as never,
        proposals: [
          {
            id: "normalize-1",
            kind: "normalize",
            recordId: "1",
            before: { email: "Ava@Example.com" },
            after: { email: "ava@example.com" },
            reason: "Normalize email",
          },
        ],
      }),
    ).rejects.toThrow(/ApprovalGrant|apply_hygiene_writes/);
    expect(urls.some((url) => url.startsWith("PATCH"))).toBe(false);
    expect(urls.some((url) => url.includes("/merge"))).toBe(false);
  });

  it("writes HubSpot only after a grant from apply_hygiene_writes", async () => {
    const urls: string[] = [];
    const client = createHubSpotClient(
      loadCrmHygieneConfig({
        CRM_PROVIDER: "hubspot",
        CRM_HYGIENE_HUBSPOT_CONNECT_UID: "hubspot/crm-hygiene-agent",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({ id: "1" });
      },
      async () => ({ accessToken: "pat-test", expiresIn: 3600 }),
    );

    const grant = createApprovalGrant({
      batchId: "batch-1",
      confirmWrite: true,
    });
    const result = await client.applyWrites({
      batchId: "batch-1",
      grant,
      proposals: [
        {
          id: "normalize-1",
          kind: "normalize",
          recordId: "1",
          before: { email: "Ava@Example.com" },
          after: { email: "ava@example.com" },
          reason: "Normalize email",
        },
      ],
    });
    expect(result.written).toBe(true);
    expect(urls.some((url) => url.startsWith("PATCH"))).toBe(true);
  });

  it("records refused when confirmWrite is false", () => {
    const auditPath = path.join(
      mkdtempSync(path.join(tmpdir(), "crm-hygiene-")),
      "audit.jsonl",
    );
    const audit = createAuditLog(auditPath);
    const batch = proposeHygieneBatch({
      provider: "hubspot",
      scannedAt: "2026-09-09T08:00:00.000Z",
      records: [
        { id: "1", email: "Ava@Example.com", firstName: "ava" },
        { id: "2", email: "ava@example.com", firstName: "Ava" },
      ],
    });
    audit.saveBatch(batch);
    audit.append({
      type: "refused",
      batchId: batch.batchId,
      written: false,
      note: "confirmWrite was false. No CRM write ran.",
    });
    expect(audit.list().some((event) => event.type === "refused")).toBe(true);
    expect(audit.list().some((event) => event.written === true)).toBe(false);
  });

  it("does not expose a write client when Connect is missing", () => {
    const client = createConfiguredCrmClient(loadCrmHygieneConfig({}));
    expect(client.ok).toBe(false);
    if (client.ok) {
      throw new Error("expected missing CRM config");
    }
    expect(client.missingEnv).toContain("CRM_PROVIDER");
  });
});
