import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  configuredMeetingTranscriptRoots,
  isAllowedMeetingTranscriptPath,
  normalizeMeetingTranscriptPath,
  parseMeetingTranscriptSearchHitLine,
  type MeetingTranscriptSearchHit,
} from "../lib/meeting-transcript-paths";

const searchMeetingTranscriptsInput = z.object({
  query: z
    .string()
    .min(1)
    .max(200)
    .describe(
      "Literal or simple keyword query to search inside meeting transcripts.",
    ),
  pathHint: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe(
      "Optional transcript path or directory to narrow the search (must be under MEETING_TRANSCRIPT_ROOTS).",
    ),
});

/**
 * Search meeting transcripts on disk. Intentionally has no Eve approval.
 */
export default defineTool({
  description:
    "Search meeting transcripts on disk (roots from MEETING_TRANSCRIPT_ROOTS) for a query. Prefer this before extracting actions. Does not search application source, tests, or lockfiles.",
  inputSchema: searchMeetingTranscriptsInput,
  async execute(input, ctx) {
    const configuredRoots = configuredMeetingTranscriptRoots();
    let roots: string[];
    if (input.pathHint) {
      roots = [normalizeMeetingTranscriptPath(input.pathHint)];
    } else {
      roots = [...configuredRoots];
    }

    for (const root of roots) {
      if (!isAllowedMeetingTranscriptPath(root, configuredRoots)) {
        return {
          hits: [] as MeetingTranscriptSearchHit[],
          note: `Refused non-transcript path: ${root}. Allowed roots: ${configuredRoots.join(", ")}.`,
          query: input.query,
          roots: configuredRoots,
        };
      }
    }

    const sandbox = await ctx.getSandbox();
    const escaped = input.query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pathArgs = roots.map((root) => shellQuote(root)).join(" ");
    const command = [
      "set +e",
      `if command -v rg >/dev/null 2>&1; then rg -n -H -S --no-heading -e ${shellQuote(escaped)} ${pathArgs} 2>/dev/null | head -n 40; else grep -RInH -E ${shellQuote(escaped)} ${pathArgs} 2>/dev/null | head -n 40; fi`,
      "exit 0",
    ].join("; ");

    const result = await sandbox.run({ command });
    const stdout = result.stdout ?? "";

    const hits: MeetingTranscriptSearchHit[] = [];
    for (const line of stdout.split("\n")) {
      if (!line.trim()) {
        continue;
      }
      const hit = parseMeetingTranscriptSearchHitLine(line);
      if (!hit) {
        continue;
      }
      if (!isAllowedMeetingTranscriptPath(hit.path, configuredRoots)) {
        continue;
      }
      hits.push(hit);
    }

    return {
      hits,
      note:
        hits.length === 0
          ? "No meeting-transcript matches. If the files do not show owners or deadlines, say so and do not invent actions."
          : `Found ${hits.length} meeting-transcript hit(s).`,
      query: input.query,
      roots: configuredRoots,
    };
  },
});

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}
