import { describe, expect, it } from "vitest";
import { always, never, once } from "eve/tools/approval";
import type { ApprovalContext, ApprovalPolicy } from "eve/tools/approval";

import sendDigest from "../agent/tools/send_digest";

const alreadyApprovedContext = {
  approvedTools: new Set(["send_digest"]),
  callId: "send-digest-approval",
  toolName: "send_digest",
  toolInput: {
    confirmSend: true,
    idempotencyKey: "competitor-intel-monitor-2026-09-07",
  },
} as unknown as ApprovalContext;

const isApprovalPolicy = (value: unknown): value is ApprovalPolicy =>
  typeof value === "function";

describe("send_digest approval", () => {
  it("always pauses for Eve approval before Slack or email send", () => {
    const approval = sendDigest.approval;
    expect(isApprovalPolicy(approval)).toBe(true);
    if (!isApprovalPolicy(approval)) {
      throw new Error("send_digest.approval must be the always() policy function");
    }
    // defineTool keeps always() as a function, not the string "always".
    // always() still returns "user-approval" after a prior approval; once()
    // would skip the next prompt and never() would skip every prompt.
    expect(approval(alreadyApprovedContext)).toBe("user-approval");
    expect(always()(alreadyApprovedContext)).toBe("user-approval");
    expect(once()(alreadyApprovedContext)).toBe("not-applicable");
    expect(never()(alreadyApprovedContext)).toBe("not-applicable");
  });
});
