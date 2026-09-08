export type RobotsRule = {
  readonly type: "allow" | "disallow";
  readonly path: string;
};

export type RobotsGroup = {
  readonly userAgents: readonly string[];
  readonly rules: readonly RobotsRule[];
  readonly crawlDelaySeconds?: number;
};

export type RobotsTxt = {
  readonly groups: readonly RobotsGroup[];
};

const COMMENT = /#.*$/;
const USER_AGENT = /^user-agent:\s*(.+)$/i;
const ALLOW = /^allow:\s*(.*)$/i;
const DISALLOW = /^disallow:\s*(.*)$/i;
const CRAWL_DELAY = /^crawl-delay:\s*(\d+(?:\.\d+)?)$/i;

const normalizePath = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "";
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

export const parseRobotsTxt = (body: string): RobotsTxt => {
  const groups: RobotsGroup[] = [];
  let userAgents: string[] = [];
  let rules: RobotsRule[] = [];
  let crawlDelaySeconds: number | undefined;
  let startedGroup = false;

  const flush = () => {
    if (!startedGroup || userAgents.length === 0) {
      userAgents = [];
      rules = [];
      crawlDelaySeconds = undefined;
      startedGroup = false;
      return;
    }
    groups.push({ userAgents, rules, crawlDelaySeconds });
    userAgents = [];
    rules = [];
    crawlDelaySeconds = undefined;
    startedGroup = false;
  };

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.replace(COMMENT, "").trim();
    if (line.length === 0) {
      continue;
    }

    const userAgentMatch = USER_AGENT.exec(line);
    if (userAgentMatch?.[1]) {
      const agent = userAgentMatch[1].trim().toLowerCase();
      if (startedGroup && rules.length > 0) {
        flush();
      }
      startedGroup = true;
      userAgents = [...userAgents, agent];
      continue;
    }

    const allowMatch = ALLOW.exec(line);
    if (allowMatch) {
      startedGroup = true;
      rules = [...rules, { type: "allow", path: normalizePath(allowMatch[1] ?? "") }];
      continue;
    }

    const disallowMatch = DISALLOW.exec(line);
    if (disallowMatch) {
      startedGroup = true;
      rules = [...rules, { type: "disallow", path: normalizePath(disallowMatch[1] ?? "") }];
      continue;
    }

    const crawlDelayMatch = CRAWL_DELAY.exec(line);
    if (crawlDelayMatch?.[1]) {
      startedGroup = true;
      crawlDelaySeconds = Number.parseFloat(crawlDelayMatch[1]);
    }
  }

  flush();
  return { groups };
};

const matchesUserAgent = (group: RobotsGroup, userAgent: string): boolean => {
  const needle = userAgent.trim().toLowerCase();
  return group.userAgents.some(
    (agent) => agent === "*" || needle === agent || needle.startsWith(`${agent}/`) || needle.startsWith(agent),
  );
};

const groupSpecificity = (group: RobotsGroup, userAgent: string): number => {
  const needle = userAgent.trim().toLowerCase();
  let best = 0;
  for (const agent of group.userAgents) {
    if (agent === "*") {
      best = Math.max(best, 1);
      continue;
    }
    if (needle === agent || needle.startsWith(`${agent}/`) || needle.startsWith(agent)) {
      best = Math.max(best, agent.length + 10);
    }
  }
  return best;
};

const escapeRegex = (value: string): string => value.replace(/[.+?^${}()|[\]\\]/g, "\\$&");

const ruleToPattern = (rulePath: string): RegExp => {
  const anchored = rulePath.endsWith("$");
  const body = anchored ? rulePath.slice(0, -1) : rulePath;
  const source = body.split("*").map(escapeRegex).join(".*");
  return new RegExp(`^${source}${anchored ? "$" : ""}`);
};

const pathMatches = (rulePath: string, urlPath: string): boolean => {
  if (rulePath.length === 0) {
    return false;
  }
  if (!rulePath.includes("*") && !rulePath.endsWith("$")) {
    return urlPath === rulePath || urlPath.startsWith(rulePath);
  }
  return ruleToPattern(rulePath).test(urlPath);
};

export const isUrlAllowedByRobots = (
  robots: RobotsTxt,
  url: string,
  userAgent: string,
): { allowed: boolean; matchedRule?: RobotsRule; crawlDelaySeconds?: number } => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { allowed: false };
  }

  const urlPath = `${parsed.pathname}${parsed.search}`;
  const matching = robots.groups
    .map((group) => ({ group, specificity: groupSpecificity(group, userAgent) }))
    .filter((entry) => entry.specificity > 0 && matchesUserAgent(entry.group, userAgent))
    .sort((left, right) => right.specificity - left.specificity);

  const group = matching[0]?.group;
  if (!group) {
    return { allowed: true };
  }

  let matched: RobotsRule | undefined;
  for (const rule of group.rules) {
    if (!pathMatches(rule.path, urlPath)) {
      continue;
    }
    if (!matched || rule.path.length > matched.path.length) {
      matched = rule;
      continue;
    }
    if (rule.path.length === matched.path.length && rule.type === "allow") {
      matched = rule;
    }
  }

  if (!matched) {
    return { allowed: true, crawlDelaySeconds: group.crawlDelaySeconds };
  }

  return {
    allowed: matched.type === "allow",
    matchedRule: matched,
    crawlDelaySeconds: group.crawlDelaySeconds,
  };
};
