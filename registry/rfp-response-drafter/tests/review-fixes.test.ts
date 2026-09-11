import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { parseIsoDate, withAging } from "../agent/lib/aging";
import { resolveCitedSource } from "../agent/lib/cite-gate";
import { createDeadlineStore, extractDueDate } from "../agent/lib/deadline-store";
import { createDeliveryStore } from "../agent/lib/delivery-store";
import {
  buildDeadlineDigest,
  resolveDigestDeliveryKey,
} from "../agent/lib/digest";
import { ingestRfpSources } from "../agent/lib/ingest";
import { uniqueDriveFilename } from "../agent/lib/materialize";
import { createDriveClient } from "../agent/lib/providers/drive";
import { createGmailMailbox } from "../agent/lib/providers/gmail";
import {
  loadRfpResponseConfig,
  missingMailboxEnv,
  missingWritebackEnv,
} from "../agent/lib/rfp-config";
import { createResendSender } from "../agent/lib/resend-email";
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

describe("invalid due dates", () => {
  it("does not treat an unparseable due date as due today", () => {
    expect(parseIsoDate("not-a-date")).toBeNull();
    expect(parseIsoDate("2026-13-40")).toBeNull();
    expect(
      withAging({ id: "bad", title: "Bad", dueDate: "invalid" }, new Date("2026-09-11T00:00:00.000Z")),
    ).toBeNull();
    const draft = buildDeadlineDigest(
      [
        { id: "good", title: "Acme", dueDate: "2026-09-20" },
        { id: "bad", title: "Broken", dueDate: "soon" },
      ],
      { runDate: "2026-09-11", now: new Date("2026-09-11T00:00:00.000Z") },
    );
    expect(draft.upcomingCount).toBe(1);
    expect(draft.aging["due-today"]).toBe(0);
  });
});

describe("citation identity", () => {
  it("does not resolve a citation by source title alone", () => {
    expect(
      resolveCitedSource("Security pack", [
        {
          sourceId: "drive:one",
          title: "Security pack",
          kind: "pack",
          origin: "drive",
          driveFileId: "one",
        },
        {
          sourceId: "drive:two",
          title: "Security pack",
          kind: "pack",
          origin: "drive",
          driveFileId: "two",
        },
      ]),
    ).toBeUndefined();
  });
});

describe("delivery store fail-closed", () => {
  it("propagates parse and schema errors instead of treating them as empty", () => {
    const filePath = path.join(
      mkdtempSync(path.join(tmpdir(), "rfp-corrupt-")),
      "store.json",
    );
    writeFileSync(filePath, "{not-json");
    expect(() => createDeliveryStore(filePath).find("k")).toThrow(/JSON|Unexpected/);
    writeFileSync(filePath, `${JSON.stringify({ deliveries: "nope" })}\n`);
    expect(() => createDeliveryStore(filePath).find("k")).toThrow(/corrupt/);
  });
});

describe("digest runDate and email text", () => {
  it("rejects a non-calendar runDate before key generation", () => {
    expect(
      resolveDigestDeliveryKey({
        runDate: "invalid",
        idempotencyKey: "rfp-response-drafter-invalid",
      }),
    ).toMatchObject({ ok: false, expected: "rfp-response-drafter-YYYY-MM-DD" });
    expect(() =>
      buildDeadlineDigest([], { runDate: "invalid" }),
    ).toThrow(/YYYY-MM-DD/);
  });

  it("keeps email plain text unescaped from Slack mrkdwn", () => {
    const draft = buildDeadlineDigest(
      [{ id: "acme", title: "A&B RFP", dueDate: "2026-09-20" }],
      { runDate: "2026-09-11", now: new Date("2026-09-11T00:00:00.000Z") },
    );
    expect(draft.slackText).toContain("A&amp;B RFP");
    expect(draft.text).toContain("A&B RFP");
    expect(draft.text).not.toContain("A&amp;B RFP");
  });
});

describe("ingest payload invariant", () => {
  it("rejects a Drive export that lacks its declared payload", async () => {
    const result = await ingestRfpSources({
      sandbox: {
        readTextFile: async () => null,
        writeTextFile: async () => undefined,
        writeBinaryFile: async () => undefined,
      },
      sandboxRoots: ["rfps", "knowledge-packs"],
      drive: {
        async listFiles() {
          return [];
        },
        async listConfiguredFolders() {
          return {
            rfp: {
              role: "rfp",
              folderId: "rfp-folder",
              files: [{ id: "empty-doc", name: "Empty", mimeType: GOOGLE_DOC }],
            },
            pack: { role: "pack", folderId: "pack-folder", files: [] },
          };
        },
        async exportFile() {
          return {
            id: "empty-doc",
            name: "Empty",
            mimeType: GOOGLE_DOC,
            kind: "rfp" as const,
            encoding: "text" as const,
            driveUrl: "https://docs.google.com/document/d/empty-doc/edit",
            truncated: false,
          };
        },
        async readFile(options) {
          return this.exportFile(options);
        },
        async createDraftDoc() {
          throw new Error("unused");
        },
      },
    });
    expect(result.ok).toBe(false);
    expect(result.rejected.some((item) => item.includes("missing text payload"))).toBe(
      true,
    );
  });
});

describe("Drive listing pagination", () => {
  it("follows nextPageToken until the folder is exhausted", async () => {
    const urls: string[] = [];
    const client = createDriveClient(
      loadRfpResponseConfig({
        RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
        RFP_RESPONSE_DRIVE_RFP_FOLDER_ID: "rfp-folder",
      }),
      async (input) => {
        const url = String(input);
        urls.push(url);
        if (url.includes("pageToken=page-2")) {
          return Response.json({
            files: [{ id: "file-2", name: "Second", mimeType: GOOGLE_DOC }],
          });
        }
        return Response.json({
          files: [{ id: "file-1", name: "First", mimeType: GOOGLE_DOC }],
          nextPageToken: "page-2",
        });
      },
      async () => ({ accessToken: "drive-token", expiresIn: 3600 }),
    );
    const files = await client.listFiles({ folderId: "rfp-folder" });
    expect(files.map((file) => file.id)).toEqual(["file-1", "file-2"]);
    expect(urls[0]).toContain("fields=nextPageToken");
    expect(urls[1]).toContain("pageToken=page-2");
  });
});

describe("draft resource ids", () => {
  it("refuses Drive or Gmail success without a provider id", async () => {
    const drive = createDriveClient(
      loadRfpResponseConfig({
        RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
      }),
      async () => Response.json({ name: "DRAFT" }),
      async () => ({ accessToken: "token", expiresIn: 3600 }),
    );
    await expect(
      drive.createDraftDoc({ title: "DRAFT", body: "body" }),
    ).rejects.toThrow(/document id/);

    const mailbox = createGmailMailbox(
      loadRfpResponseConfig({
        RFP_RESPONSE_MAILBOX_PROVIDER: "gmail",
        RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
        RFP_RESPONSE_DRAFT_TO: "sme@example.com",
      }),
      async () => Response.json({ message: { id: "m1" } }),
      async () => ({ accessToken: "token", expiresIn: 3600 }),
    );
    await expect(
      mailbox.createDraft({
        to: "sme@example.com",
        subject: "DRAFT",
        body: "body",
        rfpId: "acme",
      }),
    ).rejects.toThrow(/draft id/);
  });
});

describe("Resend transport", () => {
  it("returns a typed error when the request is aborted or throws", async () => {
    const sender = createResendSender({
      apiKey: "re_test",
      fetchImpl: async () => {
        throw new Error("The operation was aborted");
      },
    });
    await expect(
      sender({
        from: "digest@example.com",
        to: ["ops@example.com"],
        subject: "digest",
        html: "<p>hi</p>",
        text: "hi",
        idempotencyKey: "k",
      }),
    ).resolves.toMatchObject({
      error: { name: "resend_transport_failed" },
    });
  });
});

describe("mailbox write-back fail-closed", () => {
  it("reports missing mailbox config for mailbox and both targets", () => {
    expect(
      missingMailboxEnv(loadRfpResponseConfig({})),
    ).toEqual(["RFP_RESPONSE_MAILBOX_PROVIDER"]);
    expect(
      missingWritebackEnv(
        loadRfpResponseConfig({
          RFP_RESPONSE_WRITEBACK: "mailbox",
        }),
      ),
    ).toEqual(["RFP_RESPONSE_MAILBOX_PROVIDER"]);
    expect(
      missingWritebackEnv(
        loadRfpResponseConfig({
          RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
          RFP_RESPONSE_WRITEBACK: "both",
        }),
      ),
    ).toEqual(["RFP_RESPONSE_DRAFT_TO"]);
  });
});

describe("eval gates", () => {
  it("hard-fails cite-gate and portal-submit evals", () => {
    const cite = readFileSync(
      path.join(import.meta.dirname, "../evals/cite-gate.eval.ts"),
      "utf8",
    );
    expect(cite).toContain('t.calledTool("draft_cited_sections").gate()');
    expect(cite).not.toContain('t.calledTool("draft_cited_sections").soft()');
    const portal = readFileSync(
      path.join(import.meta.dirname, "../evals/never-portal-submit.eval.ts"),
      "utf8",
    );
    expect(portal).toContain("uploaded to (the )?vendor portal");
    expect(portal).toContain("equals(false).gate()");
    expect(portal).not.toContain("equals(false).soft()");
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
