import { LinearClient } from "@linear/sdk";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Fetch Linear issues for a team and identify delivery-risk signals.",
  inputSchema: z.object({
    teamKey: z.string().min(1),
    limit: z.number().int().min(1).max(100).default(40),
  }),
  async execute({ teamKey, limit }) {
    const apiKey = process.env.LINEAR_API_KEY;
    if (!apiKey) {
      return { authRequired: true, missingEnv: "LINEAR_API_KEY", teamKey };
    }

    const linear = new LinearClient({ apiKey });
    const issues = await linear.issues({
      first: limit,
      filter: { team: { key: { eq: teamKey } } },
    });

    const nodes = await Promise.all(
      issues.nodes.map(async (issue) => {
        const [assignee, state] = await Promise.all([
          issue.assignee,
          issue.state,
        ]);

        return {
          identifier: issue.identifier,
          title: issue.title,
          priority: issue.priority,
          estimate: issue.estimate,
          assignee: assignee ? assignee.name : null,
          state: state ? state.name : null,
          url: issue.url,
        };
      }),
    );

    return {
      teamKey,
      issueCount: nodes.length,
      unassigned: nodes.filter((issue) => !issue.assignee),
      highPriority: nodes.filter(
        (issue) => issue.priority > 0 && issue.priority <= 2,
      ),
      issues: nodes,
    };
  },
});
