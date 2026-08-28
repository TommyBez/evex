import {
  type GitHubCheckRunEvent,
  type GitHubChannelState,
  type GitHubEventContext,
  type GitHubInboundContext,
  type GitHubThread,
  githubChannel,
} from "eve/channels/github";
import { toolResultFrom } from "eve/tools";

import { handleClaimedCheckRun } from "../lib/check-run-flow";
import {
  type CheckRunHandledClaimInput,
  bindWebhookCheckRunId,
  claimCheckRunHandled,
  claimCiPublication,
  checkCiExplainerRateLimit,
  clearWebhookCheckRunId,
  releaseCheckRunHandled,
  releaseCiPublication,
  resolveTrustedHandledClaimCheckRunId,
  resolveWebhookCheckRunId,
} from "../lib/ci-rate-limit";
import {
  buildFailureContext,
  buildPublishedExplanation,
} from "../lib/failure-context";
import {
  formatCiFailureComment,
  type FailedCheckDetails,
} from "../lib/fetch-check-failure";
import explainCiFailureTool, {
  type ExplainCiFailureOutput,
} from "../tools/explain_ci_failure";

const BOT_NAME = process.env.GITHUB_APP_SLUG || "github-ci-explainer";
const GITHUB_COMMENT_CHUNK_SIZE = 60_000;
const GITHUB_ACTIONS_SLUG = "github-actions";

type CiExplainerGitHubState = GitHubChannelState & {
  ciExplanationSubmitted?: boolean;
  /** Webhook-owned check run id for this turn; never trust the tool alone. */
  webhookCheckRunId?: number;
};

export default githubChannel({
  botName: BOT_NAME,
  // Check-driven only — ignore mention turns.
  async onComment() {
    return null;
  },
  async onCheckRun(ctx, checkRun) {
    if (!isFailedGitHubActionsCheck(checkRun)) {
      return null;
    }

    const decision = await checkCiExplainerRateLimit({
      checkRunId: checkRun.checkRunId,
      headSha: checkRun.headSha,
      installationId: ctx.github.installationId,
      isPrivateRepository: ctx.repository.private,
      repositoryId: ctx.repository.id,
    });

    if (!decision.allowed) {
      return null;
    }

    const handledClaim: CheckRunHandledClaimInput = {
      checkRunId: checkRun.checkRunId,
      installationId: ctx.github.installationId,
      repositoryId: ctx.repository.id,
    };

    const claimed = await claimCheckRunHandled(handledClaim);
    if (!claimed) {
      return null;
    }

    const pullRequestNumber = checkRun.pullRequests[0] ?? null;
    if (pullRequestNumber !== null) {
      // Carry the webhook-owned id into the PR turn for claim cleanup.
      await bindWebhookCheckRunId({
        checkRunId: checkRun.checkRunId,
        headSha: checkRun.headSha,
        installationId: ctx.github.installationId,
        pullRequestNumber,
        repositoryId: ctx.repository.id,
      });
    }

    try {
      return await handleClaimedCheckRun({
        buildFailureContext,
        checkRun,
        ctx,
        handledClaim,
        postCommit: postCommitComment,
      });
    } catch {
      // handleClaimedCheckRun already released on its failure paths; release
      // again here for any unexpected throw so redeliveries are never stuck.
      await releaseCheckRunHandled(handledClaim);
      if (pullRequestNumber !== null) {
        await clearWebhookCheckRunId({
          headSha: checkRun.headSha,
          installationId: ctx.github.installationId,
          pullRequestNumber,
          repositoryId: ctx.repository.id,
        });
      }
      return null;
    }
  },
  events: {
    async "action.result"(data, channel) {
      const match = toolResultFrom(data.result, explainCiFailureTool);
      if (!match) {
        return;
      }

      if ("invalid" in match.output && match.output.invalid) {
        return;
      }

      const state = channel.state as CiExplainerGitHubState;
      if (state.ciExplanationSubmitted) {
        return;
      }

      const explanation = match.output as ExplainCiFailureOutput;
      const pullRequestNumber = state.pullRequestNumber;
      if (pullRequestNumber === null) {
        return;
      }

      const bindingInput = {
        headSha: state.headSha,
        installationId: channel.github.installationId,
        pullRequestNumber,
        repositoryId: channel.repository.id,
      };

      const webhookCheckRunId =
        state.webhookCheckRunId ?? (await resolveWebhookCheckRunId(bindingInput));

      // Without Upstash, handled-claim cleanup is a no-op — accept the reported
      // id. With Upstash, require the webhook-bound id and reject mismatches.
      const upstashConfigured = Boolean(
        process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN,
      );
      let trustedCheckRunId: number;
      if (upstashConfigured) {
        const trusted = resolveTrustedHandledClaimCheckRunId({
          reportedCheckRunId: explanation.checkRunId,
          webhookCheckRunId,
        });
        if (!trusted.ok) {
          // Do not publish or release — a mismatched id must not touch Redis.
          return;
        }
        trustedCheckRunId = trusted.checkRunId;
      } else {
        trustedCheckRunId = explanation.checkRunId;
      }

      state.webhookCheckRunId = trustedCheckRunId;

      const claimInput = {
        headSha: state.headSha,
        installationId: channel.github.installationId,
        pullRequestNumber,
        repositoryId: channel.repository.id,
        toolCallId: match.callId,
      };
      const handledClaim: CheckRunHandledClaimInput = {
        checkRunId: trustedCheckRunId,
        installationId: channel.github.installationId,
        repositoryId: channel.repository.id,
      };

      const claimed = await claimCiPublication(claimInput);
      if (!claimed) {
        state.ciExplanationSubmitted = true;
        return;
      }

      try {
        await publishExplanation(channel, explanation);
        state.ciExplanationSubmitted = true;
        await clearWebhookCheckRunId(bindingInput);
      } catch {
        await releaseCiPublication(claimInput);
        await releaseCheckRunHandled(handledClaim);
        await clearWebhookCheckRunId(bindingInput);
        state.ciExplanationSubmitted = false;
      }
    },
    async "message.completed"() {
      // Publish only through explain_ci_failure — never a free-form reply, and
      // never a pull request review payload.
    },
  },
});

function isFailedGitHubActionsCheck(checkRun: GitHubCheckRunEvent): boolean {
  if (checkRun.action !== "completed") {
    return false;
  }
  if (checkRun.conclusion !== "failure") {
    return false;
  }
  return checkRun.app.slug === GITHUB_ACTIONS_SLUG;
}

async function publishExplanation(
  channel: GitHubEventContext,
  explanation: ExplainCiFailureOutput,
) {
  // Structured fields only — never post the optional free-form model comment.
  const body = buildPublishedExplanation({
    excerpt: explanation.excerpt,
    file: explanation.file,
    line: explanation.line,
    whatFailed: explanation.whatFailed,
  });

  await postCommentChunks(channel.thread, body);
}

async function postCommitComment(
  ctx: GitHubInboundContext,
  headSha: string,
  details: FailedCheckDetails,
) {
  const whatFailed =
    details.outputTitle?.trim() ||
    details.location?.message?.trim() ||
    `${details.checkName} failed`;

  const body = formatCiFailureComment({
    checkName: details.checkName,
    excerpt: details.logExcerpt,
    file: details.location?.file,
    htmlUrl: details.htmlUrl,
    line: details.location?.line,
    whatFailed,
  });

  await ctx.github.request({
    method: "POST",
    path: `/repos/${encodeURIComponent(ctx.repository.owner)}/${encodeURIComponent(ctx.repository.name)}/commits/${encodeURIComponent(headSha)}/comments`,
    body: { body },
  });
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
    chunks.push(
      message.slice(startIndex, startIndex + GITHUB_COMMENT_CHUNK_SIZE),
    );
  }

  return chunks;
}
