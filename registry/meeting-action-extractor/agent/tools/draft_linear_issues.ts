import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  buildLinearIssueDrafts,
  toDraftedIssuesModelValue,
} from "../lib/linear-issue-drafts";
import { validateMeetingActions } from "../lib/meeting-actions";
import { configuredMeetingTranscriptRoots } from "../lib/meeting-transcript-paths";

const draftActionInput = z.object({
  title: z.string().min(1).max(200),
  owner: z.string().max(80),
  deadline: z.string().max(80).nullable(),
  sourcePath: z.string().min(1).max(400),
  evidence: z.string().min(1).max(400),
});

const draftLinearIssuesInput = z.object({
  actions: z
    .array(draftActionInput)
    .min(1)
    .max(20)
    .describe("Validated meeting actions to turn into Linear issue drafts."),
});

/**
 * Builds Linear issue payloads. Never creates issues. Intentionally has no
 * Eve approval — drafting is unattended. Creating requires create_linear_issues.
 */
export default defineTool({
  description:
    "Draft Linear issue payloads from extracted meeting actions. Call after extract_meeting_actions. Always returns created false. Does not create Linear issues. After drafting, call create_linear_issues so a human can approve.",
  inputSchema: draftLinearIssuesInput,
  execute(input) {
    const roots = configuredMeetingTranscriptRoots();
    const result = validateMeetingActions(input.actions, roots);
    if (!result.ok) {
      return {
        drafted: false as const,
        created: false as const,
        note: result.note,
      };
    }

    return buildLinearIssueDrafts(result.actions);
  },
  toModelOutput(output) {
    if (!output.drafted) {
      return {
        type: "json",
        value: {
          drafted: false,
          created: false,
          note: output.note,
        },
      };
    }

    return {
      type: "json",
      value: toDraftedIssuesModelValue(output.issues),
    };
  },
});
