import { defineTool } from "eve/tools";
import { z } from "zod";

import { createDeadlineStore } from "../lib/deadline-store";
import { ingestRfpSources } from "../lib/ingest";
import { createConfiguredDrive } from "../lib/providers/drive";
import { rfpResponseConfig, siblingStorePath } from "../lib/rfp-config";
import { configuredSandboxRoots } from "../lib/sandbox-paths";

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
    .describe(
      "Google Drive file ids to export into /workspace. Empty exports Docs and PDFs from the configured RFP and knowledge folders.",
    ),
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
      "Existing sandbox paths under rfps/ or knowledge-packs/. The tool registers them and does not return file contents.",
    ),
});

export default defineTool({
  description:
    "List configured Drive RFP and knowledge folders, export Docs and PDFs into /workspace, and register sandbox pack paths. Returns paths and Drive ids only. Read files with built-in read_file, glob, or grep. Never pastes text as write-back.",
  inputSchema: ingestInput,
  async execute(input, ctx) {
    const drive = createConfiguredDrive(rfpResponseConfig);
    if ((input.driveFiles?.length ?? 0) > 0 && !drive.ok) {
      return {
        ok: false,
        materialized: false,
        submitted: false,
        note: drive.note,
        missingEnv: drive.missingEnv,
        sources: [],
        files: [],
      };
    }

    const sandbox = await ctx.getSandbox();
    return ingestRfpSources({
      drive: drive.ok ? drive.value : undefined,
      sandbox: {
        readTextFile: (options) => sandbox.readTextFile(options),
        writeTextFile: (options) => sandbox.writeTextFile(options),
        writeBinaryFile: (options) => sandbox.writeBinaryFile(options),
      },
      sandboxRoots: configuredSandboxRoots(),
      driveFiles: input.driveFiles,
      sandboxPaths: input.sandboxPaths,
      deadlineStore: createDeadlineStore(
        siblingStorePath(rfpResponseConfig.storePath, "rfp-deadlines.json"),
      ),
    });
  },
});
