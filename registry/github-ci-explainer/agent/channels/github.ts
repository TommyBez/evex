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
  claimCheckRunHandled,
  claimCiPublication,
  checkCiExplainerRateLimit,
  releaseCheckRunHandled,
  releaseCiPublication,
} from "../lib/ci-rate-limit";
import {
  formatCiFailureComment,
  hardenMarkdownCodeFences,
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
      const claimInput = {
        headSha: state.headSha,
        installationId: channel.github.installationId,
        pullRequestNumber: state.pullRequestNumber,
        repositoryId: channel.repository.id,
        toolCallId: match.callId,
      };
      const handledClaim: CheckRunHandledClaimInput = {
        checkRunId: explanation.checkRunId,
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
      } catch {
        await releaseCiPublication(claimInput);
        await releaseCheckRunHandled(handledClaim);
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

function buildFailureContext(
  details: FailedCheckDetails,
  pullRequestNumber: number,
  repositoryFullName: string,
): string {
  const annotationLines =
    details.annotations.length === 0
      ? ["(none)"]
      : details.annotations.slice(0, 10).map((annotation) => {
          const path = annotation.path ?? "(unknown)";
          const line = annotation.startLine ?? "?";
          const level = annotation.annotationLevel ?? "notice";
          const message = annotation.message ?? "";
          return `- [${level}] ${path}:${line} ${message}`.trim();
        });

  const suggestedLocation = details.location
    ? `${details.location.file}:${details.location.line}`
    : "(none found yet)";

  return [
    "<github_ci_failure_context>",
    `repository: ${repositoryFullName}`,
    `check_run_id: ${details.checkRunId}`,
    `check_name: ${details.checkName}`,
    `conclusion: ${details.conclusion ?? "failure"}`,
    `head_sha: ${details.headSha ?? "(unknown)"}`,
    `pull_request_number: ${pullRequestNumber}`,
    `html_url: ${details.htmlUrl ?? "(none)"}`,
    `suggested_location: ${suggestedLocation}`,
    `output_title: ${details.outputTitle ?? "(none)"}`,
    "annotations:",
    ...annotationLines,
    "log_excerpt:",
    details.logExcerpt,
    "</github_ci_failure_context>",
    "",
    "Explain this failed GitHub Actions check. Call explain_ci_failure exactly once with checkRunId, whatFailed, file/line when known, a short excerpt, and the full comment body. Do not publish a pull request review. Do not push a fix.",
  ].join("\n");
}

async function publishExplanation(
  channel: GitHubEventContext,
  explanation: ExplainCiFailureOutput,
) {
  // Prefer the model comment when present, but harden fences so log backticks
  // cannot break out of a ```text block. Fall back to the structured formatter.
  const body = explanation.comment.trim()
    ? hardenMarkdownCodeFences(explanation.comment.trim())
    : formatCiFailureComment({
        checkName: "GitHub Actions",
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
