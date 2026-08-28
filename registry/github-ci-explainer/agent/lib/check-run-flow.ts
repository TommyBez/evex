import type { GitHubCheckRunEvent, GitHubInboundContext } from "eve/channels/github";
import { defaultGitHubAuth } from "eve/channels/github";

import {
  type CheckRunHandledClaimInput,
  releaseCheckRunHandled,
} from "./ci-rate-limit";
import {
  fetchFailedCheckDetails,
  type FailedCheckDetails,
} from "./fetch-check-failure";

export type PostCommitComment = (
  ctx: GitHubInboundContext,
  headSha: string,
  details: FailedCheckDetails,
) => Promise<void>;

export type BuildFailureContext = (
  details: FailedCheckDetails,
  pullRequestNumber: number,
  repositoryFullName: string,
) => string;

/**
 * Downstream work after a successful handled claim. Releases the claim and
 * rethrows when fetch or commit-comment publication fails so webhook
 * redeliveries can retry. Does not release after a successful commit comment
 * or when returning a PR dispatch result.
 */
export async function handleClaimedCheckRun(input: {
  readonly buildFailureContext: BuildFailureContext;
  readonly checkRun: GitHubCheckRunEvent;
  readonly ctx: GitHubInboundContext;
  readonly handledClaim: CheckRunHandledClaimInput;
  readonly fetchDetails?: typeof fetchFailedCheckDetails;
  readonly postCommit: PostCommitComment;
  readonly releaseHandled?: typeof releaseCheckRunHandled;
}): Promise<{
  readonly auth: ReturnType<typeof defaultGitHubAuth>;
  readonly context: readonly string[];
} | null> {
  const fetchDetails = input.fetchDetails ?? fetchFailedCheckDetails;
  const releaseHandled = input.releaseHandled ?? releaseCheckRunHandled;

  let details: FailedCheckDetails;
  try {
    details = await fetchDetails({
      checkRunId: input.checkRun.checkRunId,
      github: input.ctx.github,
      headSha: input.checkRun.headSha,
      owner: input.ctx.repository.owner,
      raw: input.checkRun.raw,
      repo: input.ctx.repository.name,
    });
  } catch (error) {
    await releaseHandled(input.handledClaim);
    throw error;
  }

  const pullRequestNumber = input.checkRun.pullRequests[0] ?? null;

  // Eve can only dispatch a model turn when a PR thread exists. For
  // commit-only failures, post a commit comment from the channel and exit.
  if (pullRequestNumber === null) {
    if (input.checkRun.headSha) {
      try {
        await input.postCommit(input.ctx, input.checkRun.headSha, details);
      } catch (error) {
        await releaseHandled(input.handledClaim);
        throw error;
      }
    }
    return null;
  }

  return {
    auth: defaultGitHubAuth(input.ctx),
    context: [
      input.buildFailureContext(
        details,
        pullRequestNumber,
        input.ctx.repository.fullName,
      ),
    ],
  };
}
