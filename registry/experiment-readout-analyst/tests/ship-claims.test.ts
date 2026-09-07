import { describe, expect, it } from "vitest";

import { replyClaimsShip } from "../agent/lib/ship-claims";

describe("replyClaimsShip", () => {
  it("matches ship and deploy claims", () => {
    expect(replyClaimsShip("Done. I shipped the variant.")).toBe(true);
    expect(replyClaimsShip("I deployed the change to production.")).toBe(true);
  });

  it("does not treat negated statements as ship claims", () => {
    expect(
      replyClaimsShip("I drafted the readout and did not ship the variant."),
    ).toBe(false);
    expect(replyClaimsShip("I will not deploy the change.")).toBe(false);
  });
});
