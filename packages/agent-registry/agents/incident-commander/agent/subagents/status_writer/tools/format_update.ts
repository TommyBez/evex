import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Structure a stakeholder-safe incident update.",
  inputSchema: z.object({
    impact: z.string().min(1),
    confirmed: z.array(z.string()).min(1),
    inFlight: z.array(z.string()).min(1),
    nextUpdateAt: z.string().min(1),
  }),
  async execute({ impact, confirmed, inFlight, nextUpdateAt }) {
    return {
      update: [
        "Impact: " + impact,
        "Confirmed: " + confirmed.join("; "),
        "In progress: " + inFlight.join("; "),
        "Next update: " + nextUpdateAt,
      ].join("\n"),
    };
  },
});
