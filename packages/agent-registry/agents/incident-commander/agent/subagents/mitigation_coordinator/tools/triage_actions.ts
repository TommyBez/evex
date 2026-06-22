import { defineTool } from "eve/tools";
import { z } from "zod";

const action = z.object({
  summary: z.string().min(1),
  owner: z.string().min(1),
  blocked: z.boolean().default(false),
  impact: z.enum(["low", "medium", "high"]),
});

export default defineTool({
  description: "Order mitigation actions by impact and blocker state.",
  inputSchema: z.object({
    actions: z.array(action).min(1),
  }),
  async execute({ actions }) {
    const impactRank = { high: 3, medium: 2, low: 1 };

    return {
      prioritized: actions
        .map((action) => ({
          ...action,
          score: impactRank[action.impact] * 2 - (action.blocked ? 2 : 0),
        }))
        .sort((left, right) => right.score - left.score),
    };
  },
});
