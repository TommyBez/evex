import {
  defaultGitHubAuth,
  type GitHubEventContext,
  type GitHubInboundContext,
  type GitHubJsonObject,
  githubChannel,
  type GitHubChannelState,
} from "eve/channels/github";
import { toolResultFrom } from "eve/tools";

import {
  checkIssueTriageRateLimit,
  claimTriagePublication,
  type RateLimitDecision,
  shouldPostCooldownReply,
} from "../lib/issue-rate-limit";
import {
  detectThinIssueGaps,
  formatReproRequest,
  isThinIssue,
} from "../lib/thin-issue";
import { ISSUE_LABEL_SET } from "../lib/taxonomy";
import triageIssueTool, {
  type TriageIssueOutput,
} from "../tools/triage_issue";

const BOT_NAME = process.env.GITHUB_APP_SLUG || "github-issue-maintainer";
const BOT_MENTION_PATTERN = new RegExp(
  `@${escapeRegExp(BOT_NAME)}(?=$|[^A-Za-z0-9_-])`,
  "i",
);
const GITHUB_COMMENT_CHUNK_SIZE = 60_000;

type IssueMaintainerGitHubState = GitHubChannelState & {
  issueTriageSubmitted?: boolean;
};

export default githubChannel({
  botName: BOT_NAME,
  async onComment(ctx, comment) {
    if (!BOT_MENTION_PATTERN.test(comment.body)) {
      return null;
    }

    // Issue maintainer only — never act on pull request conversations.
    if (!isIssueConversation(ctx)) {
      return null;
    }

    const issueNumber = ctx.conversation.issueNumber;
    if (issueNumber === null) {
      return null;
    }

    const decision = await checkIssueTriageRateLimit({
      installationId: ctx.github.installationId,
      isPrivateRepository: ctx.repository.private,
      issueNumber,
      repositoryId: ctx.repository.id,
      senderId: ctx.sender.id,
      senderLogin: ctx.sender.login,
    });

    if (decision.allowed) {
      return { auth: defaultGitHubAuth(ctx) };
    }

    await maybePostCooldownReply(ctx, decision);
    return null;
  },
  async onIssue(ctx, issue) {
    if (issue.action !== "opened") {
      return null;
    }

    if (!isIssueConversation(ctx)) {
      return null;
    }

    const issueNumber = issue.issueNumber;
    const decision = await checkIssueTriageRateLimit({
      installationId: ctx.github.installationId,
      isPrivateRepository: ctx.repository.private,
      issueNumber,
      repositoryId: ctx.repository.id,
      senderId: ctx.sender.id,
      senderLogin: ctx.sender.login,
    });

    if (!decision.allowed) {
      await maybePostCooldownReply(ctx, decision);
      return null;
    }

    const rawIssue = asObject(issue.raw);
    const title = readString(rawIssue, "title") ?? "";
    const body = readString(rawIssue, "body") ?? "";
    const author =
      readNestedString(rawIssue, ["user", "login"]) ?? ctx.sender.login;
    const existingLabels = readLabelNames(rawIssue);
    const gaps = detectThinIssueGaps(body);
    const thin = isThinIssue(gaps);

    return {
      auth: defaultGitHubAuth(ctx),
      context: [
        [
          "<github_issue_context>",
          `repository: ${ctx.repository.fullName}`,
          `issue_number: ${issueNumber}`,
          `sender: ${author}`,
          `title: ${title}`,
          `existing_labels: ${existingLabels.join(", ") || "(none)"}`,
          `thin_issue: ${thin ? "yes" : "no"}`,
          thin
            ? `thin_gaps: ${[
                gaps.missingRepro ? "repro" : null,
                gaps.missingExpectedVsActual ? "expected_vs_actual" : null,
                gaps.missingEnvironment ? "environment" : null,
              ]
                .filter(Boolean)
                .join(", ")}`
            : null,
          "body:",
          body || "(empty)",
          "</github_issue_context>",
          "",
          "Triage this newly opened GitHub issue. Apply taxonomy labels with triage_issue. If thin_issue is yes, set requestRepro=true and include a short comment asking only for the missing gaps. Do not review pull requests.",
          thin ? `Suggested repro ask:\n${formatReproRequest(gaps)}` : "",
        ]
          .filter((line) => line !== null)
          .join("\n"),
      ],
    };
  },
  events: {
    async "action.result"(data, channel) {
      const match = toolResultFrom(data.result, triageIssueTool);
      if (!match) {
        return;
      }

      if ("invalid" in match.output && match.output.invalid) {
        return;
      }

      const state = channel.state as IssueMaintainerGitHubState;
      if (state.issueTriageSubmitted) {
        return;
      }

      if (state.conversationKind !== "issue") {
        return;
      }

      const issueNumber = state.issueNumber;
      if (issueNumber === null) {
        return;
      }

      const claimed = await claimTriagePublication({
        installationId: channel.github.installationId,
        issueNumber,
        repositoryId: channel.repository.id,
        toolCallId: match.callId,
      });

      if (!claimed) {
        state.issueTriageSubmitted = true;
        return;
      }

      try {
        await publishTriage(channel, match.output as TriageIssueOutput);
        state.issueTriageSubmitted = true;
      } catch {
        state.issueTriageSubmitted = false;
      }
    },
    async "message.completed"(data, channel) {
      if (data.finishReason === "tool-calls" || !data.message) {
        return;
      }

      const state = channel.state as IssueMaintainerGitHubState;
      if (state.issueTriageSubmitted) {
        return;
      }

      if (state.conversationKind !== "issue") {
        return;
      }

      await postCommentChunks(channel, data.message);
    },
  },
});

function isIssueConversation(ctx: GitHubInboundContext) {
  return ctx.conversation.kind === "issue";
}

async function maybePostCooldownReply(
  ctx: GitHubInboundContext,
  decision: Extract<RateLimitDecision, { allowed: false }>,
) {
  const issueNumber = ctx.conversation.issueNumber;
  if (issueNumber === null) {
    return;
  }

  const canReply = await shouldPostCooldownReply({
    installationId: ctx.github.installationId,
    issueNumber,
    repositoryId: ctx.repository.id,
  });

  if (!canReply) {
    return;
  }

  try {
    await ctx.thread.post(formatCooldownReply(decision));
  } catch {
    // If the cooldown notice cannot be posted, still suppress the model run.
  }
}

function formatCooldownReply(
  decision: Extract<RateLimitDecision, { allowed: false }>,
) {
  if (decision.reason === "rate_limit_unavailable") {
    return `\`${BOT_NAME}\` cannot run because rate limiting is unavailable for this repository.`;
  }

  const retryAfter = formatRetryAfter(decision.retryAfterSeconds);
  return `\`${BOT_NAME}\` is cooling down for this issue. Try again ${retryAfter}.`;
}

function formatRetryAfter(retryAfterSeconds: number | undefined) {
  if (!retryAfterSeconds) {
    return "later";
  }

  if (retryAfterSeconds <= 90) {
    return "in about 1 minute";
  }

  return `in about ${Math.ceil(retryAfterSeconds / 60)} minutes`;
}

async function publishTriage(
  channel: GitHubEventContext,
  triage: TriageIssueOutput,
) {
  const issueNumber = channel.state.issueNumber;
  if (issueNumber === null) {
    return;
  }

  const owner = channel.state.owner;
  const repo = channel.state.repo;
  const labels = triage.labels.filter((label) => ISSUE_LABEL_SET.has(label));

  if (labels.length > 0) {
    await channel.github.request({
      method: "POST",
      path: `/repos/${owner}/${repo}/issues/${issueNumber}/labels`,
      body: { labels },
    });
  }

  if (triage.requestRepro && triage.comment?.trim()) {
    await postCommentChunks(channel, triage.comment.trim());
  }
}

async function postCommentChunks(channel: GitHubEventContext, body: string) {
  for (const chunk of chunkText(body, GITHUB_COMMENT_CHUNK_SIZE)) {
    await channel.thread.post(chunk);
  }
}

function chunkText(value: string, size: number): string[] {
  if (value.length <= size) {
    return [value];
  }

  const chunks: string[] = [];
  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size));
  }
  return chunks;
}

function asObject(value: unknown): GitHubJsonObject | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as GitHubJsonObject;
  }
  return null;
}

function readString(
  object: GitHubJsonObject | null,
  key: string,
): string | undefined {
  const value = object?.[key];
  return typeof value === "string" ? value : undefined;
}

function readNestedString(
  object: GitHubJsonObject | null,
  path: readonly string[],
): string | undefined {
  let current: unknown = object;
  for (const key of path) {
    if (!(current && typeof current === "object" && !Array.isArray(current))) {
      return undefined;
    }
    current = (current as GitHubJsonObject)[key];
  }
  return typeof current === "string" ? current : undefined;
}

function readLabelNames(object: GitHubJsonObject | null): string[] {
  const labels = object?.labels;
  if (!Array.isArray(labels)) {
    return [];
  }

  const names: string[] = [];
  for (const label of labels) {
    if (typeof label === "string") {
      names.push(label);
      continue;
    }
    if (label && typeof label === "object" && !Array.isArray(label)) {
      const name = (label as GitHubJsonObject).name;
      if (typeof name === "string") {
        names.push(name);
      }
    }
  }
  return names;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
