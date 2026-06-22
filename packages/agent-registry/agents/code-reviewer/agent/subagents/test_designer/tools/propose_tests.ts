import { defineTool } from "eve/tools";
import { z } from "zod";

const concern = z.object({
  title: z.string().min(1),
  failureMode: z.string().min(1),
  setupCost: z.enum(["small", "medium", "large"]),
});

export default defineTool({
  description: "Turn review concerns into a short prioritized regression test plan.",
  inputSchema: z.object({
    concerns: z.array(concern).min(1),
  }),
  async execute({ concerns }) {
    const setupRank = { small: 3, medium: 2, large: 1 };

    return {
      tests: concerns
        .map((concern) => ({
          concern: concern.title,
          testIdea: "Verify that " + concern.failureMode.toLowerCase(),
          priority: setupRank[concern.setupCost],
        }))
        .sort((left, right) => right.priority - left.priority),
    };
  },
});
