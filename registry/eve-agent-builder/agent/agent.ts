import { defineAgent } from "eve";
import { z } from "zod";

// Structured result for task-mode runs only (subagent, schedule, or remote
// job callers such as defineRemoteAgent). Interactive chat turns ignore it.
const deliveryReportSchema = z.object({
  blocked: z
    .array(z.string())
    .describe("Missing credentials or manual setup that blocked a step."),
  changedFiles: z.array(z.string()),
  commands: z.array(
    z.object({
      command: z.string(),
      status: z.enum(["passed", "failed", "skipped"]),
    })
  ),
  deployment: z
    .object({
      target: z.enum(["preview", "production"]),
      url: z.url(),
    })
    .nullable(),
  summary: z.string(),
  verification: z
    .array(z.string())
    .describe("Live verification evidence, for example health/session/stream checks."),
});

export default defineAgent({
  model: "zai/glm-5.2-fast",
  reasoning: "high",
  // Runaway guard, not a budget: a legitimate delivery session never comes
  // near this. Input stays on the framework default.
  limits: {
    maxOutputTokensPerSession: 5_000_000,
  },
  outputSchema: deliveryReportSchema,
});
