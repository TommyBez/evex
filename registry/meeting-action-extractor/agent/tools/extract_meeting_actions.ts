import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  validateMeetingActions,
  type MeetingAction,
} from "../lib/meeting-actions";
import { configuredMeetingTranscriptRoots } from "../lib/meeting-transcript-paths";

const meetingActionInput = z.object({
  title: z
    .string()
    .min(1)
    .max(200)
    .describe("Short action title from the transcript."),
  owner: z
    .string()
    .max(80)
    .describe("Person named as owner. Use unassigned when none is named."),
  deadline: z
    .string()
    .max(80)
    .nullable()
    .describe("Due date as YYYY-MM-DD or a short phrase. Null when none."),
  sourcePath: z
    .string()
    .min(1)
    .max(400)
    .describe("Transcript path this action came from (under MEETING_TRANSCRIPT_ROOTS)."),
  evidence: z
    .string()
    .min(1)
    .max(400)
    .describe("Short quote from the transcript that supports the action."),
});

const extractMeetingActionsInput = z.object({
  actions: z
    .array(meetingActionInput)
    .min(1)
    .max(20)
    .describe("Structured owners, deadlines, and titles extracted from transcripts."),
});

export type ExtractMeetingActionsOutput =
  | {
      extracted: true;
      actions: MeetingAction[];
    }
  | {
      extracted: false;
      note: string;
      rejectedPaths?: string[];
    };

/**
 * Records structured meeting actions after code validation.
 * Intentionally has no Eve approval. Does not create Linear issues.
 */
export default defineTool({
  description:
    "Record structured meeting actions (title, owner, deadline, source path, evidence) extracted from transcripts on disk. Call after search_meeting_transcripts and read_meeting_transcript. Does not create Linear issues.",
  inputSchema: extractMeetingActionsInput,
  execute(input): ExtractMeetingActionsOutput {
    const roots = configuredMeetingTranscriptRoots();
    const result = validateMeetingActions(input.actions, roots);
    if (!result.ok) {
      return {
        extracted: false,
        note: result.note,
        rejectedPaths: result.rejectedPaths,
      };
    }

    return {
      extracted: true,
      actions: result.actions,
    };
  },
  toModelOutput(output) {
    if (!output.extracted) {
      return {
        type: "json",
        value: {
          extracted: false,
          note: output.note,
        },
      };
    }

    return {
      type: "json",
      value: {
        extracted: true,
        count: output.actions.length,
        actions: output.actions.map((action) => ({
          title: action.title,
          owner: action.owner,
          deadline: action.deadline,
          sourcePath: action.sourcePath,
        })),
      },
    };
  },
});
