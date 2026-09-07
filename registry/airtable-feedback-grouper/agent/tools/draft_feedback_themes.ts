import { defineTool } from "eve/tools";
import { z } from "zod";

const themeSchema = z.object({
  title: z.string().min(1).max(120).describe("Short theme name."),
  summary: z
    .string()
    .min(1)
    .max(800)
    .describe("One or two sentences describing the theme."),
  exampleQuotes: z
    .array(z.string().min(1).max(600))
    .min(1)
    .max(6)
    .describe("Quotes copied from the pasted export. Do not invent wording."),
});

const draftFeedbackThemesInput = z.object({
  themes: z
    .array(themeSchema)
    .min(1)
    .max(12)
    .describe("Clustered feedback themes with example quotes."),
  rowCount: z
    .number()
    .int()
    .min(1)
    .max(5000)
    .describe("How many pasted rows you grouped."),
  leftoverCount: z
    .number()
    .int()
    .min(0)
    .max(5000)
    .optional()
    .describe("Rows too thin to group. Defaults to 0."),
});

export type DraftFeedbackThemesOutput = {
  drafted: true;
  themes: {
    title: string;
    summary: string;
    exampleQuotes: string[];
  }[];
  rowCount: number;
  leftoverCount: number;
  writtenToAirtable: false;
};

/**
 * Records clustered feedback themes with example quotes.
 * Intentionally has no Eve approval. Never writes to Airtable.
 */
export default defineTool({
  description:
    "Draft clustered Airtable feedback themes with example quotes from the pasted export. Call once when the draft is ready. Does not write to Airtable or require an Airtable token. Never claim records were updated.",
  inputSchema: draftFeedbackThemesInput,
  execute(input): DraftFeedbackThemesOutput {
    return {
      drafted: true,
      themes: input.themes,
      rowCount: input.rowCount,
      leftoverCount: input.leftoverCount ?? 0,
      writtenToAirtable: false,
    };
  },
  toModelOutput(output) {
    return {
      type: "json",
      value: {
        drafted: true,
        writtenToAirtable: false,
        themeCount: output.themes.length,
        rowCount: output.rowCount,
        leftoverCount: output.leftoverCount,
        themeTitles: output.themes.map((theme) => theme.title),
      },
    };
  },
});
