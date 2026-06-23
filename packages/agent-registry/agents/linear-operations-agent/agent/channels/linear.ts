import { defaultLinearAuth, linearChannel } from "eve/channels/linear";

import { formatPolicySummary, linearOperationsConfig } from "../lib/linear-operations-config.js";

const isString = (value: string | undefined): value is string => value !== undefined;

type LinearIssueContext = {
  readonly identifier?: string;
  readonly id?: string;
  readonly team?: {
    readonly id?: string;
    readonly key?: string;
    readonly name?: string;
  } | null;
  readonly project?: {
    readonly id?: string;
    readonly name?: string;
    readonly slug?: string;
  } | null;
};

type LinearAgentSessionEventLike = {
  readonly action?: string;
  readonly agentSession?: {
    readonly issue?: LinearIssueContext | null;
  } | null;
};

const issueMatchesScope = (issue: LinearIssueContext | null | undefined): boolean => {
  if (!issue) return true;

  const teamCandidates = [issue.team?.id, issue.team?.key, issue.team?.name].filter(isString);
  const projectCandidates = [issue.project?.id, issue.project?.slug, issue.project?.name].filter(isString);

  const teamAllowed =
    linearOperationsConfig.coveredTeams.length === 0 ||
    teamCandidates.length === 0 ||
    teamCandidates.some((team) => linearOperationsConfig.coveredTeams.includes(team));
  const projectAllowed =
    linearOperationsConfig.coveredProjects.length === 0 ||
    projectCandidates.length === 0 ||
    projectCandidates.some((project) => linearOperationsConfig.coveredProjects.includes(project));

  return teamAllowed && projectAllowed;
};

const formatLinearContext = (event: LinearAgentSessionEventLike): string => {
  const issue = event.agentSession?.issue;
  const issueLabel = issue?.identifier ?? issue?.id ?? "unknown issue";
  const teamLabel = issue?.team?.key ?? issue?.team?.name ?? issue?.team?.id ?? "unknown team";
  const projectLabel = issue?.project?.name ?? issue?.project?.slug ?? issue?.project?.id ?? "no project";

  return [
    "Surface: Linear Agent Session.",
    `Issue: ${issueLabel}`,
    `Team: ${teamLabel}`,
    `Project: ${projectLabel}`,
    "Linear is the source of truth. Keep proposals and executed actions attached to the relevant Linear object.",
    "Policy summary:",
    formatPolicySummary(),
  ].join("\n");
};

export default linearChannel({
  credentials: {
    accessToken: process.env.LINEAR_AGENT_ACCESS_TOKEN,
    webhookSecret: process.env.LINEAR_WEBHOOK_SECRET,
  },
  onAgentSession: (_ctx, event) => {
    const eventLike = event as LinearAgentSessionEventLike;
    if (event.action !== "created" && event.action !== "prompted") return null;
    if (!issueMatchesScope(eventLike.agentSession?.issue)) return null;

    return {
      auth: defaultLinearAuth(event),
      context: [formatLinearContext(eventLike)],
    };
  },
});
