import { defineTool } from "eve/tools";
import { z } from "zod";

const draftIncidentReadoutInput = z.object({
  timeline: z
    .string()
    .min(20)
    .max(8000)
    .describe(
      "Chronological incident timeline from the pasted status notes. Do not claim anyone was paged.",
    ),
  nextActions: z
    .array(z.string().min(1).max(400))
    .min(1)
    .max(12)
    .describe("Concrete next actions a human can take. Do not send them."),
  notesSummary: z
    .string()
    .min(1)
    .max(2000)
    .describe("Short restatement of the pasted status notes."),
  gaps: z
    .array(z.string().min(1).max(400))
    .max(12)
    .optional()
    .describe("Facts the notes do not include. Empty when the notes are enough."),
});

export type DraftIncidentReadoutOutput = {
  drafted: true;
  timeline: string;
  nextActions: string[];
  notesSummary: string;
  gaps: string[];
  sent: false;
  paged: false;
};

/**
 * Records an incident timeline draft plus next actions.
 * Intentionally has no Eve approval. Never pages, notifies, or sends.
 */
export default defineTool({
  description:
    "Draft an incident timeline and next actions from pasted status notes. Call once when the draft is ready. Does not page, notify, send, or open GitHub issues. Never claim anyone was notified.",
  inputSchema: draftIncidentReadoutInput,
  execute(input): DraftIncidentReadoutOutput {
    return {
      drafted: true,
      timeline: input.timeline,
      nextActions: input.nextActions,
      notesSummary: input.notesSummary,
      gaps: input.gaps ?? [],
      sent: false,
      paged: false,
    };
  },
  toModelOutput(output) {
    return {
      type: "json",
      value: {
        drafted: true,
        sent: false,
        paged: false,
        nextActionCount: output.nextActions.length,
        gapCount: output.gaps.length,
        timelinePreview: output.timeline.slice(0, 240),
      },
    };
  },
});
