import { Octokit } from "@octokit/rest";
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Fetch recently merged GitHub pull requests for release analysis.",
  inputSchema: z.object({
    owner: z.string().min(1),
    repo: z.string().min(1),
    limit: z.number().int().min(1).max(100).default(30),
    since: z.string().optional(),
  }),
  async execute({ owner, repo, limit, since }) {
    const auth = process.env.GITHUB_TOKEN;
    if (!auth) {
      return { authRequired: true, missingEnv: "GITHUB_TOKEN", owner, repo };
    }

    const octokit = new Octokit({ auth });
    const response = await octokit.pulls.list({
      owner,
      repo,
      state: "closed",
      sort: "updated",
      direction: "desc",
      per_page: limit,
    });

    const sinceTime = since ? new Date(since).getTime() : 0;
    const merged = response.data
      .filter((pull) => pull.merged_at)
      .filter((pull) => !sinceTime || new Date(pull.merged_at || 0).getTime() >= sinceTime)
      .map((pull) => ({
        number: pull.number,
        title: pull.title,
        author: pull.user?.login,
        mergedAt: pull.merged_at,
        url: pull.html_url,
        labels: pull.labels.map((label) => label.name),
      }));

    return { owner, repo, mergedCount: merged.length, merged };
  },
});
