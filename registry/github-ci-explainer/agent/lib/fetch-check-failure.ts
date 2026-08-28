import type { GitHubHandle, GitHubJsonObject } from "eve/channels/github";

import {
  type CiAnnotation,
  type CiFailureLocation,
  firstUsefulLocation,
  truncateLogExcerpt,
} from "./parse-ci-log";

const MAX_ANNOTATIONS = 20;
const MAX_LOG_CHARS = 8000;

export type FailedCheckDetails = {
  readonly annotations: readonly CiAnnotation[];
  readonly checkName: string;
  readonly checkRunId: number;
  readonly conclusion: string | null;
  readonly detailsUrl: string | null;
  readonly headSha: string | null;
  readonly htmlUrl: string | null;
  readonly location: CiFailureLocation | null;
  readonly logExcerpt: string;
  readonly outputSummary: string | null;
  readonly outputText: string | null;
  readonly outputTitle: string | null;
};

type GitHubRequest = GitHubHandle["request"];

export async function fetchFailedCheckDetails(input: {
  readonly checkRunId: number;
  readonly github: { request: GitHubRequest };
  readonly headSha: string | null;
  readonly owner: string;
  readonly raw: GitHubJsonObject;
  readonly repo: string;
}): Promise<FailedCheckDetails> {
  const rawCheck = asObject(input.raw.check_run) ?? asObject(input.raw);
  const checkName =
    readString(rawCheck, "name") ?? `check_run:${input.checkRunId}`;
  const conclusion =
    readString(rawCheck, "conclusion") ??
    readNestedString(rawCheck, ["check_run", "conclusion"]);
  const htmlUrl = readString(rawCheck, "html_url") ?? null;
  const detailsUrl = readString(rawCheck, "details_url") ?? null;
  const output = asObject(rawCheck?.output);
  const outputTitle = readString(output, "title") ?? null;
  const outputSummary = readString(output, "summary") ?? null;
  const outputText = readString(output, "text") ?? null;

  const annotations = await fetchAnnotations(input);
  const jobLog = await maybeFetchJobLogText(input, detailsUrl);
  const combinedText = [outputText, outputSummary, jobLog]
    .filter((part): part is string => Boolean(part?.trim()))
    .join("\n");
  const logExcerpt = truncateLogExcerpt(
    combinedText || "(no log text available)",
    MAX_LOG_CHARS,
  );
  const location = firstUsefulLocation({ annotations, logText: logExcerpt });

  return {
    annotations,
    checkName,
    checkRunId: input.checkRunId,
    conclusion: conclusion ?? null,
    detailsUrl,
    headSha: input.headSha,
    htmlUrl,
    location,
    logExcerpt,
    outputSummary,
    outputText,
    outputTitle,
  };
}

export function formatCiFailureComment(input: {
  readonly checkName: string;
  readonly excerpt: string;
  readonly file?: string;
  readonly htmlUrl?: string | null;
  readonly line?: number;
  readonly whatFailed: string;
}): string {
  const location =
    input.file && input.line
      ? `\`${input.file}:${input.line}\``
      : input.file
        ? `\`${input.file}\``
        : "_(no file:line found in the log)_";

  const lines = [
    `### CI failure: ${input.checkName}`,
    "",
    `**What failed:** ${input.whatFailed}`,
    `**Location:** ${location}`,
  ];

  if (input.htmlUrl) {
    lines.push(`**Check:** ${input.htmlUrl}`);
  }

  const excerpt = input.excerpt.trim();
  if (excerpt) {
    lines.push("", "```text", truncateLogExcerpt(excerpt, 1200), "```");
  }

  return lines.join("\n");
}

async function fetchAnnotations(input: {
  readonly checkRunId: number;
  readonly github: { request: GitHubRequest };
  readonly owner: string;
  readonly repo: string;
}): Promise<CiAnnotation[]> {
  try {
    const response = await input.github.request({
      method: "GET",
      path: `/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/check-runs/${input.checkRunId}/annotations`,
    });

    const body = response.body;
    if (!Array.isArray(body)) {
      return [];
    }

    const annotations: CiAnnotation[] = [];
    for (const item of body.slice(0, MAX_ANNOTATIONS)) {
      if (!(item && typeof item === "object" && !Array.isArray(item))) {
        continue;
      }
      const row = item as GitHubJsonObject;
      annotations.push({
        annotationLevel:
          typeof row.annotation_level === "string"
            ? row.annotation_level
            : undefined,
        message: typeof row.message === "string" ? row.message : undefined,
        path: typeof row.path === "string" ? row.path : undefined,
        startLine:
          typeof row.start_line === "number" ? row.start_line : undefined,
      });
    }
    return annotations;
  } catch {
    return [];
  }
}

async function maybeFetchJobLogText(
  input: {
    readonly github: { request: GitHubRequest };
    readonly owner: string;
    readonly repo: string;
  },
  detailsUrl: string | null,
): Promise<string | null> {
  const jobId = extractActionsJobId(detailsUrl);
  if (jobId === null) {
    return null;
  }

  try {
    const response = await input.github.request({
      method: "GET",
      path: `/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/actions/jobs/${jobId}/logs`,
    });

    if (typeof response.body === "string") {
      return truncateLogExcerpt(response.body, MAX_LOG_CHARS);
    }

    return null;
  } catch {
    return null;
  }
}

function extractActionsJobId(detailsUrl: string | null): number | null {
  if (!detailsUrl) {
    return null;
  }

  const match = /\/actions\/runs\/\d+\/job\/(\d+)/.exec(detailsUrl);
  if (!match?.[1]) {
    return null;
  }

  const jobId = Number.parseInt(match[1], 10);
  return Number.isInteger(jobId) && jobId > 0 ? jobId : null;
}

function asObject(value: unknown): GitHubJsonObject | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as GitHubJsonObject;
  }
  return null;
}

function readString(
  object: GitHubJsonObject | null | undefined,
  key: string,
): string | undefined {
  const value = object?.[key];
  return typeof value === "string" ? value : undefined;
}

function readNestedString(
  object: GitHubJsonObject | null | undefined,
  path: readonly string[],
): string | undefined {
  let current: unknown = object;
  for (const key of path) {
    if (!(current && typeof current === "object" && !Array.isArray(current))) {
      return undefined;
    }
    current = (current as GitHubJsonObject)[key];
  }
  return typeof current === "string" ? current : undefined;
}
