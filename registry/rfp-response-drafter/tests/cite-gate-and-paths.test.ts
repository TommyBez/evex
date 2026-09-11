import { describe, expect, it } from "vitest";

import {
  evaluateCiteGate,
  evaluateSmeWriteGate,
  resolveCitedSource,
} from "../agent/lib/cite-gate";
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
    path: "knowledge-packs/security.md",
    workspacePath: "/workspace/knowledge-packs/security.md",
  },
  {
    sourceId: "drive:1AbCDriveFile",
    title: "Security pack",
    kind: "pack" as const,
    origin: "drive" as const,
    path: "knowledge-packs/Security pack.txt",
    workspacePath: "/workspace/knowledge-packs/Security pack.txt",
    driveFileId: "1AbCDriveFile",
    driveUrl: "https://docs.google.com/document/d/1AbCDriveFile/edit",
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

  it("refuses on a missing Drive URL or pack path", () => {
    expect(
      resolveCitedSource(
        "https://docs.google.com/document/d/not-in-pack/edit",
        pack,
      ),
    ).toBeUndefined();
    const result = evaluateCiteGate({
      sources: pack,
      sections: [
        {
          heading: "Encryption",
          body: "We invent a claim.",
          claims: [
            {
              text: "We invent a claim.",
              citation: {
                sourceId: "https://drive.google.com/file/d/missing-id/view",
              },
            },
          ],
        },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.drafted).toBe(false);
  });

  it("accepts a pack path, Drive file id, or Drive URL", () => {
    const pathHit = evaluateCiteGate({
      sources: pack,
      sections: [
        {
          heading: "Encryption",
          body: "We encrypt at rest.",
          claims: [
            {
              text: "We encrypt at rest.",
              citation: {
                sourceId: "/workspace/knowledge-packs/security.md",
                locator: "p.2",
              },
            },
          ],
        },
      ],
    });
    expect(pathHit).toMatchObject({
      ok: true,
      drafted: true,
      citedSourceIds: ["sandbox:knowledge-packs/security.md"],
    });

    const idHit = evaluateCiteGate({
      sources: pack,
      sections: [
        {
          heading: "Controls",
          body: "We hold SOC 2.",
          claims: [
            {
              text: "We hold SOC 2.",
              citation: { sourceId: "1AbCDriveFile" },
            },
          ],
        },
      ],
    });
    expect(idHit.ok).toBe(true);

    const urlHit = evaluateCiteGate({
      sources: pack,
      sections: [
        {
          heading: "Controls",
          body: "We hold SOC 2.",
          claims: [
            {
              text: "We hold SOC 2.",
              citation: {
                sourceId: "https://docs.google.com/document/d/1AbCDriveFile/edit",
              },
            },
          ],
        },
      ],
    });
    expect(urlHit).toMatchObject({
      ok: true,
      citedSourceIds: ["drive:1AbCDriveFile"],
    });
  });
});

describe("SME write gate", () => {
  it("blocks write-back while open questions lack SME approval", () => {
    expect(
      evaluateSmeWriteGate({
        openQuestions: ["What is the SOC 2 report date?"],
      }),
    ).toMatchObject({ ok: false });
    expect(
      evaluateSmeWriteGate({
        openQuestions: ["What is the SOC 2 report date?"],
        smeApproved: true,
      }),
    ).toEqual({ ok: true });
    expect(evaluateSmeWriteGate({ openQuestions: [] })).toEqual({ ok: true });
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
