import { describe, expect, it } from "vitest";

import { replyClaimsPublish } from "../agent/lib/delivery-claims";
import {
  evaluateDraftWritePath,
  isAllowedDraftWritePath,
} from "../agent/lib/draft-write-paths";
import {
  DEFAULT_PRODUCT_DOCS_ROOTS,
  isAllowedProductDocsPath,
  normalizeProductDocsPath,
  parseProductDocsSearchHitLine,
  productDocsRootsFromEnv,
} from "../agent/lib/product-docs-paths";

describe("normalizeProductDocsPath / PRODUCT_DOCS_ROOTS trailing separators", () => {
  it("strips trailing slashes from roots so child paths still match", () => {
    expect(normalizeProductDocsPath("docs/")).toBe("docs");
    expect(normalizeProductDocsPath("docs//")).toBe("docs");

    const roots = productDocsRootsFromEnv("docs/,help/");
    expect(roots).toEqual(["docs", "help"]);
    expect(isAllowedProductDocsPath("docs/help/billing.md", roots)).toBe(true);
    expect(isAllowedProductDocsPath("docs/help/billing.md", ["docs/"])).toBe(
      true,
    );
  });
});

describe("parseProductDocsSearchHitLine", () => {
  it("parses path:line:text from rg -n -H output", () => {
    expect(
      parseProductDocsSearchHitLine(
        "docs/help/billing.md:12:Refunds within 14 days",
      ),
    ).toEqual({
      path: "docs/help/billing.md",
      line: 12,
      text: "Refunds within 14 days",
    });
  });

  it("drops bare line:text (single-file rg without -H)", () => {
    expect(
      parseProductDocsSearchHitLine("12:Refunds within 14 days"),
    ).toBeNull();
  });
});

describe("replyClaimsPublish", () => {
  it("matches short claims like I published it", () => {
    expect(replyClaimsPublish("Done. I published it.")).toBe(true);
    expect(replyClaimsPublish("I shipped the docs just now.")).toBe(true);
  });

  it("does not treat negated statements as publish claims", () => {
    expect(
      replyClaimsPublish("I drafted the update and did not publish it."),
    ).toBe(false);
    expect(replyClaimsPublish("I will not publish the page.")).toBe(false);
    expect(replyClaimsPublish("Draft only. never published the update.")).toBe(
      false,
    );
  });

  it("does not treat negated GitHub actions as publish claims", () => {
    expect(replyClaimsPublish("I never opened a PR.")).toBe(false);
    expect(replyClaimsPublish("I have not opened a pull request.")).toBe(false);
    expect(replyClaimsPublish("I never published a PR review.")).toBe(false);
    expect(replyClaimsPublish("I never merged the PR.")).toBe(false);
  });

  it("still treats an affirmative GitHub action as a claim", () => {
    expect(replyClaimsPublish("I opened a PR.")).toBe(true);
    expect(replyClaimsPublish("I published a PR review.")).toBe(true);
  });
});

describe("draft write paths", () => {
  const roots = DEFAULT_PRODUCT_DOCS_ROOTS;

  it("allows files under the dedicated drafts directory", () => {
    expect(isAllowedDraftWritePath("drafts/update.md", roots)).toBe(true);
    expect(
      isAllowedDraftWritePath("/workspace/drafts/billing-update.md", roots),
    ).toBe(true);
    expect(evaluateDraftWritePath("drafts/update.md", roots)).toEqual({
      ok: true,
      absolutePath: "/workspace/drafts/update.md",
    });
  });

  it("rejects product-docs roots and other protected paths", () => {
    expect(isAllowedDraftWritePath("docs/help/billing.md", roots)).toBe(false);
    expect(
      isAllowedDraftWritePath("/workspace/docs/help/billing.md", roots),
    ).toBe(false);
    expect(isAllowedDraftWritePath("help/refunds.md", roots)).toBe(false);
    expect(isAllowedDraftWritePath("support/faq.md", roots)).toBe(false);
    expect(isAllowedDraftWritePath("agent/instructions.md", roots)).toBe(false);
    expect(isAllowedDraftWritePath("/etc/passwd", roots)).toBe(false);
    expect(isAllowedDraftWritePath("$HOME/drafts/update.md", roots)).toBe(
      false,
    );
    expect(
      isAllowedDraftWritePath("/workspace/drafts/../docs/help/billing.md", roots),
    ).toBe(false);
    expect(isAllowedDraftWritePath("drafts", roots)).toBe(false);
  });
}););
