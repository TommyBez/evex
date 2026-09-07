import type { MeetingAction } from "./meeting-actions";

export type LinearIssueDraft = {
  title: string;
  description: string;
  teamId: string | null;
  teamKey: string | null;
  assigneeName: string | null;
  dueDate: string | null;
  sourcePath: string;
};

export type LinearIssueDraftBundle = {
  drafted: true;
  created: false;
  awaitingApproval: true;
  issues: LinearIssueDraft[];
};

function configuredLinearTeamId(): string | null {
  const value = process.env.LINEAR_TEAM_ID?.trim();
  return value && value.length > 0 ? value : null;
}

function configuredLinearTeamKey(): string | null {
  const value = process.env.LINEAR_TEAM_KEY?.trim();
  return value && value.length > 0 ? value : null;
}

function assigneeFromOwner(owner: string): string | null {
  return owner === "unassigned" ? null : owner;
}

function buildIssueDescription(action: MeetingAction): string {
  const lines = [
    action.evidence,
    "",
    `Source transcript: ${action.sourcePath}`,
  ];
  if (action.deadline) {
    lines.push(`Deadline: ${action.deadline}`);
  }
  if (action.owner !== "unassigned") {
    lines.push(`Owner from transcript: ${action.owner}`);
  }
  lines.push("", "Draft only. Not created in Linear.");
  return lines.join("\n");
}

/** Build Linear issue payloads. Never marks them created. */
export function buildLinearIssueDrafts(
  actions: readonly MeetingAction[],
): LinearIssueDraftBundle {
  const teamId = configuredLinearTeamId();
  const teamKey = configuredLinearTeamKey();

  const issues = actions.map((action) => ({
    title: action.title,
    description: buildIssueDescription(action),
    teamId,
    teamKey,
    assigneeName: assigneeFromOwner(action.owner),
    dueDate: action.deadline,
    sourcePath: action.sourcePath,
  }));

  return {
    drafted: true,
    created: false,
    awaitingApproval: true,
    issues,
  };
}

/** Model-facing draft payload. Keep every field the approval tool requires. */
export function toDraftedIssuesModelValue(
  issues: readonly LinearIssueDraft[],
): {
  drafted: true;
  created: false;
  awaitingApproval: true;
  count: number;
  titles: string[];
  issues: LinearIssueDraft[];
} {
  return {
    drafted: true,
    created: false,
    awaitingApproval: true,
    count: issues.length,
    titles: issues.map((issue) => issue.title),
    issues: [...issues],
  };
}

/** Code-owned create result. This agent never creates Linear issues. */
export function refuseLinearCreate(
  issues: readonly LinearIssueDraft[],
  approved: boolean,
): {
  approved: boolean;
  created: false;
  issues: LinearIssueDraft[];
  note: string;
} {
  return {
    approved,
    created: false,
    issues: [...issues],
    note: approved
      ? "Human approved the drafts. This agent never creates Linear issues. Copy the payloads into Linear yourself."
      : "Drafts are ready. Call create_linear_issues so a human can approve. This agent never creates Linear issues.",
  };
}
