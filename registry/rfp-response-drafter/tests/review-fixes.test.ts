import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { createDeadlineStore, extractDueDate } from "../agent/lib/deadline-store";
import { ingestRfpSources } from "../agent/lib/ingest";
import { uniqueDriveFilename } from "../agent/lib/materialize";
import { createDriveClient } from "../agent/lib/providers/drive";
import { loadRfpResponseConfig } from "../agent/lib/rfp-config";
import { createSmeStore } from "../agent/lib/sme-store";
import { executeApprovedWrite, preflightWriteback } from "../agent/lib/write-back";

const GOOGLE_DOC = "application/vnd.google-apps.document";

describe("SME approval record", () => {
  it("does not treat a Slack post as approval", () => {
    const store = createSmeStore(
      path.join(mkdtempSync(path.join(tmpdir(), "rfp-sme-")), "sme.json"),
    );
    const pending = store.createPending({
      rfpId: "acme-2026",
      rfpTitle: "Acme",
      questions: ["What is the SOC 2 report date?"],
    });
    expect(pending.status).toBe("pending");
    expect(store.findApproved("acme-2026")).toBeUndefined();
    const approved = store.approve({
      smeRequestId: pending.smeRequestId,
      reply: "SOC 2 report date is 2025-01-15.",
    });
    expect(approved?.status).toBe("approved");
    expect(store.findApproved("acme-2026")?.smeRequestId).toBe(
      pending.smeRequestId,
    );
  });
});

describe("Drive export completeness", () => {
  it("writes the full Doc export and reports truncation metadata", async () => {
    const fullText = "Q".repeat(60_000);
    const client = createDriveClient(
      loadRfpResponseConfig({
        RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
      }),
      async (input) => {
        const url = String(input);
        if (url.includes("/export")) {
          return new Response(fullText, { status: 200 });
        }
        return Response.json({
          id: "doc-long",
          name: "Long RFP",
          mimeType: GOOGLE_DOC,
        });
      },
      async () => ({ accessToken: "drive-token", expiresIn: 3600 }),
    );
    const exported = await client.exportFile({ fileId: "doc-long", kind: "rfp" });
    expect(exported.truncated).toBe(false);
    expect(exported.charCount).toBe(60_000);
    expect(exported.text).toBe(fullText);
    expect(exported.chunkCount).toBe(1);
  });
});

describe("unique Drive materialize paths", () => {
  it("includes the Drive file id so same-named files do not collide", () => {
    expect(
      uniqueDriveFilename("Acme RFP", GOOGLE_DOC, "file-one"),
    ).toBe("Acme RFP--file-one.txt");
    expect(
      uniqueDriveFilename("Acme RFP", GOOGLE_DOC, "file-two"),
    ).toBe("Acme RFP--file-two.txt");
  });

  it("persists structured deadlines from ingested RFP text", async () => {
    const deadlineStore = createDeadlineStore(
      path.join(mkdtempSync(path.join(tmpdir(), "rfp-due-")), "due.json"),
    );
    const text = new Map<string, string>([
      ["rfps/local.md", "Acme questionnaire\nDue: 2026-09-20\n"],
    ]);
    const result = await ingestRfpSources({
      sandbox: {
        readTextFile: async ({ path: filePath }) => text.get(filePath) ?? null,
        writeTextFile: async () => undefined,
        writeBinaryFile: async () => undefined,
      },
      sandboxRoots: ["rfps", "knowledge-packs"],
      sandboxPaths: [{ path: "rfps/local.md", kind: "rfp" }],
      deadlineStore,
    });
    expect(result.ok).toBe(true);
    expect(extractDueDate("Due: 2026-09-20")).toBe("2026-09-20");
    expect(deadlineStore.list()).toEqual([
      expect.objectContaining({
        title: "rfps/local.md",
        dueDate: "2026-09-20",
      }),
    ]);
  });
});

describe("write-back preflight", () => {
  it("validates Drive and mailbox before either write when target is both", async () => {
    const config = loadRfpResponseConfig({
      RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
      RFP_RESPONSE_WRITEBACK: "both",
    });
    expect(preflightWriteback("both", config).ok).toBe(false);
    let driveWrites = 0;
    const written = await executeApprovedWrite({
      target: "both",
      config,
      writeDrive: async () => {
        driveWrites += 1;
        return {
          ok: true,
          value: { documentId: "should-not-write" },
        };
      },
      writeMailbox: async () => {
        throw new Error("mailbox should not run");
      },
    });
    expect(written.drafted).toBe(false);
    if (!written.drafted) {
      expect(written.preflightFailed).toBe(true);
    }
    expect(driveWrites).toBe(0);
  });

  it("reports explicit partial success if Drive wrote and mailbox then fails", async () => {
    const config = loadRfpResponseConfig({
      RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
      RFP_RESPONSE_DRAFT_TO: "sme@example.com",
      RFP_RESPONSE_WRITEBACK: "both",
    });
    expect(preflightWriteback("both", config).ok).toBe(true);
    const written = await executeApprovedWrite({
      target: "both",
      config,
      writeDrive: async () => ({
        ok: true,
        value: { documentId: "doc-partial" },
      }),
      writeMailbox: async () => ({
        ok: false,
        note: "Mailbox API failed after preflight.",
        missingEnv: [],
      }),
    });
    expect(written.drafted).toBe(true);
    if (written.drafted) {
      expect(written.partial).toBe(true);
      expect(written.drive).toEqual({ documentId: "doc-partial" });
      expect(written.note).toMatch(/mailbox write failed/i);
    }
  });
});

describe("deadline schedule", () => {
  it("requires ingest and load_open_rfps so preview has rows", () => {
    const source = readFileSync(
      path.join(import.meta.dirname, "../agent/schedules/rfp-deadline-digest.ts"),
      "utf8",
    );
    expect(source).toContain("ingest_rfp_sources");
    expect(source).toContain("load_open_rfps");
    expect(source).toContain("claimed atomically");
  });
});

describe("ask_sme_questions contract", () => {
  it("never sets smeApproved true after a Slack accept", () => {
    const source = readFileSync(
      path.join(import.meta.dirname, "../agent/tools/ask_sme_questions.ts"),
      "utf8",
    );
    expect(source).toContain("smeApproved: false");
    expect(source).not.toContain("smeApproved: true");
    expect(source).toContain("createPending");
    const writeSource = readFileSync(
      path.join(import.meta.dirname, "../agent/tools/write_approved_draft.ts"),
      "utf8",
    );
    expect(writeSource).toContain("findApproved");
    expect(writeSource).not.toMatch(/smeApproved:\s*z\.boolean/);
  });
});
