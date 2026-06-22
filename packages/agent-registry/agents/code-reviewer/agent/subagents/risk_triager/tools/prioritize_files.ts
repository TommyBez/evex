import { defineTool } from "eve/tools";
import { z } from "zod";

const fileRisk = z.object({
  path: z.string().min(1),
  churn: z.number().int().min(0),
  criticality: z.number().int().min(0).max(5),
  uncertainty: z.number().int().min(0).max(5),
  tags: z.array(z.string()).default([]),
});

export default defineTool({
  description: "Sort changed files into a review order with short rationale.",
  inputSchema: z.object({
    files: z.array(fileRisk).min(1),
  }),
  async execute({ files }) {
    return {
      plan: files
        .map((file) => ({
          ...file,
          score: file.churn * 0.03 + file.criticality * 2 + file.uncertainty * 1.5,
        }))
        .sort((left, right) => right.score - left.score)
        .map((file, index) => ({
          order: index + 1,
          path: file.path,
          score: Number(file.score.toFixed(2)),
          rationale:
            file.tags.length > 0
              ? "Prioritize because it touches " + file.tags.join(", ")
              : "Prioritize because it has high churn or uncertainty",
        })),
    };
  },
});
