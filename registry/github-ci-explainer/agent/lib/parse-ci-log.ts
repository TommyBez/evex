export type CiFailureLocation = {
  readonly file: string;
  readonly line: number;
  readonly message?: string;
};

export type CiAnnotation = {
  readonly annotationLevel?: string;
  readonly message?: string;
  readonly path?: string;
  readonly startLine?: number;
};

const FILE_LINE_PATTERNS: readonly RegExp[] = [
  // path/to/file.ts:42:13: error ...
  /(?:^|[\s("'])((?:[A-Za-z]:)?[^:\s"'()[\]]+\.[A-Za-z0-9]+):(\d{1,7})(?::\d{1,7})?/,
  // path/to/file.ts(42,13): error ...
  /(?:^|[\s("'])((?:[A-Za-z]:)?[^(\s"'[\]]+\.[A-Za-z0-9]+)\((\d{1,7})(?:,\d{1,7})?\)/,
  // at foo (path/to/file.ts:42:13)
  /\(([^()\s]+\.[A-Za-z0-9]+):(\d{1,7})(?::\d{1,7})?\)/,
];

const IGNORED_PATH_FRAGMENTS = [
  "node_modules/",
  "webpack/",
  "internal/process/",
  "node:internal/",
];

/**
 * Prefer failure/error annotations with a path and start line. Falls back to
 * the first annotation that has both fields.
 */
export function locationFromAnnotations(
  annotations: readonly CiAnnotation[],
): CiFailureLocation | null {
  const ranked = [...annotations].sort((left, right) => {
    return annotationRank(left) - annotationRank(right);
  });

  for (const annotation of ranked) {
    const file = annotation.path?.trim();
    const line = annotation.startLine;
    if (!(file && typeof line === "number" && line > 0)) {
      continue;
    }
    if (shouldIgnorePath(file)) {
      continue;
    }
    return {
      file,
      line,
      message: annotation.message?.trim() || undefined,
    };
  }

  return null;
}

/**
 * Scan log text for the first useful file:line reference.
 */
export function locationFromLogText(logText: string): CiFailureLocation | null {
  const lines = logText.split(/\r?\n/);
  for (const line of lines) {
    const location = matchFileLine(line);
    if (location && !shouldIgnorePath(location.file)) {
      return location;
    }
  }
  return null;
}

export function firstUsefulLocation(input: {
  readonly annotations?: readonly CiAnnotation[];
  readonly logText?: string;
}): CiFailureLocation | null {
  const fromAnnotations = locationFromAnnotations(input.annotations ?? []);
  if (fromAnnotations) {
    return fromAnnotations;
  }
  if (input.logText) {
    return locationFromLogText(input.logText);
  }
  return null;
}

export function truncateLogExcerpt(logText: string, maxChars = 1200): string {
  const trimmed = logText.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxChars).trimEnd()}\n…`;
}

function annotationRank(annotation: CiAnnotation): number {
  const level = annotation.annotationLevel?.toLowerCase();
  if (level === "failure" || level === "error") {
    return 0;
  }
  if (level === "warning") {
    return 1;
  }
  return 2;
}

function matchFileLine(line: string): CiFailureLocation | null {
  for (const pattern of FILE_LINE_PATTERNS) {
    const match = pattern.exec(line);
    if (!match?.[1] || !match[2]) {
      continue;
    }
    const file = match[1].replaceAll("\\", "/");
    const parsedLine = Number.parseInt(match[2], 10);
    if (!Number.isInteger(parsedLine) || parsedLine <= 0) {
      continue;
    }
    return { file, line: parsedLine };
  }
  return null;
}

function shouldIgnorePath(file: string): boolean {
  const normalized = file.replaceAll("\\", "/");
  return IGNORED_PATH_FRAGMENTS.some((fragment) =>
    normalized.includes(fragment),
  );
}
