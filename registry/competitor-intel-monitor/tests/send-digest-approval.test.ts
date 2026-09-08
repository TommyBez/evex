import { describe, expect, it } from "vitest";

import sendDigest from "../agent/tools/send_digest";

describe("send_digest approval", () => {
  it("always pauses for Eve approval before Slack or email send", () => {
    expect(sendDigest.approval).toBeDefined();
    expect(sendDigest.approval).not.toBeNull();
  });
});
