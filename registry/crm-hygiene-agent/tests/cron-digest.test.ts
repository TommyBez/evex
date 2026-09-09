import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { createAuditLog } from "../agent/lib/audit-log";
import {
  DEFAULT_HYGIENE_CRON,
  isEmailDeliveryConfigured,
  loadCrmHygieneConfig,
  missingHygieneConfig,
} from "../agent/lib/crm-config";
import { deliverHygieneDigest } from "../agent/lib/deliver-digest";
import {
  buildDigestDraft,
  buildDigestIdempotencyKey,
  utcDateStamp,
} from "../agent/lib/digest";
import { proposeHygieneBatch } from "../agent/lib/hygiene";
import crmHygieneScan from "../agent/schedules/crm-hygiene-scan";

const scheduleSource = readFileSync(
  path.join(import.meta.dirname, "../agent/schedules/crm-hygiene-scan.ts"),
  "utf8",
);

describe("cron and digest path", () => {
  it("defaults the cron and wires the schedule file", () => {
    const empty = loadCrmHygieneConfig({});
    expect(empty.cron).toBe(DEFAULT_HYGIENE_CRON);
    expect(scheduleSource).toContain("defineSchedule");
    expect(scheduleSource).toContain("crmHygieneConfig.cron");
    expect(scheduleSource).toContain("load_crm_config");
    expect(scheduleSource).toContain("scan_crm_records");
    expect(scheduleSource).toContain("propose_hygiene_batch");
    expect(scheduleSource).toContain(
      "Do not call apply_hygiene_writes on the cron path",
    );
    expect(crmHygieneScan).toBeDefined();
  });

  it("proposes dedupe, normalize, and enrich without writing", () => {
    const batch = proposeHygieneBatch({
      provider: "hubspot",
      scannedAt: "2026-09-09T08:00:00.000Z",
      records: [
        {
          id: "1",
          email: "Ava@Example.com",
          firstName: "ava",
          lastName: "nguyen",
          company: "Acme",
          phone: "4155551212",
        },
        {
          id: "2",
          email: "ava@example.com",
          firstName: "Ava",
        },
        {
          id: "3",
          email: "sam@example.com",
          firstName: "sam",
        },
      ],
    });
    expect(batch.proposals.some((proposal) => proposal.kind === "dedupe")).toBe(
      true,
    );
    expect(
      batch.proposals.some((proposal) => proposal.kind === "normalize"),
    ).toBe(true);
    expect(batch.proposals.some((proposal) => proposal.kind === "enrich")).toBe(
      true,
    );
    expect(batch.batchId.startsWith("crm-hygiene-2026-09-09-")).toBe(true);
  });

  it("builds a review digest that says nothing has been written", () => {
    const batch = proposeHygieneBatch({
      provider: "hubspot",
      scannedAt: "2026-09-09T08:00:00.000Z",
      records: [
        { id: "1", email: "Ava@Example.com", firstName: "ava" },
        { id: "2", email: "ava@example.com", firstName: "Ava" },
      ],
    });
    const draft = buildDigestDraft(
      batch,
      {
        digest: {
          to: ["ops@example.com"],
          subject: "CRM hygiene batch",
        },
      },
      "2026-09-09",
    );
    expect(draft.proposalCount).toBeGreaterThan(0);
    expect(draft.slackText).toContain("Nothing has been written");
    expect(draft.html).toContain("Approve apply_hygiene_writes");
    expect(buildDigestIdempotencyKey(batch, "2026-09-09")).toMatch(
      /^crm-hygiene-agent-2026-09-09-[0-9a-f]{16}$/,
    );
  });

  it("delivers Slack through Connect and records delivered, not written", async () => {
    const auditPath = path.join(
      mkdtempSync(path.join(tmpdir(), "crm-hygiene-")),
      "audit.jsonl",
    );
    const audit = createAuditLog(auditPath);
    const batch = proposeHygieneBatch({
      provider: "hubspot",
      scannedAt: "2026-09-09T08:00:00.000Z",
      records: [{ id: "1", email: "Ava@Example.com", firstName: "ava" }],
    });
    audit.saveBatch(batch);
    audit.append({
      type: "proposed",
      batchId: batch.batchId,
      written: false,
    });

    let posted:
      | { connectUid: string; channelId: string; text: string }
      | undefined;
    const result = await deliverHygieneDigest({
      audit,
      batch,
      digest: { to: [], subject: "CRM hygiene batch" },
      slackConnectUid: "slack/crm-hygiene-agent",
      slackChannelId: "C0123456789",
      runDate: utcDateStamp(new Date("2026-09-09T08:00:00.000Z")),
      idempotencyKey: "crm-hygiene-agent-2026-09-09-deadbeefdeadbeef",
      postSlack: async (input) => {
        posted = input;
        return { ok: true };
      },
    });

    expect(result.sent).toBe(true);
    expect(result.slackSent).toBe(true);
    expect(posted).toEqual({
      connectUid: "slack/crm-hygiene-agent",
      channelId: "C0123456789",
      text: expect.stringContaining("CRM hygiene batch"),
    });
    expect(posted?.text).not.toContain("hooks.slack.com");
    expect(audit.list().some((event) => event.type === "delivered")).toBe(true);
    expect(audit.list().some((event) => event.type === "written")).toBe(false);

    let slackCalls = 1;
    const replay = await deliverHygieneDigest({
      audit,
      batch,
      digest: { to: [], subject: "CRM hygiene batch" },
      slackConnectUid: "slack/crm-hygiene-agent",
      slackChannelId: "C0123456789",
      runDate: utcDateStamp(new Date("2026-09-09T08:00:00.000Z")),
      idempotencyKey: "crm-hygiene-agent-2026-09-09-deadbeefdeadbeef",
      postSlack: async () => {
        slackCalls += 1;
        return { ok: true };
      },
    });
    expect(replay.replayed).toBe(true);
    expect(replay.sent).toBe(true);
    expect(slackCalls).toBe(1);
    expect(
      audit.list().filter((event) => event.type === "delivered"),
    ).toHaveLength(1);
  });

  it("records Slack as delivered when email fails so Slack is not re-posted", async () => {
    const auditPath = path.join(
      mkdtempSync(path.join(tmpdir(), "crm-hygiene-")),
      "audit.jsonl",
    );
    const audit = createAuditLog(auditPath);
    const batch = proposeHygieneBatch({
      provider: "hubspot",
      scannedAt: "2026-09-09T08:00:00.000Z",
      records: [{ id: "1", email: "ava@example.com", firstName: "Ava" }],
    });
    let slackCalls = 0;
    const first = await deliverHygieneDigest({
      audit,
      batch,
      digest: {
        from: "ops@example.com",
        to: ["ops@example.com"],
        subject: "CRM hygiene batch",
      },
      slackConnectUid: "slack/crm-hygiene-agent",
      slackChannelId: "C0123456789",
      runDate: "2026-09-09",
      idempotencyKey: "crm-hygiene-agent-2026-09-09-partialslack",
      postSlack: async () => {
        slackCalls += 1;
        return { ok: true };
      },
      sendEmail: async () => ({
        error: { name: "resend_failed", message: "mailbox unavailable" },
      }),
    });
    expect(first.sent).toBe(false);
    expect(first.slackSent).toBe(true);
    expect(slackCalls).toBe(1);
    expect(audit.findByIdempotencyKey("crm-hygiene-agent-2026-09-09-partialslack")?.note).toBe(
      "slack",
    );

    const retry = await deliverHygieneDigest({
      audit,
      batch,
      digest: {
        from: "ops@example.com",
        to: ["ops@example.com"],
        subject: "CRM hygiene batch",
      },
      slackConnectUid: "slack/crm-hygiene-agent",
      slackChannelId: "C0123456789",
      runDate: "2026-09-09",
      idempotencyKey: "crm-hygiene-agent-2026-09-09-partialslack",
      postSlack: async () => {
        slackCalls += 1;
        return { ok: true };
      },
      sendEmail: async () => ({ id: "should-not-send" }),
    });
    expect(retry.replayed).toBe(true);
    expect(slackCalls).toBe(1);
  });

  it("requires Slack or email before a digest can send", () => {
    const config = loadCrmHygieneConfig({
      CRM_HYGIENE_HUBSPOT_CONNECT_UID: "hubspot/crm-hygiene-agent",
    });
    expect(isEmailDeliveryConfigured(config)).toBe(false);
    expect(missingHygieneConfig(config)).toEqual(
      expect.arrayContaining([
        "CRM_HYGIENE_SLACK_CONNECT_UID",
        "CRM_HYGIENE_SLACK_CHANNEL_ID",
      ]),
    );
  });
});
