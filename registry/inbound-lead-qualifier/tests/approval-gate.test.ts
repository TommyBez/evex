import { describe, expect, it } from "vitest";
import { always, never, once } from "eve/tools/approval";
import type { ApprovalContext, ApprovalPolicy } from "eve/tools/approval";

import { loadInboundLeadConfig } from "../agent/lib/lead-config";
import { createHubSpotClient } from "../agent/lib/providers/hubspot";
import {
  assertReadOnlyRequest,
  createApprovalGrant,
} from "../agent/lib/write-guard";
import draftCrmNote from "../agent/tools/draft_crm_note";
import notifySlackHotLead from "../agent/tools/notify_slack_hot_lead";

const alreadyApprovedContext = {
  approvedTools: new Set(["draft_crm_note", "notify_slack_hot_lead"]),
  callId: "inbound-lead-approval",
  getSandbox: async () => {
    throw new Error("always() does not use getSandbox()");
  },
  getSkill: () => {
    throw new Error("always() does not use getSkill()");
  },
  session: {
    id: "inbound-lead-approval-session",
    auth: { current: null, initiator: null },
    turn: { id: "inbound-lead-approval-turn", sequence: 0 },
  },
  toolName: "draft_crm_note",
  toolInput: {
    confirmWrite: true,
    lead: { email: "ava@acme.com" },
  },
} satisfies ApprovalContext;

const isApprovalPolicy = (value: unknown): value is ApprovalPolicy =>
  typeof value === "function";

describe("approval gate", () => {
  it("always pauses draft_crm_note and notify_slack_hot_lead", () => {
    expect(isApprovalPolicy(draftCrmNote.approval)).toBe(true);
    expect(isApprovalPolicy(notifySlackHotLead.approval)).toBe(true);
    if (!isApprovalPolicy(draftCrmNote.approval)) {
      throw new Error("draft_crm_note.approval must be always()");
    }
    if (!isApprovalPolicy(notifySlackHotLead.approval)) {
      throw new Error("notify_slack_hot_lead.approval must be always()");
    }
    expect(draftCrmNote.approval(alreadyApprovedContext)).toBe("user-approval");
    expect(notifySlackHotLead.approval(alreadyApprovedContext)).toBe(
      "user-approval",
    );
    expect(always()(alreadyApprovedContext)).toBe("user-approval");
    expect(once()(alreadyApprovedContext)).toBe("not-applicable");
    expect(never()(alreadyApprovedContext)).toBe("not-applicable");
  });

  it("refuses a CRM mutation without an ApprovalGrant", async () => {
    expect(() => assertReadOnlyRequest("POST", "/contacts")).toThrow(
      /draft_crm_note/,
    );
    expect(() =>
      createApprovalGrant({ leadId: "lead-1", confirmWrite: false }),
    ).toThrow(/confirmWrite/);

    const urls: string[] = [];
    const client = createHubSpotClient(
      loadInboundLeadConfig({
        CRM_PROVIDER: "hubspot",
        INBOUND_LEAD_HUBSPOT_CONNECT_UID: "hubspot/inbound-lead-qualifier",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({ id: "1" });
      },
      async () => ({ accessToken: "pat-test", expiresIn: 3600 }),
    );

    await expect(
      client.upsertContactAndNote({
        draft: {
          leadId: "lead-1",
          email: "ava@acme.com",
          body: "Draft note",
        },
        grant: undefined as never,
      }),
    ).rejects.toThrow(/ApprovalGrant|draft_crm_note/);
    expect(urls.some((url) => url.startsWith("POST"))).toBe(false);
    expect(urls.some((url) => url.startsWith("PATCH"))).toBe(false);
  });

  it("writes HubSpot only after a grant from draft_crm_note", async () => {
    const urls: string[] = [];
    const client = createHubSpotClient(
      loadInboundLeadConfig({
        CRM_PROVIDER: "hubspot",
        INBOUND_LEAD_HUBSPOT_CONNECT_UID: "hubspot/inbound-lead-qualifier",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        if (String(input).includes("idProperty=email")) {
          return new Response("not found", { status: 404 });
        }
        return Response.json({ id: "1" });
      },
      async () => ({ accessToken: "pat-test", expiresIn: 3600 }),
    );

    const grant = createApprovalGrant({
      leadId: "lead-1",
      confirmWrite: true,
    });
    const result = await client.upsertContactAndNote({
      draft: {
        leadId: "lead-1",
        email: "ava@acme.com",
        firstName: "Ava",
        company: "Acme",
        body: "Inbound lead qualification (hot, 80/100).",
      },
      grant,
    });
    expect(result.written).toBe(true);
    expect(urls.some((url) => url.startsWith("POST"))).toBe(true);
  });
});
