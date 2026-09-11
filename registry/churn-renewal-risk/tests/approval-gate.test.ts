import { describe, expect, it } from "vitest";
import { always, never, once } from "eve/tools/approval";
import type { ApprovalContext, ApprovalPolicy } from "eve/tools/approval";

import { loadChurnRenewalConfig } from "../agent/lib/renewal-config";
import { createHubSpotClient } from "../agent/lib/providers/hubspot";
import {
  assertReadOnlyRequest,
  createApprovalGrant,
} from "../agent/lib/write-guard";
import deliverRenewalDigest from "../agent/tools/deliver_renewal_digest";
import draftSavePlay from "../agent/tools/draft_save_play";

const alreadyApprovedContext = {
  approvedTools: new Set(["draft_save_play", "deliver_renewal_digest"]),
  callId: "churn-renewal-approval",
  getSandbox: async () => {
    throw new Error("always() does not use getSandbox()");
  },
  getSkill: () => {
    throw new Error("always() does not use getSkill()");
  },
  session: {
    id: "churn-renewal-approval-session",
    auth: { current: null, initiator: null },
    turn: { id: "churn-renewal-approval-turn", sequence: 0 },
  },
  toolName: "draft_save_play",
  toolInput: {
    confirmWrite: true,
    account: { id: "1", name: "Acme" },
    bucket: "at-risk",
  },
} satisfies ApprovalContext;

const isApprovalPolicy = (value: unknown): value is ApprovalPolicy =>
  typeof value === "function";

describe("approval gate", () => {
  it("always pauses draft_save_play and deliver_renewal_digest", () => {
    expect(isApprovalPolicy(draftSavePlay.approval)).toBe(true);
    expect(isApprovalPolicy(deliverRenewalDigest.approval)).toBe(true);
    if (!isApprovalPolicy(draftSavePlay.approval)) {
      throw new Error("draft_save_play.approval must be always()");
    }
    if (!isApprovalPolicy(deliverRenewalDigest.approval)) {
      throw new Error("deliver_renewal_digest.approval must be always()");
    }
    expect(draftSavePlay.approval(alreadyApprovedContext)).toBe("user-approval");
    expect(deliverRenewalDigest.approval(alreadyApprovedContext)).toBe(
      "user-approval",
    );
    expect(always()(alreadyApprovedContext)).toBe("user-approval");
    expect(once()(alreadyApprovedContext)).toBe("not-applicable");
    expect(never()(alreadyApprovedContext)).toBe("not-applicable");
  });

  it("refuses a CRM mutation without an ApprovalGrant", async () => {
    expect(() => assertReadOnlyRequest("POST", "/crm/v3/objects/notes")).toThrow(
      /draft_save_play/,
    );
    expect(() =>
      createApprovalGrant({ accountId: "1", confirmWrite: false }),
    ).toThrow(/confirmWrite/);

    const urls: string[] = [];
    const client = createHubSpotClient(
      loadChurnRenewalConfig({
        CRM_PROVIDER: "hubspot",
        CHURN_RENEWAL_HUBSPOT_CONNECT_UID: "hubspot/churn-renewal-risk",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({ id: "note-1" });
      },
      async () => ({ accessToken: "pat-test", expiresIn: 3600 }),
    );

    await expect(
      client.writeAccountNote({
        draft: {
          accountId: "1",
          name: "Acme",
          body: "Save play",
        },
        grant: undefined as never,
      }),
    ).rejects.toThrow(/ApprovalGrant|draft_save_play/);
    expect(urls.some((url) => url.startsWith("POST"))).toBe(false);
  });

  it("writes a HubSpot company note only after a grant from draft_save_play", async () => {
    const urls: string[] = [];
    const client = createHubSpotClient(
      loadChurnRenewalConfig({
        CRM_PROVIDER: "hubspot",
        CHURN_RENEWAL_HUBSPOT_CONNECT_UID: "hubspot/churn-renewal-risk",
      }),
      async (input, init) => {
        urls.push(`${init?.method ?? "GET"} ${String(input)}`);
        return Response.json({ id: "note-1" });
      },
      async () => ({ accessToken: "pat-test", expiresIn: 3600 }),
    );

    const grant = createApprovalGrant({
      accountId: "1",
      confirmWrite: true,
    });
    const result = await client.writeAccountNote({
      draft: {
        accountId: "1",
        name: "Acme",
        body: "Save play",
      },
      grant,
    });
    expect(result.written).toBe(true);
    expect(result.noteId).toBe("note-1");
    expect(urls.some((url) => url.includes("/crm/v3/objects/notes"))).toBe(true);
  });
});
