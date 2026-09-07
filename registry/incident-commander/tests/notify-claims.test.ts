import { describe, expect, it } from "vitest";

import { replyClaimsNotify } from "../agent/lib/notify-claims";

describe("replyClaimsNotify", () => {
  it("matches page and notify claims", () => {
    expect(replyClaimsNotify("Done. I paged the on-call.")).toBe(true);
    expect(replyClaimsNotify("I notified the team in Slack.")).toBe(true);
    expect(replyClaimsNotify("I sent the readout.")).toBe(true);
  });

  it("does not treat negated statements as notify claims", () => {
    expect(
      replyClaimsNotify("I drafted the timeline and did not page anyone."),
    ).toBe(false);
    expect(replyClaimsNotify("I will not notify the channel.")).toBe(false);
    expect(replyClaimsNotify("Draft only. never sent the update.")).toBe(false);
  });
});
