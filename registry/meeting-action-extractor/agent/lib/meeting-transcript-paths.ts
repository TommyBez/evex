/** Default meeting-transcript roots when MEETING_TRANSCRIPT_ROOTS is unset. */
export const DEFAULT_MEETING_TRANSCRIPT_ROOTS: readonly string[] = [
  "meetings",
  "notes/meetings",
  "transcripts",
];

/** Normalize a model-supplied path to a workspace-relative candidate. */
export function normalizeMeetingTranscriptPath(input: string): string {
  const trimmed = input.trim().replaceAll("\\", "/");
  const withoutWorkspace = trimmed
    .replace(/^\/workspace\//, "")
    .replace(/^\.\//, "");
  return withoutWorkspace.replace(/^\/+/, "").replace(/\/+$/, "");
}

/**
 * Parse MEETING_TRANSCRIPT_ROOTS (comma-separated). Empty / missing → defaults.
 * Roots are workspace-relative directories or files for meeting transcripts.
 */
export function meetingTranscriptRootsFromEnv(
  envValue: string | undefined,
): readonly string[] {
  if (envValue === undefined || envValue.trim().length === 0) {
    return DEFAULT_MEETING_TRANSCRIPT_ROOTS;
  }

  const roots: string[] = [];
  const seen = new Set<string>();
  for (const part of envValue.split(",")) {
    const root = normalizeMeetingTranscriptPath(part);
    if (root.length === 0 || root.includes("..") || seen.has(root)) {
      continue;
    }
    roots.push(root);
    seen.add(root);
  }

  return roots.length > 0 ? roots : DEFAULT_MEETING_TRANSCRIPT_ROOTS;
}

/** True when the path sits under a configured meeting-transcript root. */
export function isAllowedMeetingTranscriptPath(
  input: string,
  roots: readonly string[],
): boolean {
  const relative = normalizeMeetingTranscriptPath(input);
  if (relative.length === 0 || relative.includes("..")) {
    return false;
  }

  for (const root of roots) {
    const normalizedRoot = normalizeMeetingTranscriptPath(root);
    if (normalizedRoot.length === 0) {
      continue;
    }
    if (
      relative === normalizedRoot ||
      relative.startsWith(`${normalizedRoot}/`)
    ) {
      return true;
    }
  }

  return false;
}

/** Runtime meeting-transcript roots from process.env.MEETING_TRANSCRIPT_ROOTS. */
export function configuredMeetingTranscriptRoots(): readonly string[] {
  return meetingTranscriptRootsFromEnv(process.env.MEETING_TRANSCRIPT_ROOTS);
}

export type MeetingTranscriptSearchHit = {
  line: number;
  path: string;
  text: string;
};

/**
 * Parse one rg/grep `-n -H` line (`path:line:text`). Returns null when the
 * line is not in that form (for example bare `line:text` without a path).
 */
export function parseMeetingTranscriptSearchHitLine(
  line: string,
): MeetingTranscriptSearchHit | null {
  const match = /^([^:]+):(\d+):(.*)$/.exec(line);
  if (!match) {
    return null;
  }
  return {
    path: normalizeMeetingTranscriptPath(match[1] ?? ""),
    line: Number(match[2]),
    text: (match[3] ?? "").slice(0, 240),
  };
}
