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
    .max(400)
    .describe("Ingested source id from ingest_rfp_sources, such as sandbox:rfps/acme.md."),
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
  sourceId: z.string().min(1).max(400),
  title: z.string().min(1).max(400),
  kind: z.enum(["rfp", "pack"]),
  origin: z.enum(["drive", "sandbox"]),
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
    "Draft sectioned RFP answers with a hard cite gate. Every claim needs a file citation from the ingested pack. Fails closed when a claim is uncited. Does not write Drive, mailbox, or a portal.",
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
