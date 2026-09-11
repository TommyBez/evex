import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  collectOpenQuestions,
  evaluateCiteGate,
  type PackSource,
} from "../lib/cite-gate";

const citationSchema = z.object({
  sourceId: z
    .string()
    .min(1)
    .max(500)
    .describe(
      "Pack path, Drive file id, Drive URL, or ingest sourceId. Example: knowledge-packs/security.md or https://docs.google.com/document/d/FILE_ID",
    ),
  locator: z.string().max(200).optional(),
});

const claimSchema = z.object({
  text: z.string().min(1).max(2000),
  citation: citationSchema,
});

const sectionSchema = z.object({
  heading: z.string().min(1).max(200),
  body: z.string().min(1).max(8000),
  claims: z.array(claimSchema).min(1).max(20),
  openQuestions: z.array(z.string().min(1).max(500)).max(10).optional(),
});

const sourceSchema = z.object({
  sourceId: z.string().min(1).max(500),
  title: z.string().min(1).max(400),
  kind: z.enum(["rfp", "pack"]),
  origin: z.enum(["drive", "sandbox"]),
  path: z.string().max(400).optional(),
  workspacePath: z.string().max(400).optional(),
  driveFileId: z.string().max(200).optional(),
  driveUrl: z.string().max(500).optional(),
});

const draftCitedSectionsInput = z.object({
  rfpTitle: z.string().min(1).max(200),
  sources: z
    .array(sourceSchema)
    .min(1)
    .max(40)
    .describe("Pack sources returned by ingest_rfp_sources."),
  sections: z.array(sectionSchema).min(1).max(30),
});

export default defineTool({
  description:
    "Draft sectioned RFP answers with a hard cite gate. Every claim must cite a pack path and/or Drive file id or URL from the ingested sources. Fails closed when a claim is uncited or the source is missing. Does not write Drive, mailbox, or a portal.",
  inputSchema: draftCitedSectionsInput,
  execute(input) {
    const gate = evaluateCiteGate({
      sections: input.sections,
      sources: input.sources as PackSource[],
    });
    if (!gate.ok) {
      return {
        drafted: false,
        submitted: false,
        sent: false,
        note: gate.note,
        uncited: gate.uncited,
        openQuestions: collectOpenQuestions(input.sections),
      };
    }

    return {
      drafted: true,
      submitted: false,
      sent: false,
      rfpTitle: input.rfpTitle,
      sections: gate.sections,
      citedSourceIds: gate.citedSourceIds,
      openQuestions: collectOpenQuestions(gate.sections),
    };
  },
});
