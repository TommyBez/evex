import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  type GitHubAccess,
  GitHubRequestError,
  getDefaultBranch,
  githubRequest,
  isGitHubAccessError,
  readGitHubAccess,
} from "../lib/github.js";
import { pseoConfig } from "../lib/pseo-config.js";

const MAX_PAGES_PER_CALL = 20;
const BRANCH_PATTERN = /^pseo\/[A-Za-z0-9._/-]+$/;
const HTTP_NOT_FOUND = 404;
const BLOB_FILE_MODE = "100644";

type GitRefResponse = {
  object: { sha: string };
};

type GitCommitResponse = {
  sha: string;
  tree: { sha: string };
};

type GitTreeCreateResponse = {
  sha: string;
};

type PullRequestSummary = {
  number: number;
  html_url: string;
};

export default defineTool({
  description:
    "Publish a batch of generated SEO pages to the configured product repository: commits the files to a dedicated 'pseo/...' branch and opens (or updates) a pull request against the default branch. Never merges. Requires confirmPublish=true after the pages have been reviewed against the programmatic-seo quality bar.",
  inputSchema: z.object({
    branch: z
      .string()
      .regex(
        BRANCH_PATTERN,
        "Branch must look like pseo/<identifier>, for example pseo/2026-w27.",
      )
      .describe(
        "Branch to commit to, derived from the run date (for example pseo/2026-w27) so a replayed run reuses the same branch and pull request.",
      ),
    commitMessage: z.string().min(1).describe("Commit message for this batch of pages."),
    pages: z
      .array(
        z.object({
          path: z
            .string()
            .min(1)
            .describe("Repository-relative file path inside the allowed target directory."),
          content: z.string().min(1).describe("Full file content for the page."),
        }),
      )
      .min(1)
      .max(MAX_PAGES_PER_CALL)
      .describe("Pages to commit in this batch."),
    pullRequestTitle: z.string().min(1).describe("Title for the pull request."),
    pullRequestBody: z
      .string()
      .min(1)
      .describe(
        "Pull request body: keyword targets with search volumes, playbook pattern used, research sources, and review notes.",
      ),
    confirmPublish: z
      .boolean()
      .describe("Must be true to commit and open the pull request."),
  }),
  async execute({
    branch,
    commitMessage,
    pages,
    pullRequestTitle,
    pullRequestBody,
    confirmPublish,
  }) {
    if (!confirmPublish) {
      return {
        published: false,
        notConfirmed: true,
        message: "Set confirmPublish=true after reviewing the pages to publish them.",
      };
    }

    const access = readGitHubAccess();
    if (isGitHubAccessError(access)) {
      return { published: false, ...access };
    }

    const disallowedPaths = pages
      .map((page) => page.path.replace(/^\/+/, ""))
      .filter(
        (pagePath) =>
          !pseoConfig.allowedPathPrefixes.some((prefix) =>
            pagePath.startsWith(`${prefix}/`),
          ),
      );
    if (disallowedPaths.length > 0) {
      return {
        published: false,
        pathNotAllowed: disallowedPaths,
        allowedPathPrefixes: pseoConfig.allowedPathPrefixes,
        message:
          "Every page path must be inside an allowed path prefix. Nothing was committed.",
      };
    }

    const defaultBranch = await getDefaultBranch(access);
    const headSha = await ensureBranch(access, branch, defaultBranch);

    const headCommit = await githubRequest<GitCommitResponse>(
      access,
      `/repos/${access.repoRef.fullName}/git/commits/${headSha}`,
    );

    const newTree = await githubRequest<GitTreeCreateResponse>(
      access,
      `/repos/${access.repoRef.fullName}/git/trees`,
      {
        method: "POST",
        body: {
          base_tree: headCommit.tree.sha,
          tree: pages.map((page) => ({
            path: page.path.replace(/^\/+/, ""),
            mode: BLOB_FILE_MODE,
            type: "blob",
            content: page.content,
          })),
        },
      },
    );

    const newCommit = await githubRequest<GitCommitResponse>(
      access,
      `/repos/${access.repoRef.fullName}/git/commits`,
      {
        method: "POST",
        body: {
          message: commitMessage,
          tree: newTree.sha,
          parents: [headSha],
        },
      },
    );

    await githubRequest(
      access,
      `/repos/${access.repoRef.fullName}/git/refs/heads/${branch}`,
      {
        method: "PATCH",
        body: { sha: newCommit.sha },
      },
    );

    const pullRequest = await ensurePullRequest(access, {
      branch,
      defaultBranch,
      title: pullRequestTitle,
      body: pullRequestBody,
    });

    return {
      published: true,
      repo: access.repoRef.fullName,
      branch,
      commitSha: newCommit.sha,
      filesCommitted: pages.map((page) => page.path.replace(/^\/+/, "")),
      pullRequest,
    };
  },
});

async function ensureBranch(
  access: GitHubAccess,
  branch: string,
  defaultBranch: string,
): Promise<string> {
  try {
    const ref = await githubRequest<GitRefResponse>(
      access,
      `/repos/${access.repoRef.fullName}/git/ref/heads/${branch}`,
    );
    return ref.object.sha;
  } catch (error) {
    if (!(error instanceof GitHubRequestError && error.status === HTTP_NOT_FOUND)) {
      throw error;
    }
  }

  const baseRef = await githubRequest<GitRefResponse>(
    access,
    `/repos/${access.repoRef.fullName}/git/ref/heads/${encodeURIComponent(defaultBranch)}`,
  );

  await githubRequest(access, `/repos/${access.repoRef.fullName}/git/refs`, {
    method: "POST",
    body: {
      ref: `refs/heads/${branch}`,
      sha: baseRef.object.sha,
    },
  });

  return baseRef.object.sha;
}

async function ensurePullRequest(
  access: GitHubAccess,
  input: {
    branch: string;
    defaultBranch: string;
    title: string;
    body: string;
  },
): Promise<{ number: number; url: string; state: "created" | "updated" }> {
  const existing = await githubRequest<PullRequestSummary[]>(
    access,
    `/repos/${access.repoRef.fullName}/pulls?state=open&head=${encodeURIComponent(
      `${access.repoRef.owner}:${input.branch}`,
    )}`,
  );

  const openPullRequest = existing[0];
  if (openPullRequest) {
    await githubRequest(
      access,
      `/repos/${access.repoRef.fullName}/pulls/${openPullRequest.number}`,
      {
        method: "PATCH",
        body: { body: input.body },
      },
    );
    return {
      number: openPullRequest.number,
      url: openPullRequest.html_url,
      state: "updated",
    };
  }

  const created = await githubRequest<PullRequestSummary>(
    access,
    `/repos/${access.repoRef.fullName}/pulls`,
    {
      method: "POST",
      body: {
        title: input.title,
        body: input.body,
        head: input.branch,
        base: input.defaultBranch,
      },
    },
  );

  return { number: created.number, url: created.html_url, state: "created" };
}
