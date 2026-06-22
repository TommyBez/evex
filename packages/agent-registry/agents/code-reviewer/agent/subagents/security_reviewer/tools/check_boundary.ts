import { defineTool } from "eve/tools";
import { z } from "zod";

const boundary = z.object({
  name: z.string().min(1),
  actor: z.string().min(1),
  sideEffect: z.string().min(1),
  authorization: z.string().min(1),
  handlesSensitiveData: z.boolean().default(false),
});

export default defineTool({
  description: "Score the risk of a trust boundary or external side effect.",
  inputSchema: z.object({
    boundaries: z.array(boundary).min(1),
  }),
  async execute({ boundaries }) {
    return {
      review: boundaries.map((boundary) => {
        const missingAuthorization = /none|unknown|missing/i.test(boundary.authorization);
        const riskScore =
          (boundary.handlesSensitiveData ? 4 : 0) +
          (missingAuthorization ? 5 : 0) +
          (/delete|write|charge|publish/i.test(boundary.sideEffect) ? 3 : 0);

        return {
          name: boundary.name,
          actor: boundary.actor,
          riskScore,
          needsAttention: riskScore >= 5,
        };
      }),
    };
  },
});
