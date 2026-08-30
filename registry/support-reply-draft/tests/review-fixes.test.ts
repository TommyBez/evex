import { describe, expect, it } from "vitest";

import { replyClaimsDelivery } from "../agent/lib/delivery-claims";
import {
  isAllowedProductDocsPath,
  normalizeProductDocsPath,
  parseProductDocsSearchHitLine,
  productDocsRootsFromEnv,
} from "../agent/lib/product-docs-paths";

describe("normalizeProductDocsPath / PRODUCT_DOCS_ROOTS trailing separators", () => {
  it("strips trailing slashes from roots so child paths still match", () => {
    expect(normalizeProductDocsPath("docs/help/")).toBe("docs/help");
    expect(normalizeProductDocsPath("docs/help//")).toBe("docs/help");

    const roots = productDocsRootsFromEnv("docs/help/,docs/support/");
    expect(roots).toEqual(["docs/help", "docs/support"]);
    expect(isAllowedProductDocsPath("docs/help/billing.md", roots)).toBe(true);
    expect(
      isAllowedProductDocsPath("docs/help/billing.md", ["docs/help/"]),
    ).toBe(true);
  });
});

describe("parseProductDocsSearchHitLine", () => {
  it("parses path:line:text from rg -n -H output", () => {
    expect(
      parseProductDocsSearchHitLine("docs/help/billing.md:12:Refunds within 14 days"),
    ).toEqual({
      path: "docs/help/billing.md",
      line: 12,
      text: "Refunds within 14 days",
    });
  });

  it("drops bare line:text (single-file rg without -H)", () => {
    expect(parseProductDocsSearchHitLine("12:Refunds within 14 days")).toBeNull();
  });
});

describe("replyClaimsDelivery", () => {
  it("matches short claims like I sent it", () => {
    expect(replyClaimsDelivery("Done — I sent it.")).toBe(true);
    expect(replyClaimsDelivery("I sent the email just now.")).toBe(true);
  });

  it("does not treat negated statements as delivery claims", () => {
    expect(replyClaimsDelivery("I drafted the reply and did not send it.")).toBe(
      false,
    );
    expect(replyClaimsDelivery("I will not send the email.")).toBe(false);
    expect(replyClaimsDelivery("Draft only — never sent the message.")).toBe(
      false,
    );
  });
});
