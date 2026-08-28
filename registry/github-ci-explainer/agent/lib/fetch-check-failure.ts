import type { GitHubHandle, GitHubJsonObject } from "eve/channels/github";

import {
  type CiAnnotation,
  type CiFailureLocation,
  firstUsefulLocation,
  truncateLogExcerpt,
} from "./parse-ci-log";

const MAX_ANNOTATIONS = 20;
const MAX_LOG_CHARS = 8000;
const MAX_COMMENT_EXCERPT_CHARS = 1200;

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
  // Scan the full log for file:line first; truncate only for the posted excerpt.
  const location = firstUsefulLocation({
    annotations,
    logText: combinedText || undefined,
  });
  const logExcerpt = excerptAroundLocation(
    combinedText || "(no log text available)",
    location,
    MAX_LOG_CHARS,
  );

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

/**
 * Prefer an excerpt centered on the resolved file:line; otherwise keep the
 * start of the log. Truncation happens only after location is known.
 */
export function excerptAroundLocation(
  fullText: string,
  location: CiFailureLocation | null,
  maxChars = MAX_LOG_CHARS,
): string {
  const trimmed = fullText.trim();
  if (trimmed.length === 0) {
    return "(no log text available)";
  }
  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  if (!location) {
    return truncateLogExcerpt(trimmed, maxChars);
  }

  const needles = [
    `${location.file}:${location.line}`,
    `${location.file}(${location.line}`,
    location.file,
  ];
  let anchor = -1;
  for (const needle of needles) {
    const index = trimmed.indexOf(needle);
    if (index >= 0) {
      anchor = index;
      break;
    }
  }

  if (anchor < 0) {
    return truncateLogExcerpt(trimmed, maxChars);
  }

  const half = Math.floor(maxChars / 2);
  let start = Math.max(0, anchor - half);
  let end = Math.min(trimmed.length, start + maxChars);
  start = Math.max(0, end - maxChars);

  // Prefer line boundaries when we have room.
  if (start > 0) {
    const nextNewline = trimmed.indexOf("\n", start);
    if (nextNewline !== -1 && nextNewline < anchor) {
      start = nextNewline + 1;
    }
  }
  if (end < trimmed.length) {
    const prevNewline = trimmed.lastIndexOf("\n", end);
    if (prevNewline > anchor) {
      end = prevNewline;
    }
  }

  const slice = trimmed.slice(start, end).trim();
  const prefix = start > 0 ? "…\n" : "";
  const suffix = end < trimmed.length ? "\n…" : "";
  return `${prefix}${slice}${suffix}`;
}

/**
 * Build a fenced code block whose delimiter is longer than any backtick run
 * inside the body, so untrusted log text cannot break out of the fence.
 */
export function fenceCodeBlock(language: string, content: string): string {
  const body = content.replace(/\r\n/g, "\n").replace(/\s+$/u, "");
  let fenceLength = 3;
  for (const match of body.matchAll(/`+/g)) {
    fenceLength = Math.max(fenceLength, match[0].length + 1);
  }
  const fence = "`".repeat(fenceLength);
  const info = language.trim();
  return `${fence}${info}\n${body}\n${fence}`;
}

/**
 * Rewrite every markdown fenced code block so its delimiter is longer than any
 * backtick run inside the body. Used for model-authored comment bodies.
 */
export function hardenMarkdownCodeFences(markdown: string): string {
  // Match opening fence + optional info string, body, closing fence of equal
  // or greater length (non-greedy body).
  return markdown.replace(
    /(^|\n)(`{3,})([^\n`]*)\n([\s\S]*?)\n(\2)(?=\n|$)/g,
    (
      _full: string,
      prefix: string,
      _openFence: string,
      info: string,
      body: string,
    ) => {
      const language = info.trim();
      return `${prefix}${fenceCodeBlock(language, body)}`;
    },
  );
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
    lines.push(
      "",
      fenceCodeBlock("text", truncateLogExcerpt(excerpt, MAX_COMMENT_EXCERPT_CHARS)),
    );
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
      // Return the complete log — callers scan for file:line before truncating.
      return response.body;
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
