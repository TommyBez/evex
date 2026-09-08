import { describe, expect, it } from "vitest";
import { always, never, once, resolveApprovalPolicy } from "eve/tools/approval";
import type { ApprovalContext } from "eve/tools/approval";

import sendDigest from "../agent/tools/send_digest";

const alreadyApprovedContext = {
  approvedTools: new Set(["send_digest"]),
  callId: "send-digest-approval",
  toolName: "send_digest",
  toolInput: {
    confirmSend: true,
    idempotencyKey: "competitor-intel-monitor-2026-09-07",
  },
} as ApprovalContext;

describe("send_digest approval", () => {
  it("always pauses for Eve approval before Slack or email send", () => {
    const approval = sendDigest.approval;
    expect(approval).toBeDefined();
    if (!approval) {
      throw new Error("send_digest.approval must be the always() policy");
    }
    const policy = resolveApprovalPolicy(approval);
    expect(typeof policy).toBe("function");
    // defineTool keeps always() as a function. always() still returns
    // "user-approval" after a prior approval; once() would skip the next prompt.
    expect(policy(alreadyApprovedContext)).toBe("user-approval");
    expect(always()(alreadyApprovedContext)).toBe("user-approval");
    expect(once()(alreadyApprovedContext)).toBe("not-applicable");
    expect(never()(alreadyApprovedContext)).toBe("not-applicable");
  });
});
