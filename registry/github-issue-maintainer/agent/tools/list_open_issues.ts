import { defineTool } from "eve/tools";
import { z } from "zod";

import { issueDigestConfig, parseOwnerRepo } from "../lib/issue-config";
import { githubRequest } from "../lib/github-app";

type GitHubIssueListItem = {
  readonly number: number;
  readonly title: string;
  readonly html_url: string;
  readonly user?: { readonly login?: string };
  readonly labels?: readonly (
    | string
    | { readonly name?: string | null }
  )[];
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly comments?: number;
  readonly pull_request?: unknown;
};

export default defineTool({
  description:
    "List open GitHub issues for the configured ISSUE_DIGEST_REPO. Skips pull requests. Used by the weekly open-issue digest schedule.",
  inputSchema: z.object({
    maxIssues: z.number().int().positive().max(100).default(50),
  }),
  async execute({ maxIssues }) {
    const repo = issueDigestConfig.repo;
    const installationId = issueDigestConfig.installationId;
    if (!repo) {
      return { notConfigured: true, missingEnv: "ISSUE_DIGEST_REPO" };
    }
    if (!installationId) {
      return {
        notConfigured: true,
        missingEnv: "GITHUB_APP_INSTALLATION_ID",
      };
    }

    const { owner, repo: name } = parseOwnerRepo(repo);
    const issues: Array<{
      number: number;
      title: string;
      url: string;
      author: string | null;
      labels: string[];
      createdAt: string | null;
      updatedAt: string | null;
      comments: number;
    }> = [];

    let page = 1;
    while (issues.length < maxIssues) {
      const batch = await githubRequest<GitHubIssueListItem[]>({
        installationId,
        method: "GET",
        path: `/repos/${owner}/${name}/issues?state=open&per_page=50&page=${page}&sort=updated&direction=desc`,
      });

      if (batch.length === 0) {
        break;
      }

      for (const item of batch) {
        if (item.pull_request) {
          continue;
        }
        issues.push({
          number: item.number,
          title: item.title,
          url: item.html_url,
          author: item.user?.login ?? null,
          labels: (item.labels ?? [])
            .map((label) => (typeof label === "string" ? label : label.name))
            .filter((label): label is string => Boolean(label)),
          createdAt: item.created_at ?? null,
          updatedAt: item.updated_at ?? null,
          comments: item.comments ?? 0,
        });
        if (issues.length >= maxIssues) {
          break;
        }
      }

      if (batch.length < 50) {
        break;
      }
      page += 1;
    }

    return {
      repo: `${owner}/${name}`,
      count: issues.length,
      issues,
    };
  },
});
