import { defineTool } from "eve/tools";
import { z } from "zod";

import type { PackSource } from "../lib/cite-gate";
import { createConfiguredDrive } from "../lib/providers/drive";
import { rfpResponseConfig } from "../lib/rfp-config";
import {
  configuredSandboxRoots,
  isAllowedSandboxPath,
  normalizeSandboxPath,
} from "../lib/sandbox-paths";

const ingestInput = z.object({
  driveFiles: z
    .array(
      z.object({
        fileId: z.string().min(1).max(200),
        kind: z.enum(["rfp", "pack"]),
      }),
    )
    .max(20)
    .optional()
    .describe("Google Drive file ids to read through Connect. Read-only."),
  sandboxPaths: z
    .array(
      z.object({
        path: z.string().min(1).max(400),
        kind: z.enum(["rfp", "pack"]),
      }),
    )
    .max(20)
    .optional()
    .describe(
      "Sandbox paths to materialize. Must sit under RFP_RESPONSE_SANDBOX_ROOTS.",
    ),
});

export default defineTool({
  description:
    "Ingest and materialize an RFP plus knowledge pack from Google Drive Connect and/or sandbox files. Read-only. Never writes Drive, never submits a portal, never pastes text as write-back.",
  inputSchema: ingestInput,
  async execute(input, ctx) {
    const sources: PackSource[] = [];
    const files: {
      sourceId: string;
      title: string;
      kind: "rfp" | "pack";
      origin: "drive" | "sandbox";
      content: string;
    }[] = [];
    const rejected: string[] = [];

    for (const driveFile of input.driveFiles ?? []) {
      const drive = createConfiguredDrive(rfpResponseConfig);
      if (!drive.ok) {
        return {
          ok: false,
          materialized: false,
          note: drive.note,
          missingEnv: drive.missingEnv,
          sources: [],
        };
      }
      const read = await drive.value.readFile({
        fileId: driveFile.fileId,
        kind: driveFile.kind,
      });
      const sourceId = `drive:${read.id}`;
      sources.push({
        sourceId,
        title: read.name,
        kind: driveFile.kind,
        origin: "drive",
      });
      files.push({
        sourceId,
        title: read.name,
        kind: driveFile.kind,
        origin: "drive",
        content: read.content,
      });
    }

    const roots = configuredSandboxRoots();
    for (const sandboxFile of input.sandboxPaths ?? []) {
      const path = normalizeSandboxPath(sandboxFile.path);
      if (!isAllowedSandboxPath(path, roots)) {
        rejected.push(path);
        continue;
      }
      const sandbox = await ctx.getSandbox();
      try {
        const content = await sandbox.readTextFile({ path });
        if (content === null) {
          rejected.push(path);
          continue;
        }
        const sourceId = `sandbox:${path}`;
        sources.push({
          sourceId,
          title: path,
          kind: sandboxFile.kind,
          origin: "sandbox",
        });
        files.push({
          sourceId,
          title: path,
          kind: sandboxFile.kind,
          origin: "sandbox",
          content: content.slice(0, 48_000),
        });
      } catch {
        rejected.push(path);
      }
    }

    if (sources.length === 0) {
      return {
        ok: false,
        materialized: false,
        note:
          rejected.length > 0
            ? `No RFP or pack files materialized. Rejected paths: ${rejected.join(", ")}.`
            : "Provide Drive file ids and/or sandbox paths under the configured roots.",
        rejected,
        sources: [],
      };
    }

    return {
      ok: true,
      materialized: true,
      submitted: false,
      sources,
      files,
      rejected,
    };
  },
});
