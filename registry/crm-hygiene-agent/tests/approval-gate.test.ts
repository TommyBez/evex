import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { always, never, once } from "eve/tools/approval";
import type { ApprovalContext, ApprovalPolicy } from "eve/tools/approval";

import { createAuditLog } from "../agent/lib/audit-log";
import { loadCrmHygieneConfig } from "../agent/lib/crm-config";
import { proposeHygieneBatch } from "../agent/lib/hygiene";
import { crmFetch } from "../agent/lib/providers/http";
import {
  batchProviderMismatch,
  createConfiguredCrmClient,
} from "../agent/lib/providers/index";
import { createHubSpotClient } from "../agent/lib/providers/hubspot";
import { createPipedriveClient, pipedriveWriteBody } from "../agent/lib/providers/pipedrive";
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

  it("rejects failed CRM mutation responses before recording writes", async () => {
    const grant = createApprovalGrant({
      batchId: "batch-409",
      confirmWrite: true,
    });
    await expect(
      crmFetch({
        fetchImpl: async () =>
          new Response('{"email":"secret.person@example.com"}', { status: 409 }),
        url: "https://api.hubapi.com/crm/v3/objects/contacts/1",
        method: "PATCH",
        body: "{}",
        grant,
        batchId: "batch-409",
      }),
    ).rejects.toThrow(/^CRM write failed \(409\) for PATCH\.$/);

    const urls: string[] = [];
    const client = createHubSpotClient(
      loadCrmHygieneConfig({
        CRM_PROVIDER: "hubspot",
        CRM_HYGIENE_HUBSPOT_CONNECT_UID: "hubspot/crm-hygiene-agent",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return new Response("merge conflict", { status: 409 });
      },
      async () => ({ accessToken: "pat-test", expiresIn: 3600 }),
    );

    await expect(
      client.applyWrites({
        batchId: "batch-409",
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
      }),
    ).rejects.toThrow(/CRM write failed \(409\)/);
    expect(urls.some((url) => url.startsWith("PATCH"))).toBe(true);
  });

  it("refuses a batch whose provider does not match the configured CRM client", () => {
    const applySource = readFileSync(
      path.join(import.meta.dirname, "../agent/tools/apply_hygiene_writes.ts"),
      "utf8",
    );
    const executeSource = applySource.slice(applySource.indexOf("async execute"));
    expect(executeSource).toContain("batchProviderMismatch");
    expect(executeSource.indexOf("batchProviderMismatch")).toBeLessThan(
      executeSource.indexOf("applyWrites"),
    );
    expect(batchProviderMismatch("salesforce", "hubspot")).toMatch(
      /does not match configured CRM_PROVIDER hubspot/,
    );
    expect(batchProviderMismatch("hubspot", "hubspot")).toBeUndefined();
  });

  it("maps Pipedrive company enrichment onto the organization field", async () => {
    expect(
      pipedriveWriteBody({
        id: "enrich-1",
        kind: "enrich",
        recordId: "9",
        before: { company: undefined },
        after: { company: "Acme" },
        reason: "Fill company",
      }),
    ).toEqual({ org_name: "Acme" });
    expect(
      pipedriveWriteBody({
        id: "enrich-2",
        kind: "enrich",
        recordId: "9",
        before: { orgId: undefined },
        after: { orgId: "42", company: "Acme" },
        reason: "Fill organization",
      }),
    ).toEqual({ org_id: 42, org_name: "Acme" });
    expect(
      pipedriveWriteBody({
        id: "enrich-3",
        kind: "enrich",
        recordId: "9",
        before: { company: undefined },
        after: { company: "360" },
        reason: "Fill company name that happens to be digits",
      }),
    ).toEqual({ org_name: "360" });

    const bodies: unknown[] = [];
    const client = createPipedriveClient(
      loadCrmHygieneConfig({
        CRM_PROVIDER: "pipedrive",
        CRM_HYGIENE_PIPEDRIVE_CONNECT_UID: "pipedrive/crm-hygiene-agent",
      }),
      async (_input, init) => {
        if (init?.body) {
          bodies.push(JSON.parse(String(init.body)));
        }
        return Response.json({ data: { id: 9 } });
      },
      async () => ({ accessToken: "pat-test", expiresIn: 3600 }),
    );
    const result = await client.applyWrites({
      batchId: "batch-org",
      grant: createApprovalGrant({
        batchId: "batch-org",
        confirmWrite: true,
      }),
      proposals: [
        {
          id: "enrich-company",
          kind: "enrich",
          recordId: "9",
          before: { company: undefined },
          after: { company: "Acme" },
          reason: "Fill company",
        },
      ],
    });
    expect(result.applied).toEqual(["enrich-company"]);
    expect(bodies).toEqual([{ org_name: "Acme" }]);
  });
});
