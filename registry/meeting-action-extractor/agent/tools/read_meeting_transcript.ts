import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  configuredMeetingTranscriptRoots,
  isAllowedMeetingTranscriptPath,
  normalizeMeetingTranscriptPath,
} from "../lib/meeting-transcript-paths";

const readMeetingTranscriptInput = z.object({
  path: z
    .string()
    .min(1)
    .max(400)
    .describe(
      "Meeting transcript path to read (must be under MEETING_TRANSCRIPT_ROOTS).",
    ),
  offset: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Optional 1-based start line."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(400)
    .optional()
    .describe("Optional max number of lines to return."),
});

/**
 * Read one meeting transcript from disk. Intentionally has no Eve approval.
 */
export default defineTool({
  description:
    "Read a meeting transcript file from the configured transcript roots. Refuses application source, tests, and paths outside MEETING_TRANSCRIPT_ROOTS.",
  inputSchema: readMeetingTranscriptInput,
  async execute(input, ctx) {
    const roots = configuredMeetingTranscriptRoots();
    const path = normalizeMeetingTranscriptPath(input.path);
    if (!isAllowedMeetingTranscriptPath(path, roots)) {
      return {
        ok: false as const,
        path,
        note: `Path is outside meeting-transcript scope. Allowed roots: ${roots.join(", ")}.`,
      };
    }

    const sandbox = await ctx.getSandbox();
    const start = input.offset ?? 1;
    const limit = input.limit ?? 200;
    const end = start + limit - 1;

    try {
      const content = await sandbox.readTextFile({
        path,
        startLine: start,
        endLine: end,
      });

      if (content === null) {
        return {
          ok: false as const,
          path,
          note: "Meeting transcript file not found in the workspace checkout.",
        };
      }

      return {
        ok: true as const,
        path,
        content: content.slice(0, 24_000),
        offset: start,
        limit,
      };
    } catch {
      return {
        ok: false as const,
        path,
        note: "Could not read the meeting transcript file.",
      };
    }
  },
});
