import { describe, expect, it } from "vitest";

import { replyClaimsAirtableWrite } from "../agent/lib/write-claims";

describe("replyClaimsAirtableWrite", () => {
  it("matches Airtable write claims", () => {
    expect(
      replyClaimsAirtableWrite("Done. I wrote them back to Airtable."),
    ).toBe(true);
    expect(replyClaimsAirtableWrite("I updated the Airtable records.")).toBe(
      true,
    );
  });

  it("does not treat negated statements as write claims", () => {
    expect(
      replyClaimsAirtableWrite(
        "I drafted the themes and did not write them to Airtable.",
      ),
    ).toBe(false);
    expect(replyClaimsAirtableWrite("I will not update the Airtable.")).toBe(
      false,
    );
  });
});
