import { describe, expect, it } from "vitest";

import { ingestRfpSources } from "../agent/lib/ingest";
import { ingestOutputHasFileContent } from "../agent/lib/materialize";
import { createDriveClient } from "../agent/lib/providers/drive";
import { loadRfpResponseConfig } from "../agent/lib/rfp-config";
import type { DriveClient, DriveExport, DriveFile } from "../agent/lib/providers/types";

const GOOGLE_DOC = "application/vnd.google-apps.document";
const PDF = "application/pdf";

function memorySandbox(seed: Record<string, string> = {}) {
  const text = new Map<string, string>(Object.entries(seed));
  const binary = new Map<string, Uint8Array>();
  return {
    text,
    binary,
    api: {
      async readTextFile({ path }: { path: string }) {
        return text.get(path) ?? null;
      },
      async writeTextFile({ path, content }: { path: string; content: string }) {
        text.set(path, content);
      },
      async writeBinaryFile({
        path,
        content,
      }: {
        path: string;
        content: Uint8Array;
      }) {
        binary.set(path, content);
      },
    },
  };
}

function fakeDrive(input: {
  readonly rfp: readonly DriveFile[];
  readonly pack: readonly DriveFile[];
  readonly exports: Record<string, DriveExport>;
}): DriveClient {
  return {
    async listFiles() {
      return [...input.rfp, ...input.pack];
    },
    async listConfiguredFolders() {
      return {
        rfp: { role: "rfp", folderId: "rfp-folder", files: input.rfp },
        pack: { role: "pack", folderId: "pack-folder", files: input.pack },
      };
    },
    async exportFile({ fileId, kind }) {
      const exported = input.exports[fileId];
      if (!exported) {
        throw new Error(`missing export ${fileId}`);
      }
      return { ...exported, kind };
    },
    async readFile(options) {
      return this.exportFile(options);
    },
    async createDraftDoc() {
      return {
        drafted: true,
        submitted: false,
        sent: false,
        provider: "drive",
        documentId: "doc-1",
        title: "DRAFT",
      };
    },
  };
}

describe("workspace ingest", () => {
  it("exports Docs and PDFs into workspace paths and never returns file contents", async () => {
    const sandbox = memorySandbox({
      "rfps/local.md": "# local rfp",
    });
    const result = await ingestRfpSources({
      sandbox: sandbox.api,
      sandboxRoots: ["rfps", "knowledge-packs"],
      sandboxPaths: [{ path: "rfps/local.md", kind: "rfp" }],
      drive: fakeDrive({
        rfp: [
          {
            id: "doc-rfp",
            name: "Acme RFP",
            mimeType: GOOGLE_DOC,
            webViewLink: "https://docs.google.com/document/d/doc-rfp/edit",
          },
        ],
        pack: [
          {
            id: "pdf-pack",
            name: "Security pack.pdf",
            mimeType: PDF,
          },
        ],
        exports: {
          "doc-rfp": {
            id: "doc-rfp",
            name: "Acme RFP",
            mimeType: GOOGLE_DOC,
            kind: "rfp",
            encoding: "text",
            text: "Q1: Describe encryption.",
            driveUrl: "https://docs.google.com/document/d/doc-rfp/edit",
            truncated: false,
            charCount: 24,
          },
          "pdf-pack": {
            id: "pdf-pack",
            name: "Security pack.pdf",
            mimeType: PDF,
            kind: "pack",
            encoding: "binary",
            bytes: new Uint8Array([37, 80, 68, 70]),
            driveUrl: "https://drive.google.com/file/d/pdf-pack/view",
            truncated: false,
            byteCount: 4,
          },
        },
      }),
    });

    expect(result.ok).toBe(true);
    expect(result.materialized).toBe(true);
    expect(ingestOutputHasFileContent(result)).toBe(false);
    expect(result.files.some((file) => "content" in file)).toBe(false);
    expect(sandbox.text.get("rfps/Acme RFP--doc-rfp.txt")).toBe(
      "Q1: Describe encryption.",
    );
    expect(sandbox.binary.get("knowledge-packs/Security pack--pdf-pack.pdf")).toEqual(
      new Uint8Array([37, 80, 68, 70]),
    );
    expect(result.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "rfps/Acme RFP--doc-rfp.txt",
          driveFileId: "doc-rfp",
          driveUrl: "https://docs.google.com/document/d/doc-rfp/edit",
        }),
        expect.objectContaining({
          path: "knowledge-packs/Security pack--pdf-pack.pdf",
          driveFileId: "pdf-pack",
        }),
        expect.objectContaining({
          path: "rfps/local.md",
          origin: "sandbox",
        }),
      ]),
    );
    expect(result.folders?.rfp.folderId).toBe("rfp-folder");
    expect(result.folders?.pack.folderId).toBe("pack-folder");
    expect(result.note).toMatch(/read_file/);
  });
});

describe("Drive Connect folders", () => {
  it("lists configured RFP and knowledge folders and exports a Doc plus PDF", async () => {
    const urls: string[] = [];
    const client = createDriveClient(
      loadRfpResponseConfig({
        RFP_RESPONSE_GOOGLE_CONNECT_UID: "google/rfp-response-drafter",
        RFP_RESPONSE_DRIVE_RFP_FOLDER_ID: "rfp-folder",
        RFP_RESPONSE_DRIVE_PACK_FOLDER_ID: "pack-folder",
      }),
      async (input, init) => {
        const url = String(input);
        urls.push(`${init?.method ?? "GET"} ${url}`);
        if (url.includes("q=") && url.includes("rfp-folder")) {
          return Response.json({
            files: [
              {
                id: "doc-rfp",
                name: "Acme RFP",
                mimeType: GOOGLE_DOC,
                webViewLink: "https://docs.google.com/document/d/doc-rfp/edit",
              },
            ],
          });
        }
        if (url.includes("q=") && url.includes("pack-folder")) {
          return Response.json({
            files: [{ id: "pdf-pack", name: "Security.pdf", mimeType: PDF }],
          });
        }
        if (url.includes("/files/doc-rfp/export")) {
          return new Response("Exported doc", { status: 200 });
        }
        if (url.includes("/files/pdf-pack") && url.includes("alt=media")) {
          return new Response(new Uint8Array([37, 80, 68, 70]), { status: 200 });
        }
        if (url.includes("/files/doc-rfp?")) {
          return Response.json({
            id: "doc-rfp",
            name: "Acme RFP",
            mimeType: GOOGLE_DOC,
            webViewLink: "https://docs.google.com/document/d/doc-rfp/edit",
          });
        }
        if (url.includes("/files/pdf-pack?")) {
          return Response.json({
            id: "pdf-pack",
            name: "Security.pdf",
            mimeType: PDF,
          });
        }
        return Response.json({ files: [] });
      },
      async () => ({ accessToken: "drive-token", expiresIn: 3600 }),
    );

    const folders = await client.listConfiguredFolders();
    expect(folders.rfp.folderId).toBe("rfp-folder");
    expect(folders.pack.folderId).toBe("pack-folder");
    expect(folders.rfp.files[0]?.id).toBe("doc-rfp");
    expect(folders.pack.files[0]?.id).toBe("pdf-pack");

    const doc = await client.exportFile({ fileId: "doc-rfp", kind: "rfp" });
    expect(doc.encoding).toBe("text");
    expect(doc.text).toBe("Exported doc");
    expect(doc.driveUrl).toContain("docs.google.com");

    const pdf = await client.exportFile({ fileId: "pdf-pack", kind: "pack" });
    expect(pdf.encoding).toBe("binary");
    expect(pdf.bytes).toEqual(new Uint8Array([37, 80, 68, 70]));

    expect(urls.every((url) => url.startsWith("GET"))).toBe(true);
    expect(urls.some((url) => url.includes("/export?mimeType=text/plain"))).toBe(
      true,
    );
    expect(urls.some((url) => url.includes("alt=media"))).toBe(true);
  });
});
