import { pseoConfig } from "./pseo-config.js";

const GITHUB_API_BASE_URL = "https://api.github.com";
const REPO_PATTERN = /^[\w.-]+\/[\w.-]+$/;

export type GitHubRepoRef = {
  readonly owner: string;
  readonly repo: string;
  readonly fullName: string;
};

export type GitHubAccess = {
  readonly token: string;
  readonly repoRef: GitHubRepoRef;
};

export type GitHubAccessError = {
  readonly notConfigured: true;
  readonly missingEnv: string;
};

export const readGitHubAccess = (): GitHubAccess | GitHubAccessError => {
  const token = process.env.PSEO_GITHUB_TOKEN?.trim();
  if (!token) {
    return { notConfigured: true, missingEnv: "PSEO_GITHUB_TOKEN" };
  }

  const fullName = pseoConfig.repo;
  if (!fullName || !REPO_PATTERN.test(fullName)) {
    return { notConfigured: true, missingEnv: "PSEO_GITHUB_REPO" };
  }

  const [owner, repo] = fullName.split("/") as [string, string];
  return { token, repoRef: { owner, repo, fullName } };
};

export const isGitHubAccessError = (
  access: GitHubAccess | GitHubAccessError,
): access is GitHubAccessError => "notConfigured" in access;

export class GitHubRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GitHubRequestError";
    this.status = status;
  }
}

export const githubRequest = async <T>(
  access: GitHubAccess,
  path: string,
  init?: { method?: string; body?: Record<string, unknown> },
): Promise<T> => {
  const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${access.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new GitHubRequestError(
      response.status,
      `GitHub ${init?.method ?? "GET"} ${path} failed with HTTP ${response.status}: ${detail.slice(0, 300)}`,
    );
  }

  return (await response.json()) as T;
};

export const getDefaultBranch = async (access: GitHubAccess): Promise<string> => {
  const repoInfo = await githubRequest<{ default_branch: string }>(
    access,
    `/repos/${access.repoRef.fullName}`,
  );
  return repoInfo.default_branch;
};
