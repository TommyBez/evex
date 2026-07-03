import {
  defaultGitHubAuth,
  type GitHubJsonObject,
  githubChannel,
  type GitHubChannelState,
  type GitHubEventContext,
  type GitHubInboundContext,
  type GitHubThread,
} from "eve/channels/github";
import { toolResultFrom } from "eve/tools";
import {
  checkCodeReviewRateLimit,
  claimReviewPublication,
  type RateLimitDecision,
  shouldPostCooldownReply,
} from "../lib/review-rate-limit";
import submitPrReviewTool, {
  type SubmitPrReviewComment,
  type SubmitPrReviewOutput,
} from "../tools/submit_pr_review";

const BOT_NAME = process.env.GITHUB_APP_SLUG || "code-reviewer";
const BOT_MENTION_PATTERN = new RegExp(
  `@${escapeRegExp(BOT_NAME)}(?=$|[^A-Za-z0-9_-])`,
  "i",
);
const GITHUB_COMMENT_CHUNK_SIZE = 60_000;

type CodeReviewerGitHubState = GitHubChannelState & {
  codeReviewerReviewSubmitted?: boolean;
};

export default githubChannel({
  botName: BOT_NAME,
  pullRequestContext: {
    excludedFiles: [
      "**/pnpm-lock.yaml",
      "**/package-lock.json",
      "**/yarn.lock",
      "**/bun.lockb",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
    ],
  },
  async onComment(ctx, comment) {
    if (!BOT_MENTION_PATTERN.test(comment.body)) {
      return null;
    }

    if (!isPullRequestConversation(ctx)) {
      return null;
    }

    const pullRequestNumber = ctx.conversation.pullRequestNumber;
    if (pullRequestNumber === null) {
      return null;
    }

    const decision = await checkCodeReviewRateLimit({
      installationId: ctx.github.installationId,
      isPrivateRepository: ctx.repository.private,
      pullRequestNumber,
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
  events: {
    async "action.result"(data, channel) {
      const match = toolResultFrom(data.result, submitPrReviewTool);
      if (!match) {
        return;
      }

      const state = channel.state as CodeReviewerGitHubState;
      if (state.codeReviewerReviewSubmitted) {
        return;
      }

      const claimed = await claimReviewPublication({
        headSha: state.headSha,
        installationId: channel.github.installationId,
        pullRequestNumber: state.pullRequestNumber ?? 0,
        repositoryId: channel.repository.id,
        toolCallId: match.callId,
      });

      if (!claimed) {
        state.codeReviewerReviewSubmitted = true;
        return;
      }

      try {
        await publishReview(channel, match.output);
        state.codeReviewerReviewSubmitted = true;
      } catch {
        state.codeReviewerReviewSubmitted = false;
      }
    },
    async "message.completed"(data, channel) {
      if (data.finishReason === "tool-calls" || !data.message) {
        return;
      }

      const state = channel.state as CodeReviewerGitHubState;
      if (state.codeReviewerReviewSubmitted) {
        return;
      }

      await postCommentChunks(channel.thread, data.message);
    },
  },
});

function isPullRequestConversation(ctx: GitHubInboundContext) {
  return (
    ctx.conversation.kind === "pull_request" ||
    ctx.conversation.kind === "review_thread"
  );
}

async function maybePostCooldownReply(
  ctx: GitHubInboundContext,
  decision: Extract<RateLimitDecision, { allowed: false }>,
) {
  const pullRequestNumber = ctx.conversation.pullRequestNumber;
  if (pullRequestNumber === null) {
    return;
  }

  const canReply = await shouldPostCooldownReply({
    installationId: ctx.github.installationId,
    pullRequestNumber,
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

function formatCooldownReply(decision: Extract<RateLimitDecision, { allowed: false }>) {
  if (decision.reason === "rate_limit_unavailable") {
    return `\`${BOT_NAME}\` cannot run because rate limiting is unavailable for this repository.`;
  }

  const retryAfter = formatRetryAfter(decision.retryAfterSeconds);
  return `\`${BOT_NAME}\` is cooling down for this pull request. Try again ${retryAfter}.`;
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

async function publishReview(
  channel: GitHubEventContext,
  review: SubmitPrReviewOutput,
) {
  const pullRequestNumber = channel.state.pullRequestNumber;
  if (pullRequestNumber === null || review.comments.length === 0) {
    await postCommentChunks(channel.thread, review.summary);
    return;
  }

  try {
    await createBatchReview(channel, review, pullRequestNumber);
    return;
  } catch {
    await publishFallbackReview(channel, review, pullRequestNumber);
  }
}

async function createBatchReview(
  channel: GitHubEventContext,
  review: SubmitPrReviewOutput,
  pullRequestNumber: number,
) {
  const body: GitHubJsonObject = {
    body: review.summary,
    comments: review.comments.map(toGitHubReviewComment),
    event: "COMMENT",
    ...(channel.state.headSha ? { commit_id: channel.state.headSha } : {}),
  };

  await channel.github.request({
    body,
    method: "POST",
    path: githubPullRequestReviewPath(channel.state, pullRequestNumber),
  });
}

async function publishFallbackReview(
  channel: GitHubEventContext,
  review: SubmitPrReviewOutput,
  pullRequestNumber: number,
) {
  const failedComments: SubmitPrReviewComment[] = [];
  let publishedCount = 0;

  if (channel.state.headSha) {
    for (const comment of review.comments) {
      try {
        await channel.github.request({
          body: {
            ...toGitHubReviewComment(comment),
            commit_id: channel.state.headSha,
          },
          method: "POST",
          path: githubPullRequestCommentPath(channel.state, pullRequestNumber),
        });
        publishedCount += 1;
      } catch {
        failedComments.push(comment);
      }
    }
  } else {
    failedComments.push(...review.comments);
  }

  await postCommentChunks(
    channel.thread,
    formatFallbackSummary(review.summary, failedComments, publishedCount),
  );
}

function toGitHubReviewComment(comment: SubmitPrReviewComment): GitHubJsonObject {
  return {
    body: formatInlineCommentBody(comment),
    line: comment.line,
    path: comment.path,
    side: comment.side,
    ...(comment.startLine
      ? {
          start_line: comment.startLine,
          start_side: comment.startSide ?? comment.side,
        }
      : {}),
  };
}

function formatInlineCommentBody(comment: SubmitPrReviewComment) {
  const parts = [`**${comment.severity}:** ${comment.body}`];

  if (comment.suggestion) {
    parts.push("", "```suggestion", comment.suggestion, "```");
  }

  return parts.join("\n");
}

function formatFallbackSummary(
  summary: string,
  failedComments: readonly SubmitPrReviewComment[],
  publishedCount: number,
) {
  if (failedComments.length === 0) {
    return publishedCount > 0
      ? `${summary}\n\nPosted ${publishedCount} inline comments.`
      : summary;
  }

  const failedList = failedComments.map(
    (comment) =>
      `- ${comment.path}:${comment.line} **${comment.severity}:** ${comment.body}`,
  );

  const prefix =
    publishedCount > 0
      ? `Posted ${publishedCount} inline comments. These findings could not be anchored inline:`
      : "These findings could not be anchored inline:";

  return [summary, "", prefix, ...failedList].join("\n");
}

async function postCommentChunks(thread: GitHubThread, message: string) {
  for (const chunk of splitCommentBody(message)) {
    await thread.post(chunk);
  }
}

function splitCommentBody(message: string) {
  if (message.length <= GITHUB_COMMENT_CHUNK_SIZE) {
    return [message];
  }

  const chunks: string[] = [];
  for (
    let startIndex = 0;
    startIndex < message.length;
    startIndex += GITHUB_COMMENT_CHUNK_SIZE
  ) {
    chunks.push(message.slice(startIndex, startIndex + GITHUB_COMMENT_CHUNK_SIZE));
  }

  return chunks;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function githubPullRequestReviewPath(
  state: GitHubChannelState,
  pullRequestNumber: number,
) {
  return `/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(
    state.repo,
  )}/pulls/${pullRequestNumber}/reviews`;
}

function githubPullRequestCommentPath(
  state: GitHubChannelState,
  pullRequestNumber: number,
) {
  return `/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(
    state.repo,
  )}/pulls/${pullRequestNumber}/comments`;
}
