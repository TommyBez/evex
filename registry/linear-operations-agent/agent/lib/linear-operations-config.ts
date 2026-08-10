export type CoveredInitiative = {
  readonly idOrName: string;
  readonly slackChannelId?: string;
  readonly weeklyUpdateEnabled: boolean;
};

export type SlackChannelKind = "default" | "triage" | "cycle" | "backlog" | "p1Monitoring";

export type LinearOperationsConfig = {
  readonly coveredTeams: readonly string[];
  readonly coveredProjects: readonly string[];
  readonly coveredInitiatives: readonly CoveredInitiative[];
  readonly slack: {
    readonly defaultChannelId?: string;
    readonly triageChannelId?: string;
    readonly cycleChannelId?: string;
    readonly backlogChannelId?: string;
    readonly p1MonitoringChannelId?: string;
    readonly projectChannels: Readonly<Record<string, string>>;
  };
  readonly policy: {
    readonly readOnlyTeams: readonly string[];
    readonly maxBulkIssueCount: number;
    readonly highPriorityValues: readonly number[];
    readonly autoInitiativeUpdates: boolean;
  };
  readonly schedules: {
    readonly dailyTriageDigest: string;
    readonly cycleHealth: string;
    readonly weeklyBacklogHygiene: string;
    readonly weeklyProjectSummary: string;
    readonly weeklyInitiativeUpdates: string;
    readonly p1Monitoring: string;
  };
};

const DEFAULT_MAX_BULK_ISSUE_COUNT = 10;
const HIGH_PRIORITY_VALUES = [1, 2] as const;

const compactCsv = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const optional = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return value.trim().toLowerCase() !== "false";
};

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseProjectChannels = (value: string | undefined): Record<string, string> => {
  const entries: Record<string, string> = {};
  for (const pair of compactCsv(value)) {
    const [project, channelId] = pair.split(":").map((part) => part.trim());
    if (project && channelId) entries[project] = channelId;
  }
  return entries;
};

const parseCoveredInitiatives = (value: string | undefined): CoveredInitiative[] => {
  return compactCsv(value).map((rawItem) => {
    const [idOrName = "", slackChannelId, enabledFlag] = rawItem
      .split("|")
      .map((part) => part.trim());

    return {
      idOrName,
      slackChannelId: optional(slackChannelId),
      weeklyUpdateEnabled: enabledFlag === undefined || enabledFlag.toLowerCase() !== "false",
    };
  });
};

export const linearOperationsConfig = {
  coveredTeams: compactCsv(process.env.LINEAR_OPS_COVERED_TEAMS),
  coveredProjects: compactCsv(process.env.LINEAR_OPS_COVERED_PROJECTS),
  coveredInitiatives: parseCoveredInitiatives(process.env.LINEAR_OPS_COVERED_INITIATIVES),
  slack: {
    defaultChannelId: optional(process.env.LINEAR_OPS_DEFAULT_SLACK_CHANNEL_ID),
    triageChannelId: optional(process.env.LINEAR_OPS_TRIAGE_SLACK_CHANNEL_ID),
    cycleChannelId: optional(process.env.LINEAR_OPS_CYCLE_SLACK_CHANNEL_ID),
    backlogChannelId: optional(process.env.LINEAR_OPS_BACKLOG_SLACK_CHANNEL_ID),
    p1MonitoringChannelId: optional(process.env.LINEAR_OPS_P1_SLACK_CHANNEL_ID),
    projectChannels: parseProjectChannels(process.env.LINEAR_OPS_PROJECT_CHANNELS),
  },
  policy: {
    readOnlyTeams: compactCsv(process.env.LINEAR_OPS_READ_ONLY_TEAMS),
    maxBulkIssueCount: parsePositiveInteger(
      process.env.LINEAR_OPS_MAX_BULK_ISSUE_COUNT,
      DEFAULT_MAX_BULK_ISSUE_COUNT,
    ),
    highPriorityValues: HIGH_PRIORITY_VALUES,
    autoInitiativeUpdates: parseBoolean(process.env.LINEAR_OPS_AUTO_INITIATIVE_UPDATES, true),
  },
  schedules: {
    dailyTriageDigest: process.env.LINEAR_OPS_DAILY_TRIAGE_CRON ?? "0 7 * * 1-5",
    cycleHealth: process.env.LINEAR_OPS_CYCLE_HEALTH_CRON ?? "30 7 * * 1-5",
    weeklyBacklogHygiene: process.env.LINEAR_OPS_WEEKLY_BACKLOG_CRON ?? "0 8 * * 1",
    weeklyProjectSummary: process.env.LINEAR_OPS_WEEKLY_PROJECT_CRON ?? "30 8 * * 1",
    weeklyInitiativeUpdates: process.env.LINEAR_OPS_WEEKLY_INITIATIVE_CRON ?? "0 9 * * 1",
    p1Monitoring: process.env.LINEAR_OPS_P1_MONITORING_CRON ?? "0 13 * * 1-5",
  },
} satisfies LinearOperationsConfig;

export const getSlackChannelId = (kind: SlackChannelKind): string | undefined => {
  switch (kind) {
    case "triage":
      return linearOperationsConfig.slack.triageChannelId ?? linearOperationsConfig.slack.defaultChannelId;
    case "cycle":
      return linearOperationsConfig.slack.cycleChannelId ?? linearOperationsConfig.slack.defaultChannelId;
    case "backlog":
      return linearOperationsConfig.slack.backlogChannelId ?? linearOperationsConfig.slack.defaultChannelId;
    case "p1Monitoring":
      return (
        linearOperationsConfig.slack.p1MonitoringChannelId ?? linearOperationsConfig.slack.defaultChannelId
      );
    case "default":
      return linearOperationsConfig.slack.defaultChannelId;
  }
};

export const getProjectSlackChannelId = (projectNameOrId: string): string | undefined =>
  linearOperationsConfig.slack.projectChannels[projectNameOrId] ?? linearOperationsConfig.slack.defaultChannelId;

export const getCoveredInitiative = (idOrName: string): CoveredInitiative | undefined =>
  linearOperationsConfig.coveredInitiatives.find((initiative) => initiative.idOrName === idOrName);

export const isExplicitlyCoveredInitiative = (idOrName: string | undefined): boolean =>
  idOrName !== undefined && getCoveredInitiative(idOrName) !== undefined;

export const formatPolicySummary = (): string => {
  const readOnlyTeams = linearOperationsConfig.policy.readOnlyTeams.join(", ") || "none configured";
  const coveredTeams = linearOperationsConfig.coveredTeams.join(", ") || "all teams";
  const coveredProjects = linearOperationsConfig.coveredProjects.join(", ") || "all projects";
  const initiatives =
    linearOperationsConfig.coveredInitiatives.map((initiative) => initiative.idOrName).join(", ") ||
    "none configured";

  return [
    `Covered teams: ${coveredTeams}`,
    `Covered projects: ${coveredProjects}`,
    `Read-only teams: ${readOnlyTeams}`,
    `Explicit initiatives for weekly updates: ${initiatives}`,
    `Max bulk issue count: ${linearOperationsConfig.policy.maxBulkIssueCount}`,
  ].join("\n");
};
