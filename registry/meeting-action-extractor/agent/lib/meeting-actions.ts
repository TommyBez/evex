import {
  isAllowedMeetingTranscriptPath,
  normalizeMeetingTranscriptPath,
} from "./meeting-transcript-paths";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const UNASSIGNED_OWNERS = new Set(["", "unassigned", "tbd", "n/a", "none", "?"]);

export type MeetingActionInput = {
  title: string;
  owner: string;
  deadline: string | null;
  sourcePath: string;
  evidence: string;
};

export type MeetingAction = {
  title: string;
  owner: string;
  deadline: string | null;
  sourcePath: string;
  evidence: string;
};

export type MeetingActionDecision =
  | { ok: true; action: MeetingAction }
  | { ok: false; note: string; sourcePath?: string };

/** Normalize a deadline to YYYY-MM-DD, a short phrase, or null. */
export function normalizeDeadline(input: string | null | undefined): string | null {
  if (input === undefined || input === null) {
    return null;
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (ISO_DATE.test(trimmed)) {
    return trimmed;
  }

  return trimmed.slice(0, 80);
}

/** Normalize an owner label. Empty / TBD values become `unassigned`. */
export function normalizeOwner(input: string | undefined): string {
  const trimmed = input?.trim() ?? "";
  if (UNASSIGNED_OWNERS.has(trimmed.toLowerCase())) {
    return "unassigned";
  }
  return trimmed.slice(0, 80);
}

/**
 * Validate one extracted action. Source paths must sit under the configured
 * meeting-transcript roots. Title and evidence are required.
 */
export function validateMeetingAction(
  input: MeetingActionInput,
  roots: readonly string[],
): MeetingActionDecision {
  const title = input.title.trim();
  if (title.length === 0) {
    return { ok: false, note: "Each action needs a non-empty title." };
  }

  const evidence = input.evidence.trim();
  if (evidence.length === 0) {
    return {
      ok: false,
      note: "Each action needs a short evidence quote from the transcript.",
    };
  }

  const sourcePath = normalizeMeetingTranscriptPath(input.sourcePath);
  if (!isAllowedMeetingTranscriptPath(sourcePath, roots)) {
    return {
      ok: false,
      note: `Source path is outside meeting-transcript scope. Allowed roots: ${roots.join(", ")}.`,
      sourcePath,
    };
  }

  return {
    ok: true,
    action: {
      title: title.slice(0, 200),
      owner: normalizeOwner(input.owner),
      deadline: normalizeDeadline(input.deadline),
      sourcePath,
      evidence: evidence.slice(0, 400),
    },
  };
}

export function validateMeetingActions(
  inputs: readonly MeetingActionInput[],
  roots: readonly string[],
):
  | { ok: true; actions: MeetingAction[] }
  | { ok: false; note: string; rejectedPaths: string[] } {
  const actions: MeetingAction[] = [];
  const rejectedPaths: string[] = [];
  const notes: string[] = [];

  for (const input of inputs) {
    const decision = validateMeetingAction(input, roots);
    if (!decision.ok) {
      notes.push(decision.note);
      if (decision.sourcePath) {
        rejectedPaths.push(decision.sourcePath);
      }
      continue;
    }
    actions.push(decision.action);
  }

  if (actions.length === 0) {
    return {
      ok: false,
      note:
        notes[0] ??
        "No valid actions. Cite a transcript under the configured meeting roots.",
      rejectedPaths,
    };
  }

  return { ok: true, actions };
}
