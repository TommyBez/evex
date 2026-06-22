import { defineTool } from "eve/tools";
import { z } from "zod";

const changedFile = z.object({
  path: z.string().min(1),
  kind: z.enum(["added", "modified", "deleted", "renamed"]),
  additions: z.number().int().min(0).default(0),
  deletions: z.number().int().min(0).default(0),
  touchesCriticalPath: z.boolean().default(false),
});

export default defineTool({
  description: "Estimate patch risk and spotlight the files worth reading first.",
  inputSchema: z.object({
    files: z.array(changedFile).min(1),
    hasMigration: z.boolean().default(false),
    hasAuthChange: z.boolean().default(false),
    hasCachingChange: z.boolean().default(false),
  }),
  async execute({ files, hasMigration, hasAuthChange, hasCachingChange }) {
    let score = 8;
    const reasons = [];
    const hotspots = [];

    for (const file of files) {
      const churn = file.additions + file.deletions;
      if (file.touchesCriticalPath) {
        score += 8;
        reasons.push("Touches a critical path: " + file.path);
        hotspots.push(file.path);
      }
      if (churn >= 200) {
        score += 6;
        reasons.push("Large patch size in " + file.path);
        hotspots.push(file.path);
      }
      if (file.kind === "deleted" || file.kind === "renamed") {
        score += 4;
        reasons.push("Structural file change in " + file.path);
      }
      if (/schema|auth|cache|queue|worker|payment/i.test(file.path)) {
        score += 3;
        reasons.push("High leverage surface area in " + file.path);
      }
    }

    if (hasMigration) {
      score += 7;
      reasons.push("Includes a migration or data-shape change");
    }
    if (hasAuthChange) {
      score += 6;
      reasons.push("Touches authentication or authorization logic");
    }
    if (hasCachingChange) {
      score += 4;
      reasons.push("Changes caching or invalidation behavior");
    }

    const band = score >= 35 ? "high" : score >= 20 ? "medium" : "low";

    return {
      score,
      band,
      hotspotCount: new Set(hotspots).size,
      hotspots: Array.from(new Set(hotspots)),
      reasons,
    };
  },
});
