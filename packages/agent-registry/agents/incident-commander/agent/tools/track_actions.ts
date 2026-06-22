import { defineTool } from "eve/tools";
import { z } from "zod";

const actionItem = z.object({
  summary: z.string().min(1),
  owner: z.string().default("unassigned"),
  status: z.enum(["planned", "in_progress", "blocked", "done"]),
  dueAt: z.string().optional(),
  blockers: z.array(z.string()).default([]),
});

export default defineTool({
  description: "Summarize operational action items and reveal owner or blocker gaps.",
  inputSchema: z.object({
    actions: z.array(actionItem).min(1),
  }),
  async execute({ actions }) {
    const byOwner: Record<string, number> = {};
    const blocked: string[] = [];
    const unassigned: string[] = [];

    for (const action of actions) {
      byOwner[action.owner] = (byOwner[action.owner] ?? 0) + 1;
      if (action.status === "blocked") blocked.push(action.summary);
      if (action.owner === "unassigned") unassigned.push(action.summary);
    }

    return {
      total: actions.length,
      blocked,
      unassigned,
      byOwner,
      open: actions.filter((action) => action.status !== "done").length,
    };
  },
});
