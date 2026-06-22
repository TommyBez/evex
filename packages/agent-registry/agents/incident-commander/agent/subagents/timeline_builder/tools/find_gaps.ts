import { defineTool } from "eve/tools";
import { z } from "zod";

const eventWindow = z.object({
  source: z.string().min(1),
  startedAt: z.string().min(1),
  endedAt: z.string().min(1),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
});

export default defineTool({
  description: "Highlight weak evidence windows inside an incident timeline.",
  inputSchema: z.object({
    windows: z.array(eventWindow).min(1),
  }),
  async execute({ windows }) {
    return {
      weakWindows: windows.filter((window) => window.confidence !== "high"),
      sourceCount: new Set(windows.map((window) => window.source)).size,
    };
  },
});
