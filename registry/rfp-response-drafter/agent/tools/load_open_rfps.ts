import { defineTool } from "eve/tools";
import { z } from "zod";

import { createDeadlineStore } from "../lib/deadline-store";
import { ingestRfpSources } from "../lib/ingest";
import { createConfiguredDrive } from "../lib/providers/drive";
import { rfpResponseConfig, siblingStorePath } from "../lib/rfp-config";
import { configuredSandboxRoots } from "../lib/sandbox-paths";

const loadOpenRfpsInput = z.object({
  sandboxPaths: z
    .array(
      z.object({
        path: z.string().min(1).max(400),
        kind: z.literal("rfp"),
      }),
    )
    .max(20)
    .optional()
    .describe("Optional sandbox RFP paths to ingest before loading deadlines."),
});

export default defineTool({
  description:
    "Ingest configured Drive RFP folders and/or sandbox RFPs, persist structured due dates, and return open RFP rows for the deadline digest. Does not post Slack, send email, or submit a portal.",
  inputSchema: loadOpenRfpsInput,
  async execute(input, ctx) {
    const deadlineStore = createDeadlineStore(
      siblingStorePath(rfpResponseConfig.storePath, "rfp-deadlines.json"),
    );
    const drive = createConfiguredDrive(rfpResponseConfig);
    const sandbox = await ctx.getSandbox();
    const ingested = await ingestRfpSources({
      drive: drive.ok ? drive.value : undefined,
      sandbox: {
        readTextFile: (options) => sandbox.readTextFile(options),
        writeTextFile: (options) => sandbox.writeTextFile(options),
        writeBinaryFile: (options) => sandbox.writeBinaryFile(options),
      },
      sandboxRoots: configuredSandboxRoots(),
      sandboxPaths: input.sandboxPaths,
      deadlineStore,
    });

    const rfps = deadlineStore.list();
    if (rfps.length === 0) {
      return {
        ok: false,
        submitted: false,
        sent: false,
        rfps: [],
        ingested: ingested.ok,
        note: ingested.ok
          ? "Ingest ran but no structured RFP due dates were found. Add a Due: YYYY-MM-DD line to each RFP."
          : ingested.note,
      };
    }

    return {
      ok: true,
      submitted: false,
      sent: false,
      rfps,
      ingested: ingested.ok,
      note: "Open RFP deadlines loaded from ingest plus the persisted deadline store.",
    };
  },
});
