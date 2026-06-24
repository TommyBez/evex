import { connect } from "@vercel/connect/eve";
import { defineMcpClientConnection } from "eve/connections";

import {
  getCoveredInitiative,
  linearOperationsConfig,
} from "../lib/linear-operations-config.js";

const READ_TOOLS = [
  "list_issues",
  "get_issue",
  "list_comments",
  "list_projects",
  "get_status_updates",
  "list_cycles",
  "list_issue_labels",
  "list_issue_statuses",
  "get_issue_status",
  "extract_images",
  "search_documentation",
] as const;

const WRITE_TOOLS = [
  "save_issue",
  "save_comment",
  "save_project",
  "save_document",
  "save_status_update",
  "delete_status_update",
] as const;

const normalizeToolName = (toolName: string): string => toolName.split("__").at(-1) ?? toolName;

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const getStringField = (input: Record<string, unknown>, field: string): string | undefined => {
  const value = input[field];
  return typeof value === "string" && value.trim() ? value : undefined;
};

const getRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is required. Create a Vercel Connect Linear connector and set this to the returned connector UID.`,
    );
  }
  return value;
};

const needsSaveIssueApproval = (toolInput: unknown): boolean => {
  const input = asRecord(toolInput);
  if (!getStringField(input, "id")) return true;

  const changedFields = Object.keys(input).filter((field) => field !== "id");
  return changedFields.length > 0;
};

const needsStatusUpdateApproval = (toolInput: unknown): boolean => {
  const input = asRecord(toolInput);
  const type = getStringField(input, "type");
  const initiativeIdOrName =
    getStringField(input, "initiativeId") ??
    getStringField(input, "initiativeName") ??
    getStringField(input, "initiative") ??
    getStringField(input, "projectMilestoneId");
  const coveredInitiative = getCoveredInitiative(initiativeIdOrName ?? "");

  if (
    type === "initiative" &&
    linearOperationsConfig.policy.autoInitiativeUpdates &&
    coveredInitiative?.weeklyUpdateEnabled === true
  ) {
    return false;
  }

  return true;
};

export default defineMcpClientConnection({
  url: "https://mcp.linear.app/mcp",
  description:
    "Linear workspace operations: read issues, comments, projects, cycles, labels, statuses, status updates, and create approved operational updates.",
  auth: connect(getRequiredEnv("LINEAR_CONNECT_UID")),
  tools: {
    allow: [...READ_TOOLS, ...WRITE_TOOLS],
  },
  approval: ({ toolName, toolInput }) => {
    const normalizedToolName = normalizeToolName(toolName);

    if (READ_TOOLS.includes(normalizedToolName as (typeof READ_TOOLS)[number])) return false;
    if (normalizedToolName === "save_comment") return false;
    if (normalizedToolName === "save_status_update") return needsStatusUpdateApproval(toolInput);
    if (normalizedToolName === "save_issue") return needsSaveIssueApproval(toolInput);
    if (
      normalizedToolName === "save_project" ||
      normalizedToolName === "save_document" ||
      normalizedToolName === "delete_status_update"
    ) {
      return true;
    }

    return true;
  },
});
