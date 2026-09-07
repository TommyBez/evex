import { defineTool } from "eve/tools";
import { z } from "zod";

const draftExperimentReadoutInput = z.object({
  decision: z
    .enum(["ship", "iterate", "kill", "inconclusive"])
    .describe("Recommended call from the pasted results."),
  readout: z
    .string()
    .min(20)
    .max(8000)
    .describe(
      "Decision readout citing metrics from the paste. Do not claim a change shipped.",
    ),
  nextTest: z
    .string()
    .min(10)
    .max(2000)
    .describe("One follow-up experiment that follows from the results."),
  metricsCited: z
    .array(z.string().min(1).max(200))
    .min(1)
    .max(12)
    .describe("Metric names or numbers copied from the pasted results."),
});

export type DraftExperimentReadoutOutput = {
  drafted: true;
  decision: "ship" | "iterate" | "kill" | "inconclusive";
  readout: string;
  nextTest: string;
  metricsCited: string[];
  shipped: false;
};

/**
 * Records an experiment decision readout and next test.
 * Intentionally has no Eve approval. Never ships code.
 */
export default defineTool({
  description:
    "Draft an experiment decision readout and one next test from pasted results. Call once when the draft is ready. Does not ship code, deploy a variant, or open GitHub pull requests. Never claim a change landed.",
  inputSchema: draftExperimentReadoutInput,
  execute(input): DraftExperimentReadoutOutput {
    return {
      drafted: true,
      decision: input.decision,
      readout: input.readout,
      nextTest: input.nextTest,
      metricsCited: input.metricsCited,
      shipped: false,
    };
  },
  toModelOutput(output) {
    return {
      type: "json",
      value: {
        drafted: true,
        shipped: false,
        decision: output.decision,
        metricsCited: output.metricsCited,
        readoutPreview: output.readout.slice(0, 240),
      },
    };
  },
});
