const READ_TOOLS = [
  "list_issues",
  "get_issue",
  "list_comments",
  "list_projects",
  "list_issue_labels",
  "list_issue_statuses",
  "get_issue_status",
  "search_documentation",
] as const;

export const LINEAR_READ_TOOLS: readonly string[] = READ_TOOLS;

export function normalizeLinearToolName(toolName: string): string {
  return toolName.split("__").at(-1) ?? toolName;
}

/**
 * Linear writes always need a human. Reads do not. Unexpected tools fail
 * closed to approval so this agent never auto-creates issues.
 */
export function needsLinearWriteApproval(toolName: string): boolean {
  const normalized = normalizeLinearToolName(toolName);
  return !READ_TOOLS.includes(normalized as (typeof READ_TOOLS)[number]);
}

export function linearConnectorUidFromEnv(
  envValue: string | undefined,
): string {
  const trimmed = envValue?.trim();
  return trimmed && trimmed.length > 0
    ? trimmed
    : "linear/meeting-action-extractor";
}
