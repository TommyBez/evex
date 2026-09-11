import { describe, expect, it } from "vitest";

import { evaluateCiteGate } from "../agent/lib/cite-gate";
import {
  isAllowedSandboxPath,
  normalizeSandboxPath,
} from "../agent/lib/sandbox-paths";
import { DEFAULT_SANDBOX_ROOTS } from "../agent/lib/rfp-config";

const pack = [
  {
    sourceId: "sandbox:knowledge-packs/security.md",
    title: "knowledge-packs/security.md",
    kind: "pack" as const,
    origin: "sandbox" as const,
  },
];

describe("cite gate", () => {
  it("fails closed when a claim has no citation", () => {
    const result = evaluateCiteGate({
      sources: pack,
      sections: [
        {
          heading: "Encryption",
          body: "We encrypt at rest.",
          claims: [
            {
              text: "We encrypt at rest.",
              citation: { sourceId: "" },
            },
          ],
        },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.drafted).toBe(false);
    if (!result.ok) {
      expect(result.uncited.some((item) => item.includes("uncited"))).toBe(true);
    }
  });

  it("fails closed when the citation is not in the pack", () => {
    const result = evaluateCiteGate({
      sources: pack,
      sections: [
        {
          heading: "Encryption",
          body: "We invent a claim.",
          claims: [
            {
              text: "We invent a claim.",
              citation: { sourceId: "sandbox:secrets/notes.md" },
            },
          ],
        },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.uncited[0]).toContain("unknown citation");
    }
  });

  it("passes when every claim cites an ingested file", () => {
    const result = evaluateCiteGate({
      sources: pack,
      sections: [
        {
          heading: "Encryption",
          body: "We encrypt at rest.",
          claims: [
            {
              text: "We encrypt at rest.",
              citation: {
                sourceId: "sandbox:knowledge-packs/security.md",
                locator: "p.2",
              },
            },
          ],
        },
      ],
    });
    expect(result).toMatchObject({
      ok: true,
      drafted: true,
      citedSourceIds: ["sandbox:knowledge-packs/security.md"],
    });
  });
});

describe("sandbox path allowlist", () => {
  it("materializes RFP and pack roots and rejects traversal", () => {
    expect(normalizeSandboxPath("/workspace/rfps/acme.md")).toBe("rfps/acme.md");
    expect(isAllowedSandboxPath("rfps/acme.md", DEFAULT_SANDBOX_ROOTS)).toBe(
      true,
    );
    expect(
      isAllowedSandboxPath("knowledge-packs/security.md", DEFAULT_SANDBOX_ROOTS),
    ).toBe(true);
    expect(isAllowedSandboxPath("../secrets/notes.md", DEFAULT_SANDBOX_ROOTS)).toBe(
      false,
    );
    expect(isAllowedSandboxPath("src/index.ts", DEFAULT_SANDBOX_ROOTS)).toBe(
      false,
    );
  });
});
