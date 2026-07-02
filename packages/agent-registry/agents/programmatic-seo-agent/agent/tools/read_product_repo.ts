import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  getDefaultBranch,
  githubRequest,
  isGitHubAccessError,
  readGitHubAccess,
} from "../lib/github.js";

const MAX_FILES_PER_CALL = 12;
const MAX_TREE_ENTRIES = 500;
const MAX_FILE_CHARS = 50_000;

type GitTreeEntry = {
  path?: string;
  type?: string;
};

type GitTreeResponse = {
  tree?: GitTreeEntry[];
  truncated?: boolean;
};

type ContentsResponse = {
  type?: string;
  encoding?: string;
  content?: string;
  size?: number;
};

export default defineTool({
  description:
    "Read the configured product GitHub repository: list its file tree and fetch specific files. Use it to understand the product, find where content pages live, and match existing page conventions before generating anything.",
  inputSchema: z.object({
    listTree: z
      .boolean()
      .optional()
      .describe("When true, return the repository file tree from the default branch."),
    treePathPrefix: z
      .string()
      .optional()
      .describe("Optional path prefix to filter the returned tree entries."),
    paths: z
      .array(z.string().min(1))
      .max(MAX_FILES_PER_CALL)
      .optional()
      .describe("Repository-relative file paths to fetch."),
  }),
  async execute({ listTree, treePathPrefix, paths }) {
    const access = readGitHubAccess();
    if (isGitHubAccessError(access)) {
      return access;
    }

    const defaultBranch = await getDefaultBranch(access);
    const output: Record<string, unknown> = {
      repo: access.repoRef.fullName,
      defaultBranch,
    };

    if (listTree) {
      const treeResponse = await githubRequest<GitTreeResponse>(
        access,
        `/repos/${access.repoRef.fullName}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
      );

      const prefix = treePathPrefix?.replace(/^\/+/, "");
      const allPaths = (treeResponse.tree ?? [])
        .filter((entry) => entry.type === "blob" && entry.path)
        .map((entry) => entry.path as string)
        .filter((entryPath) => !prefix || entryPath.startsWith(prefix));

      output.tree = allPaths.slice(0, MAX_TREE_ENTRIES);
      output.treeTruncated =
        Boolean(treeResponse.truncated) || allPaths.length > MAX_TREE_ENTRIES;
    }

    if (paths && paths.length > 0) {
      const files: Array<{
        path: string;
        content: string | null;
        truncated: boolean;
        error: string | null;
      }> = [];

      for (const filePath of paths) {
        try {
          const contents = await githubRequest<ContentsResponse>(
            access,
            `/repos/${access.repoRef.fullName}/contents/${encodePath(filePath)}?ref=${encodeURIComponent(defaultBranch)}`,
          );

          if (contents.type !== "file" || typeof contents.content !== "string") {
            files.push({
              path: filePath,
              content: null,
              truncated: false,
              error: `Not a readable file (type: ${contents.type ?? "unknown"}).`,
            });
            continue;
          }

          const decoded = Buffer.from(contents.content, "base64").toString("utf8");
          files.push({
            path: filePath,
            content: decoded.slice(0, MAX_FILE_CHARS),
            truncated: decoded.length > MAX_FILE_CHARS,
            error: null,
          });
        } catch (error) {
          files.push({
            path: filePath,
            content: null,
            truncated: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      output.files = files;
    }

    return output;
  },
});

function encodePath(filePath: string): string {
  return filePath
    .replace(/^\/+/, "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
