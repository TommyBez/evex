import type { RegistryCatalog, RegistryItem } from '../types'

export const generatedRegistry = {
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "evex",
  "homepage": "https://evex.sh",
  "items": [
    {
      "name": "code-reviewer",
      "type": "registry:item",
      "title": "Code Reviewer",
      "description": "A GitHub pull request reviewer for Eve. Mention it on a PR to get a native GitHub review with inline comments, small suggestion blocks, and Upstash-backed rate limiting for public repositories.",
      "author": "TommyBez",
      "categories": [
        "coding"
      ],
      "dependencies": [
        "@upstash/ratelimit@^2.0.8",
        "@upstash/redis@^1.38.0",
        "eve@^0.11.10",
        "zod@4.3.6"
      ],
      "meta": {
        "slug": "code-reviewer",
        "category": "coding",
        "createdAt": "2026-06-20T00:00:00.000Z",
        "updatedAt": "2026-06-22T00:00:00.000Z"
      },
      "files": [
        {
          "path": "agent/agent.ts",
          "type": "registry:file",
          "target": "~/agent/agent.ts"
        },
        {
          "path": "agent/channels/github.ts",
          "type": "registry:file",
          "target": "~/agent/channels/github.ts"
        },
        {
          "path": "agent/instructions.md",
          "type": "registry:file",
          "target": "~/agent/instructions.md"
        },
        {
          "path": "agent/lib/review-rate-limit.ts",
          "type": "registry:file",
          "target": "~/agent/lib/review-rate-limit.ts"
        },
        {
          "path": "agent/skills/review-calibration/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/review-calibration/SKILL.md"
        },
        {
          "path": "agent/skills/review-calibration/references/review-checklist.md",
          "type": "registry:file",
          "target": "~/agent/skills/review-calibration/references/review-checklist.md"
        },
        {
          "path": "agent/skills/review-calibration/references/severity-scale.md",
          "type": "registry:file",
          "target": "~/agent/skills/review-calibration/references/severity-scale.md"
        },
        {
          "path": "agent/tools/submit_pr_review.ts",
          "type": "registry:file",
          "target": "~/agent/tools/submit_pr_review.ts"
        },
        {
          "path": "evals/evals.config.ts",
          "type": "registry:file",
          "target": "~/evals/evals.config.ts"
        },
        {
          "path": "evals/pr-review-no-findings.eval.ts",
          "type": "registry:file",
          "target": "~/evals/pr-review-no-findings.eval.ts"
        },
        {
          "path": "evals/pr-review-with-inline-finding.eval.ts",
          "type": "registry:file",
          "target": "~/evals/pr-review-with-inline-finding.eval.ts"
        },
        {
          "path": "README.md",
          "type": "registry:file",
          "target": "~/agent/README.md"
        },
        {
          "path": ".env.example",
          "type": "registry:file",
          "target": "~/.env.example"
        }
      ]
    },
    {
      "name": "github-release-scout",
      "type": "registry:item",
      "title": "GitHub Release Scout",
      "description": "Connects to GitHub, gathers recently merged pull requests, and prepares release notes that preserve traceability to PR numbers, labels, and rollout risk.",
      "author": "TommyBez",
      "categories": [
        "devops"
      ],
      "dependencies": [
        "eve@^0.11.4",
        "@octokit/rest@^22.0.1",
        "zod@4.3.6"
      ],
      "meta": {
        "slug": "github-release-scout",
        "category": "devops",
        "createdAt": "2026-06-20T00:00:00.000Z",
        "updatedAt": "2026-06-20T00:00:00.000Z"
      },
      "files": [
        {
          "path": "agent/agent.ts",
          "type": "registry:file",
          "target": "~/agent/agent.ts"
        },
        {
          "path": "agent/instructions.md",
          "type": "registry:file",
          "target": "~/agent/instructions.md"
        },
        {
          "path": "agent/tools/collect_merged_prs.ts",
          "type": "registry:file",
          "target": "~/agent/tools/collect_merged_prs.ts"
        },
        {
          "path": "README.md",
          "type": "registry:file",
          "target": "~/agent/README.md"
        },
        {
          "path": ".env.example",
          "type": "registry:file",
          "target": "~/.env.example"
        }
      ]
    },
    {
      "name": "incident-commander",
      "type": "registry:item",
      "title": "Incident Commander",
      "description": "Designed for the first thirty minutes of an outage. It builds a factual timeline, tracks action items, and drafts stakeholder updates without blurring facts and assumptions.",
      "author": "TommyBez",
      "categories": [
        "devops"
      ],
      "dependencies": [
        "eve@^0.11.4",
        "date-fns@^4.4.0",
        "zod@4.3.6"
      ],
      "meta": {
        "slug": "incident-commander",
        "category": "devops",
        "createdAt": "2026-06-20T00:00:00.000Z",
        "updatedAt": "2026-06-20T00:00:00.000Z"
      },
      "files": [
        {
          "path": "agent/agent.ts",
          "type": "registry:file",
          "target": "~/agent/agent.ts"
        },
        {
          "path": "agent/instructions.md",
          "type": "registry:file",
          "target": "~/agent/instructions.md"
        },
        {
          "path": "agent/skills/incident-comms/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/incident-comms/SKILL.md"
        },
        {
          "path": "agent/skills/incident-comms/references/severity-matrix.md",
          "type": "registry:file",
          "target": "~/agent/skills/incident-comms/references/severity-matrix.md"
        },
        {
          "path": "agent/skills/incident-comms/references/update-style.md",
          "type": "registry:file",
          "target": "~/agent/skills/incident-comms/references/update-style.md"
        },
        {
          "path": "agent/subagents/mitigation_coordinator/agent.ts",
          "type": "registry:file",
          "target": "~/agent/subagents/mitigation_coordinator/agent.ts"
        },
        {
          "path": "agent/subagents/mitigation_coordinator/instructions.md",
          "type": "registry:file",
          "target": "~/agent/subagents/mitigation_coordinator/instructions.md"
        },
        {
          "path": "agent/subagents/mitigation_coordinator/tools/triage_actions.ts",
          "type": "registry:file",
          "target": "~/agent/subagents/mitigation_coordinator/tools/triage_actions.ts"
        },
        {
          "path": "agent/subagents/status_writer/agent.ts",
          "type": "registry:file",
          "target": "~/agent/subagents/status_writer/agent.ts"
        },
        {
          "path": "agent/subagents/status_writer/instructions.md",
          "type": "registry:file",
          "target": "~/agent/subagents/status_writer/instructions.md"
        },
        {
          "path": "agent/subagents/status_writer/tools/format_update.ts",
          "type": "registry:file",
          "target": "~/agent/subagents/status_writer/tools/format_update.ts"
        },
        {
          "path": "agent/subagents/timeline_builder/agent.ts",
          "type": "registry:file",
          "target": "~/agent/subagents/timeline_builder/agent.ts"
        },
        {
          "path": "agent/subagents/timeline_builder/instructions.md",
          "type": "registry:file",
          "target": "~/agent/subagents/timeline_builder/instructions.md"
        },
        {
          "path": "agent/subagents/timeline_builder/tools/find_gaps.ts",
          "type": "registry:file",
          "target": "~/agent/subagents/timeline_builder/tools/find_gaps.ts"
        },
        {
          "path": "agent/tools/build_timeline.ts",
          "type": "registry:file",
          "target": "~/agent/tools/build_timeline.ts"
        },
        {
          "path": "agent/tools/track_actions.ts",
          "type": "registry:file",
          "target": "~/agent/tools/track_actions.ts"
        },
        {
          "path": "README.md",
          "type": "registry:file",
          "target": "~/agent/README.md"
        }
      ]
    },
    {
      "name": "linear-operations-agent",
      "type": "registry:item",
      "title": "Linear Operations Agent",
      "description": "A multi-channel Eve agent for Linear operations: issue triage, Slack intake, cycle health, backlog hygiene, project reporting, and weekly initiative updates.",
      "author": "TommyBez",
      "categories": [
        "productivity"
      ],
      "dependencies": [
        "@vercel/connect@^0.2.6",
        "eve@^0.11.10"
      ],
      "meta": {
        "slug": "linear-operations-agent",
        "category": "productivity",
        "createdAt": "2026-06-20T00:00:00.000Z",
        "updatedAt": "2026-06-23T00:00:00.000Z"
      },
      "files": [
        {
          "path": "agent/agent.ts",
          "type": "registry:file",
          "target": "~/agent/agent.ts"
        },
        {
          "path": "agent/channels/linear.ts",
          "type": "registry:file",
          "target": "~/agent/channels/linear.ts"
        },
        {
          "path": "agent/channels/slack.ts",
          "type": "registry:file",
          "target": "~/agent/channels/slack.ts"
        },
        {
          "path": "agent/lib/linear-operations-config.ts",
          "type": "registry:file",
          "target": "~/agent/lib/linear-operations-config.ts"
        },
        {
          "path": "agent/connections/linear.ts",
          "type": "registry:file",
          "target": "~/agent/connections/linear.ts"
        },
        {
          "path": "agent/instructions.md",
          "type": "registry:file",
          "target": "~/agent/instructions.md"
        },
        {
          "path": "agent/schedules/cycle-health.ts",
          "type": "registry:file",
          "target": "~/agent/schedules/cycle-health.ts"
        },
        {
          "path": "agent/schedules/daily-triage-digest.ts",
          "type": "registry:file",
          "target": "~/agent/schedules/daily-triage-digest.ts"
        },
        {
          "path": "agent/schedules/p1-monitoring.ts",
          "type": "registry:file",
          "target": "~/agent/schedules/p1-monitoring.ts"
        },
        {
          "path": "agent/schedules/weekly-backlog-hygiene.ts",
          "type": "registry:file",
          "target": "~/agent/schedules/weekly-backlog-hygiene.ts"
        },
        {
          "path": "agent/schedules/weekly-initiative-updates.ts",
          "type": "registry:file",
          "target": "~/agent/schedules/weekly-initiative-updates.ts"
        },
        {
          "path": "agent/schedules/weekly-project-summary.ts",
          "type": "registry:file",
          "target": "~/agent/schedules/weekly-project-summary.ts"
        },
        {
          "path": "agent/skills/backlog-hygiene/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/backlog-hygiene/SKILL.md"
        },
        {
          "path": "agent/skills/clarification/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/clarification/SKILL.md"
        },
        {
          "path": "agent/skills/cycle-health/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/cycle-health/SKILL.md"
        },
        {
          "path": "agent/skills/decomposition/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/decomposition/SKILL.md"
        },
        {
          "path": "agent/skills/duplicate-detection/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/duplicate-detection/SKILL.md"
        },
        {
          "path": "agent/skills/incident-support/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/incident-support/SKILL.md"
        },
        {
          "path": "agent/skills/initiative-reporting/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/initiative-reporting/SKILL.md"
        },
        {
          "path": "agent/skills/project-reporting/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/project-reporting/SKILL.md"
        },
        {
          "path": "agent/skills/slack-intake/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/slack-intake/SKILL.md"
        },
        {
          "path": "agent/skills/triage/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/triage/SKILL.md"
        },
        {
          "path": "README.md",
          "type": "registry:file",
          "target": "~/agent/README.md"
        },
        {
          "path": ".env.example",
          "type": "registry:file",
          "target": "~/.env.example"
        }
      ]
    },
    {
      "name": "resend-lifecycle-mailer",
      "type": "registry:item",
      "title": "Resend Lifecycle Mailer",
      "description": "Builds event-driven lifecycle emails, previews exact recipients and HTML, and only sends through Resend when dry-run mode is disabled.",
      "author": "TommyBez",
      "categories": [
        "support"
      ],
      "dependencies": [
        "eve@^0.11.4",
        "resend@^6.14.0",
        "zod@4.3.6"
      ],
      "meta": {
        "slug": "resend-lifecycle-mailer",
        "category": "support",
        "createdAt": "2026-06-20T00:00:00.000Z",
        "updatedAt": "2026-06-20T00:00:00.000Z"
      },
      "files": [
        {
          "path": "agent/agent.ts",
          "type": "registry:file",
          "target": "~/agent/agent.ts"
        },
        {
          "path": "agent/instructions.md",
          "type": "registry:file",
          "target": "~/agent/instructions.md"
        },
        {
          "path": "agent/tools/send_lifecycle_email.ts",
          "type": "registry:file",
          "target": "~/agent/tools/send_lifecycle_email.ts"
        },
        {
          "path": "README.md",
          "type": "registry:file",
          "target": "~/agent/README.md"
        },
        {
          "path": ".env.example",
          "type": "registry:file",
          "target": "~/.env.example"
        }
      ]
    }
  ]
} as const satisfies RegistryCatalog

export const generatedRegistryItems = {
  "code-reviewer": {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "code-reviewer",
    "type": "registry:item",
    "title": "Code Reviewer",
    "description": "A GitHub pull request reviewer for Eve. Mention it on a PR to get a native GitHub review with inline comments, small suggestion blocks, and Upstash-backed rate limiting for public repositories.",
    "author": "TommyBez",
    "categories": [
      "coding"
    ],
    "dependencies": [
      "@upstash/ratelimit@^2.0.8",
      "@upstash/redis@^1.38.0",
      "eve@^0.11.10",
      "zod@4.3.6"
    ],
    "meta": {
      "slug": "code-reviewer",
      "category": "coding",
      "createdAt": "2026-06-20T00:00:00.000Z",
      "updatedAt": "2026-06-22T00:00:00.000Z"
    },
    "files": [
      {
        "path": "agent/agent.ts",
        "type": "registry:file",
        "target": "~/agent/agent.ts",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  model: \"zai/glm-5.2\",\n});\n"
      },
      {
        "path": "agent/channels/github.ts",
        "type": "registry:file",
        "target": "~/agent/channels/github.ts",
        "content": "import {\n  defaultGitHubAuth,\n  type GitHubJsonObject,\n  githubChannel,\n  type GitHubChannelState,\n  type GitHubEventContext,\n  type GitHubInboundContext,\n  type GitHubThread,\n} from \"eve/channels/github\";\nimport { toolResultFrom } from \"eve/tools\";\nimport {\n  checkCodeReviewRateLimit,\n  claimReviewPublication,\n  type RateLimitDecision,\n  shouldPostCooldownReply,\n} from \"../lib/review-rate-limit\";\nimport submitPrReviewTool, {\n  type SubmitPrReviewComment,\n  type SubmitPrReviewOutput,\n} from \"../tools/submit_pr_review\";\n\nconst BOT_NAME = process.env.GITHUB_APP_SLUG || \"code-reviewer\";\nconst BOT_MENTION_PATTERN = new RegExp(\n  `@${escapeRegExp(BOT_NAME)}(?=$|[^A-Za-z0-9_-])`,\n  \"i\",\n);\nconst GITHUB_COMMENT_CHUNK_SIZE = 60_000;\n\ntype CodeReviewerGitHubState = GitHubChannelState & {\n  codeReviewerReviewSubmitted?: boolean;\n};\n\nexport default githubChannel({\n  botName: BOT_NAME,\n  pullRequestContext: {\n    excludedFiles: [\n      \"**/pnpm-lock.yaml\",\n      \"**/package-lock.json\",\n      \"**/yarn.lock\",\n      \"**/bun.lockb\",\n      \"**/dist/**\",\n      \"**/build/**\",\n      \"**/.next/**\",\n      \"**/coverage/**\",\n    ],\n  },\n  async onComment(ctx, comment) {\n    if (!BOT_MENTION_PATTERN.test(comment.body)) {\n      return null;\n    }\n\n    if (!isPullRequestConversation(ctx)) {\n      return null;\n    }\n\n    const pullRequestNumber = ctx.conversation.pullRequestNumber;\n    if (pullRequestNumber === null) {\n      return null;\n    }\n\n    const decision = await checkCodeReviewRateLimit({\n      installationId: ctx.github.installationId,\n      isPrivateRepository: ctx.repository.private,\n      pullRequestNumber,\n      repositoryId: ctx.repository.id,\n      senderId: ctx.sender.id,\n      senderLogin: ctx.sender.login,\n    });\n\n    if (decision.allowed) {\n      return { auth: defaultGitHubAuth(ctx) };\n    }\n\n    await maybePostCooldownReply(ctx, decision);\n    return null;\n  },\n  events: {\n    async \"action.result\"(data, channel) {\n      const match = toolResultFrom(data.result, submitPrReviewTool);\n      if (!match) {\n        return;\n      }\n\n      const state = channel.state as CodeReviewerGitHubState;\n      if (state.codeReviewerReviewSubmitted) {\n        return;\n      }\n\n      const claimed = await claimReviewPublication({\n        headSha: state.headSha,\n        installationId: channel.github.installationId,\n        pullRequestNumber: state.pullRequestNumber ?? 0,\n        repositoryId: channel.repository.id,\n        toolCallId: match.callId,\n      });\n\n      if (!claimed) {\n        state.codeReviewerReviewSubmitted = true;\n        return;\n      }\n\n      try {\n        await publishReview(channel, match.output);\n        state.codeReviewerReviewSubmitted = true;\n      } catch {\n        state.codeReviewerReviewSubmitted = false;\n      }\n    },\n    async \"message.completed\"(data, channel) {\n      if (data.finishReason === \"tool-calls\" || !data.message) {\n        return;\n      }\n\n      const state = channel.state as CodeReviewerGitHubState;\n      if (state.codeReviewerReviewSubmitted) {\n        return;\n      }\n\n      await postCommentChunks(channel.thread, data.message);\n    },\n  },\n});\n\nfunction isPullRequestConversation(ctx: GitHubInboundContext) {\n  return (\n    ctx.conversation.kind === \"pull_request\" ||\n    ctx.conversation.kind === \"review_thread\"\n  );\n}\n\nasync function maybePostCooldownReply(\n  ctx: GitHubInboundContext,\n  decision: Extract<RateLimitDecision, { allowed: false }>,\n) {\n  const pullRequestNumber = ctx.conversation.pullRequestNumber;\n  if (pullRequestNumber === null) {\n    return;\n  }\n\n  const canReply = await shouldPostCooldownReply({\n    installationId: ctx.github.installationId,\n    pullRequestNumber,\n    repositoryId: ctx.repository.id,\n  });\n\n  if (!canReply) {\n    return;\n  }\n\n  try {\n    await ctx.thread.post(formatCooldownReply(decision));\n  } catch {\n    // If the cooldown notice cannot be posted, still suppress the model run.\n  }\n}\n\nfunction formatCooldownReply(decision: Extract<RateLimitDecision, { allowed: false }>) {\n  if (decision.reason === \"rate_limit_unavailable\") {\n    return `\\`${BOT_NAME}\\` cannot run because rate limiting is unavailable for this repository.`;\n  }\n\n  const retryAfter = formatRetryAfter(decision.retryAfterSeconds);\n  return `\\`${BOT_NAME}\\` is cooling down for this pull request. Try again ${retryAfter}.`;\n}\n\nfunction formatRetryAfter(retryAfterSeconds: number | undefined) {\n  if (!retryAfterSeconds) {\n    return \"later\";\n  }\n\n  if (retryAfterSeconds <= 90) {\n    return \"in about 1 minute\";\n  }\n\n  return `in about ${Math.ceil(retryAfterSeconds / 60)} minutes`;\n}\n\nasync function publishReview(\n  channel: GitHubEventContext,\n  review: SubmitPrReviewOutput,\n) {\n  const pullRequestNumber = channel.state.pullRequestNumber;\n  if (pullRequestNumber === null || review.comments.length === 0) {\n    await postCommentChunks(channel.thread, review.summary);\n    return;\n  }\n\n  try {\n    await createBatchReview(channel, review, pullRequestNumber);\n    return;\n  } catch {\n    await publishFallbackReview(channel, review, pullRequestNumber);\n  }\n}\n\nasync function createBatchReview(\n  channel: GitHubEventContext,\n  review: SubmitPrReviewOutput,\n  pullRequestNumber: number,\n) {\n  const body: GitHubJsonObject = {\n    body: review.summary,\n    comments: review.comments.map(toGitHubReviewComment),\n    event: \"COMMENT\",\n    ...(channel.state.headSha ? { commit_id: channel.state.headSha } : {}),\n  };\n\n  await channel.github.request({\n    body,\n    method: \"POST\",\n    path: githubPullRequestReviewPath(channel.state, pullRequestNumber),\n  });\n}\n\nasync function publishFallbackReview(\n  channel: GitHubEventContext,\n  review: SubmitPrReviewOutput,\n  pullRequestNumber: number,\n) {\n  const failedComments: SubmitPrReviewComment[] = [];\n  let publishedCount = 0;\n\n  if (channel.state.headSha) {\n    for (const comment of review.comments) {\n      try {\n        await channel.github.request({\n          body: {\n            ...toGitHubReviewComment(comment),\n            commit_id: channel.state.headSha,\n          },\n          method: \"POST\",\n          path: githubPullRequestCommentPath(channel.state, pullRequestNumber),\n        });\n        publishedCount += 1;\n      } catch {\n        failedComments.push(comment);\n      }\n    }\n  } else {\n    failedComments.push(...review.comments);\n  }\n\n  await postCommentChunks(\n    channel.thread,\n    formatFallbackSummary(review.summary, failedComments, publishedCount),\n  );\n}\n\nfunction toGitHubReviewComment(comment: SubmitPrReviewComment): GitHubJsonObject {\n  return {\n    body: formatInlineCommentBody(comment),\n    line: comment.line,\n    path: comment.path,\n    side: comment.side,\n    ...(comment.startLine\n      ? {\n          start_line: comment.startLine,\n          start_side: comment.startSide ?? comment.side,\n        }\n      : {}),\n  };\n}\n\nfunction formatInlineCommentBody(comment: SubmitPrReviewComment) {\n  const parts = [`**${comment.severity}:** ${comment.body}`];\n\n  if (comment.suggestion) {\n    parts.push(\"\", \"```suggestion\", comment.suggestion, \"```\");\n  }\n\n  return parts.join(\"\\n\");\n}\n\nfunction formatFallbackSummary(\n  summary: string,\n  failedComments: readonly SubmitPrReviewComment[],\n  publishedCount: number,\n) {\n  if (failedComments.length === 0) {\n    return publishedCount > 0\n      ? `${summary}\\n\\nPosted ${publishedCount} inline comments.`\n      : summary;\n  }\n\n  const failedList = failedComments.map(\n    (comment) =>\n      `- ${comment.path}:${comment.line} **${comment.severity}:** ${comment.body}`,\n  );\n\n  const prefix =\n    publishedCount > 0\n      ? `Posted ${publishedCount} inline comments. These findings could not be anchored inline:`\n      : \"These findings could not be anchored inline:\";\n\n  return [summary, \"\", prefix, ...failedList].join(\"\\n\");\n}\n\nasync function postCommentChunks(thread: GitHubThread, message: string) {\n  for (const chunk of splitCommentBody(message)) {\n    await thread.post(chunk);\n  }\n}\n\nfunction splitCommentBody(message: string) {\n  if (message.length <= GITHUB_COMMENT_CHUNK_SIZE) {\n    return [message];\n  }\n\n  const chunks: string[] = [];\n  for (\n    let startIndex = 0;\n    startIndex < message.length;\n    startIndex += GITHUB_COMMENT_CHUNK_SIZE\n  ) {\n    chunks.push(message.slice(startIndex, startIndex + GITHUB_COMMENT_CHUNK_SIZE));\n  }\n\n  return chunks;\n}\n\nfunction escapeRegExp(value: string) {\n  return value.replace(/[.*+?^${}()|[\\]\\\\]/g, \"\\\\$&\");\n}\n\nfunction githubPullRequestReviewPath(\n  state: GitHubChannelState,\n  pullRequestNumber: number,\n) {\n  return `/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(\n    state.repo,\n  )}/pulls/${pullRequestNumber}/reviews`;\n}\n\nfunction githubPullRequestCommentPath(\n  state: GitHubChannelState,\n  pullRequestNumber: number,\n) {\n  return `/repos/${encodeURIComponent(state.owner)}/${encodeURIComponent(\n    state.repo,\n  )}/pulls/${pullRequestNumber}/comments`;\n}\n"
      },
      {
        "path": "agent/instructions.md",
        "type": "registry:file",
        "target": "~/agent/instructions.md",
        "content": "# Mission\nYou review GitHub pull request diffs to find concrete bugs, regressions,\nsecurity risks, rollout risk, and materially missing tests.\n\n# Default stance\nPrefer changed behavior over style commentary. Do not spend time on naming nits,\nformatting, or speculative rewrites unless they hide a concrete failure mode.\nYou are a reviewer, not a patch author: you may suggest fixes, but you do not\nclaim to have changed the pull request.\n\n# Workflow\n1. Start from the GitHub pull request context injected by the channel.\n2. Identify risky surfaces in the diff: auth, permissions, user data, external\n   side effects, schemas, cache invalidation, concurrency, billing, and runtime\n   behavior.\n3. Use read_file, grep, and glob to inspect only the context needed to validate\n   or reject a finding.\n4. Use bash for targeted tests or read-only verification when it materially\n   increases confidence.\n5. Use write_file only inside the sandbox when trying a small local patch helps\n   validate a suggestion. Never state that the pull request itself was changed.\n6. Load the review-calibration skill when severity is ambiguous or multiple\n   issues compete.\n7. Put only concrete, actionable, diff-anchored findings in inline comments.\n8. Put non-anchorable concerns, residual risk, and no-finding summaries in the\n   review summary.\n9. Call submit_pr_review exactly once when the review is ready.\n10. After submit_pr_review, do not produce a second substantive final answer.\n\n# Inline comment rules\nEach inline comment must include:\n- user or system impact\n- what triggers the issue\n- the smallest evidence needed to justify it\n\nUse at most 10 inline comments. Prefer fewer, higher-confidence comments over a\nlong review.\n\n# Severity\n- blocking: probable bug, security issue, data loss, broken runtime behavior, or\n  user-visible regression.\n- warning: real risk that depends on runtime context, rollout conditions, or a\n  materially missing test.\n- nit: small correctness improvement. Do not use this for style.\n\n# Suggestions\nUse a suggestion only when the fix is short, local, and almost certainly\ncorrect. Do not suggest broad refactors, migrations, API redesigns, or large\ntest-suite changes. A suggestion must contain only the replacement code for the\nGitHub line or range.\n\n# No findings\nIf you find no actionable issues, still call submit_pr_review with comments: []\nand a summary that says no actionable findings were found, plus any residual\nrisk that deserves manual verification before merge.\n"
      },
      {
        "path": "agent/lib/review-rate-limit.ts",
        "type": "registry:file",
        "target": "~/agent/lib/review-rate-limit.ts",
        "content": "import { createHash } from \"node:crypto\";\nimport { Ratelimit } from \"@upstash/ratelimit\";\nimport { Redis } from \"@upstash/redis\";\n\nconst DEFAULT_RATE_LIMIT_PREFIX = \"evex:code-reviewer\";\nconst DEFAULT_PR_COOLDOWN_SECONDS = 900;\nconst DEFAULT_USER_PR_COOLDOWN_SECONDS = 1800;\nconst DEFAULT_PRIVATE_REPO_DAILY_LIMIT = 25;\nconst DEFAULT_PUBLIC_REPO_DAILY_LIMIT = 10;\nconst DEFAULT_COOLDOWN_REPLY_SECONDS = 900;\nconst REVIEW_PUBLICATION_TTL_SECONDS = 86_400;\nconst TRUE_VALUES = new Set([\"1\", \"true\", \"yes\", \"on\"]);\nconst FALSE_VALUES = new Set([\"0\", \"false\", \"no\", \"off\"]);\n\ntype FailureMode = \"public_closed\" | \"closed\" | \"open\";\ntype RateLimitReason =\n  | \"user_pr_cooldown\"\n  | \"pr_cooldown\"\n  | \"repo_daily_limit\"\n  | \"rate_limit_unavailable\";\n\ntype RateLimitConfig = {\n  cooldownReply: boolean;\n  cooldownReplySeconds: number;\n  enabled: boolean;\n  failureMode: FailureMode;\n  prefix: string;\n  privateRepoDailyLimit: number;\n  prCooldownSeconds: number;\n  publicRepoDailyLimit: number;\n  userPrCooldownSeconds: number;\n};\n\ntype RateLimiter = ReturnType<typeof createRateLimiter>;\ntype RateLimiterBundle = ReturnType<typeof createRateLimiterBundle>;\n\nexport type CodeReviewRateLimitInput = {\n  installationId: number | null | undefined;\n  isPrivateRepository: boolean;\n  pullRequestNumber: number;\n  repositoryId: number;\n  senderId: number | null | undefined;\n  senderLogin: string | null | undefined;\n};\n\nexport type CooldownReplyRateLimitInput = {\n  installationId: number | null | undefined;\n  pullRequestNumber: number;\n  repositoryId: number;\n};\n\nexport type ReviewPublicationClaimInput = {\n  headSha: string | null | undefined;\n  installationId: number | null | undefined;\n  pullRequestNumber: number;\n  repositoryId: number;\n  toolCallId: string;\n};\n\nexport type RateLimitDecision =\n  | { allowed: true }\n  | {\n      allowed: false;\n      reason: RateLimitReason;\n      resetAt?: number;\n      retryAfterSeconds?: number;\n    };\n\nlet cachedRedis: Redis | null = null;\nlet cachedLimiters: RateLimiterBundle | null = null;\n\nexport async function checkCodeReviewRateLimit(\n  input: CodeReviewRateLimitInput,\n): Promise<RateLimitDecision> {\n  const config = readRateLimitConfig();\n\n  if (!config.enabled) {\n    return { allowed: true };\n  }\n\n  if (!hasUpstashEnvironment()) {\n    return unavailableDecision(config, input.isPrivateRepository);\n  }\n\n  try {\n    if (!input.isPrivateRepository && config.publicRepoDailyLimit <= 0) {\n      return { allowed: false, reason: \"repo_daily_limit\" };\n    }\n\n    if (input.isPrivateRepository && config.privateRepoDailyLimit <= 0) {\n      return { allowed: false, reason: \"repo_daily_limit\" };\n    }\n\n    const limiters = getRateLimiters(config);\n    const checks = [\n      await checkLimiter(\n        limiters.userPr,\n        identifierForUserPr(input),\n        \"user_pr_cooldown\",\n      ),\n      await checkLimiter(limiters.pr, identifierForPr(input), \"pr_cooldown\"),\n      await checkLimiter(\n        input.isPrivateRepository ? limiters.privateRepoDaily : limiters.publicRepoDaily,\n        identifierForRepoDaily(input),\n        \"repo_daily_limit\",\n      ),\n    ];\n\n    return checks.find((decision) => !decision.allowed) ?? { allowed: true };\n  } catch {\n    return unavailableDecision(config, input.isPrivateRepository);\n  }\n}\n\nexport async function shouldPostCooldownReply(\n  input: CooldownReplyRateLimitInput,\n): Promise<boolean> {\n  const config = readRateLimitConfig();\n\n  if (!(config.enabled && config.cooldownReply && hasUpstashEnvironment())) {\n    return false;\n  }\n\n  try {\n    const { cooldownReply } = getRateLimiters(config);\n    const decision = await checkLimiter(\n      cooldownReply,\n      identifierForCooldownReply(input),\n      \"pr_cooldown\",\n    );\n\n    return decision.allowed;\n  } catch {\n    return false;\n  }\n}\n\nexport async function claimReviewPublication(\n  input: ReviewPublicationClaimInput,\n): Promise<boolean> {\n  if (!hasUpstashEnvironment()) {\n    return true;\n  }\n\n  try {\n    const config = readRateLimitConfig();\n    const redis = getRedis();\n    const key = `${config.prefix}:review-publish:${hashParts([\n      \"review-publish\",\n      input.installationId ?? \"unknown-installation\",\n      input.repositoryId,\n      input.pullRequestNumber,\n      input.headSha ?? \"unknown-head\",\n      input.toolCallId,\n    ])}`;\n    const result = await redis.set(key, \"1\", {\n      ex: REVIEW_PUBLICATION_TTL_SECONDS,\n      nx: true,\n    });\n\n    return result === \"OK\";\n  } catch {\n    return true;\n  }\n}\n\nfunction checkLimiter(\n  limiter: RateLimiter,\n  identifier: string,\n  reason: RateLimitReason,\n): Promise<RateLimitDecision> {\n  return limiter.limit(identifier).then((result) => {\n    void result.pending.catch(() => undefined);\n\n    if (result.success) {\n      return { allowed: true };\n    }\n\n    return {\n      allowed: false,\n      reason,\n      resetAt: result.reset,\n      retryAfterSeconds: retryAfterSeconds(result.reset),\n    };\n  });\n}\n\nfunction createRateLimiter(redis: Redis, limit: number, windowSeconds: number, prefix: string) {\n  return new Ratelimit({\n    analytics: false,\n    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),\n    prefix,\n    redis,\n  });\n}\n\nfunction createRateLimiterBundle(config: RateLimitConfig) {\n  const redis = getRedis();\n\n  return {\n    configKey: JSON.stringify(config),\n    cooldownReply: createRateLimiter(\n      redis,\n      1,\n      config.cooldownReplySeconds,\n      `${config.prefix}:cooldown-reply`,\n    ),\n    pr: createRateLimiter(redis, 1, config.prCooldownSeconds, `${config.prefix}:pr`),\n    privateRepoDaily: createRateLimiter(\n      redis,\n      Math.max(1, config.privateRepoDailyLimit),\n      86_400,\n      `${config.prefix}:repo-private-day`,\n    ),\n    publicRepoDaily: createRateLimiter(\n      redis,\n      Math.max(1, config.publicRepoDailyLimit),\n      86_400,\n      `${config.prefix}:repo-public-day`,\n    ),\n    userPr: createRateLimiter(\n      redis,\n      1,\n      config.userPrCooldownSeconds,\n      `${config.prefix}:user-pr`,\n    ),\n  };\n}\n\nfunction getRateLimiters(config: RateLimitConfig) {\n  const configKey = JSON.stringify(config);\n  if (cachedLimiters?.configKey === configKey) {\n    return cachedLimiters;\n  }\n\n  cachedLimiters = createRateLimiterBundle(config);\n  return cachedLimiters;\n}\n\nfunction getRedis() {\n  if (cachedRedis) {\n    return cachedRedis;\n  }\n\n  cachedRedis = Redis.fromEnv();\n  return cachedRedis;\n}\n\nfunction hasUpstashEnvironment() {\n  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);\n}\n\nfunction unavailableDecision(\n  config: RateLimitConfig,\n  isPrivateRepository: boolean,\n): RateLimitDecision {\n  if (config.failureMode === \"open\") {\n    return { allowed: true };\n  }\n\n  if (config.failureMode === \"closed\") {\n    return { allowed: false, reason: \"rate_limit_unavailable\" };\n  }\n\n  return isPrivateRepository\n    ? { allowed: true }\n    : { allowed: false, reason: \"rate_limit_unavailable\" };\n}\n\nfunction identifierForUserPr(input: CodeReviewRateLimitInput) {\n  return hashParts([\n    \"user-pr\",\n    input.installationId ?? \"unknown-installation\",\n    input.repositoryId,\n    input.pullRequestNumber,\n    input.senderId ?? input.senderLogin ?? \"unknown-sender\",\n  ]);\n}\n\nfunction identifierForPr(input: CodeReviewRateLimitInput) {\n  return hashParts([\n    \"pr\",\n    input.installationId ?? \"unknown-installation\",\n    input.repositoryId,\n    input.pullRequestNumber,\n  ]);\n}\n\nfunction identifierForRepoDaily(input: CodeReviewRateLimitInput) {\n  return hashParts([\n    \"repo-day\",\n    input.installationId ?? \"unknown-installation\",\n    input.repositoryId,\n    input.isPrivateRepository ? \"private\" : \"public\",\n  ]);\n}\n\nfunction identifierForCooldownReply(input: CooldownReplyRateLimitInput) {\n  return hashParts([\n    \"cooldown-reply\",\n    input.installationId ?? \"unknown-installation\",\n    input.repositoryId,\n    input.pullRequestNumber,\n  ]);\n}\n\nfunction hashParts(parts: readonly (number | string)[]) {\n  return createHash(\"sha256\").update(parts.map(String).join(\":\")).digest(\"hex\");\n}\n\nfunction retryAfterSeconds(resetAt: number) {\n  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));\n}\n\nfunction readRateLimitConfig(): RateLimitConfig {\n  return {\n    cooldownReply: readBoolean(process.env.CODE_REVIEWER_COOLDOWN_REPLY, true),\n    cooldownReplySeconds: readPositiveInteger(\n      process.env.CODE_REVIEWER_COOLDOWN_REPLY_SECONDS,\n      DEFAULT_COOLDOWN_REPLY_SECONDS,\n    ),\n    enabled: readBoolean(process.env.CODE_REVIEWER_RATE_LIMIT_ENABLED, true),\n    failureMode: readFailureMode(\n      process.env.CODE_REVIEWER_RATE_LIMIT_FAILURE_MODE,\n    ),\n    prefix:\n      process.env.CODE_REVIEWER_RATE_LIMIT_PREFIX?.trim() ||\n      DEFAULT_RATE_LIMIT_PREFIX,\n    privateRepoDailyLimit: readNonNegativeInteger(\n      process.env.CODE_REVIEWER_PRIVATE_REPO_DAILY_LIMIT,\n      DEFAULT_PRIVATE_REPO_DAILY_LIMIT,\n    ),\n    prCooldownSeconds: readPositiveInteger(\n      process.env.CODE_REVIEWER_PR_COOLDOWN_SECONDS,\n      DEFAULT_PR_COOLDOWN_SECONDS,\n    ),\n    publicRepoDailyLimit: readNonNegativeInteger(\n      process.env.CODE_REVIEWER_PUBLIC_REPO_DAILY_LIMIT,\n      DEFAULT_PUBLIC_REPO_DAILY_LIMIT,\n    ),\n    userPrCooldownSeconds: readPositiveInteger(\n      process.env.CODE_REVIEWER_USER_PR_COOLDOWN_SECONDS,\n      DEFAULT_USER_PR_COOLDOWN_SECONDS,\n    ),\n  };\n}\n\nfunction readBoolean(value: string | undefined, fallback: boolean) {\n  if (!value) {\n    return fallback;\n  }\n\n  const normalizedValue = value.trim().toLowerCase();\n  if (TRUE_VALUES.has(normalizedValue)) {\n    return true;\n  }\n\n  if (FALSE_VALUES.has(normalizedValue)) {\n    return false;\n  }\n\n  return fallback;\n}\n\nfunction readFailureMode(value: string | undefined): FailureMode {\n  if (value === \"closed\" || value === \"open\" || value === \"public_closed\") {\n    return value;\n  }\n\n  return \"public_closed\";\n}\n\nfunction readPositiveInteger(value: string | undefined, fallback: number) {\n  const parsedValue = Number.parseInt(value ?? \"\", 10);\n  return Number.isInteger(parsedValue) && parsedValue > 0\n    ? parsedValue\n    : fallback;\n}\n\nfunction readNonNegativeInteger(value: string | undefined, fallback: number) {\n  const parsedValue = Number.parseInt(value ?? \"\", 10);\n  return Number.isInteger(parsedValue) && parsedValue >= 0\n    ? parsedValue\n    : fallback;\n}\n"
      },
      {
        "path": "agent/skills/review-calibration/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/review-calibration/SKILL.md",
        "content": "---\ndescription: Use when severity is ambiguous and the review needs a consistent impact bar.\n---\n\nCalibrate findings against user harm, exploitability, reversibility, and detection speed.\nEscalate issues that can corrupt state, leak data, bypass authorization, or silently ship\nbroken behavior. De-escalate issues that are recoverable, obvious, and tightly scoped.\n\nUse the review tool severity labels:\n- blocking for probable bugs, security issues, data loss, broken runtime behavior, or user-visible regressions.\n- warning for real risks that depend on runtime context, rollout conditions, or materially missing tests.\n- nit only for small correctness improvements. Do not use nit for style.\n"
      },
      {
        "path": "agent/skills/review-calibration/references/review-checklist.md",
        "type": "registry:file",
        "target": "~/agent/skills/review-calibration/references/review-checklist.md",
        "content": "# Review lenses\n- Can a valid request now fail because of ordering, retries, or stale cache state?\n- Does any new branch bypass authz, rate limiting, or ownership checks?\n- Can the new code create partial writes or inconsistent state on failure?\n- Does the patch need a migration, rollback, or a feature flag to be safe?\n- What is the smallest test that would catch the highest-risk regression?\n- Does a changed external side effect need idempotency, approval, or throttling?\n- Does any user-controlled input reach file, network, shell, or markup surfaces?\n- Can the finding be anchored to a changed diff line, or should it stay in the summary?\n"
      },
      {
        "path": "agent/skills/review-calibration/references/severity-scale.md",
        "type": "registry:file",
        "target": "~/agent/skills/review-calibration/references/severity-scale.md",
        "content": "# Severity lenses\n- blocking: data loss, privilege bypass, high-probability incident trigger, or user-facing regression without an easy workaround\n- warning: correctness issue with limited blast radius, missing validation, fragile recovery, or materially missing tests\n- nit: small correctness improvement that is safe and local; never style-only\n"
      },
      {
        "path": "agent/tools/submit_pr_review.ts",
        "type": "registry:file",
        "target": "~/agent/tools/submit_pr_review.ts",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nconst reviewSide = z.enum([\"RIGHT\", \"LEFT\"]);\nconst reviewSeverity = z.enum([\"blocking\", \"warning\", \"nit\"]);\n\nconst reviewComment = z.object({\n  body: z.string().min(1).max(4000),\n  line: z.number().int().positive(),\n  path: z.string().min(1),\n  severity: reviewSeverity,\n  side: reviewSide.default(\"RIGHT\"),\n  startLine: z.number().int().positive().optional(),\n  startSide: reviewSide.optional(),\n  suggestion: z.string().min(1).max(8000).optional(),\n});\n\nconst submitPrReviewInput = z.object({\n  comments: z.array(reviewComment).max(10),\n  summary: z.string().min(1).max(4000),\n});\n\nexport type SubmitPrReviewComment = z.infer<typeof reviewComment>;\nexport type SubmitPrReviewOutput = z.infer<typeof submitPrReviewInput>;\n\nexport default defineTool({\n  description:\n    \"Submit the final pull request review as a structured summary plus inline comments. Use this exactly once when the review is ready to publish.\",\n  inputSchema: submitPrReviewInput,\n  execute(input) {\n    return input;\n  },\n  toModelOutput(output) {\n    return {\n      type: \"json\",\n      value: {\n        hasSummary: output.summary.length > 0,\n        inlineCommentCount: output.comments.length,\n        readyToPublish: true,\n      },\n    };\n  },\n});\n"
      },
      {
        "path": "evals/evals.config.ts",
        "type": "registry:file",
        "target": "~/evals/evals.config.ts",
        "content": "import { defineEvalConfig } from \"eve/evals\";\n\nexport default defineEvalConfig({\n  timeoutMs: 120_000,\n});\n"
      },
      {
        "path": "evals/pr-review-no-findings.eval.ts",
        "type": "registry:file",
        "target": "~/evals/pr-review-no-findings.eval.ts",
        "content": "import { defineEval } from \"eve/evals\";\nimport { includes } from \"eve/evals/expect\";\n\nexport default defineEval({\n  description: \"Submits a no-findings review for an innocuous PR diff.\",\n  async test(t) {\n    await t.send(`\n<github_context>\nrepository: example/widget\npull_request_number: 43\nsender: maintainer\nhead_sha: def456\n</github_context>\n\nPull request diff:\n\ndiff --git a/src/copy.ts b/src/copy.ts\n@@\n-export const emptyState = \"No items\";\n+export const emptyState = \"No matching items\";\n\nReview this diff and publish the PR review with submit_pr_review.\n`);\n\n    t.completed();\n    t.calledTool(\"submit_pr_review\");\n    t.check(t.reply, includes(\"No actionable\").soft());\n  },\n});\n"
      },
      {
        "path": "evals/pr-review-with-inline-finding.eval.ts",
        "type": "registry:file",
        "target": "~/evals/pr-review-with-inline-finding.eval.ts",
        "content": "import { defineEval } from \"eve/evals\";\nimport { includes } from \"eve/evals/expect\";\n\nexport default defineEval({\n  description: \"Finds an actionable PR issue and submits an inline review.\",\n  async test(t) {\n    await t.send(`\n<github_context>\nrepository: example/widget\npull_request_number: 42\nsender: maintainer\nhead_sha: abc123\n</github_context>\n\nPull request diff:\n\ndiff --git a/src/auth.ts b/src/auth.ts\n@@\n- if (session.userId !== requestedUserId) {\n-   throw new Error(\"forbidden\");\n- }\n+ if (session.userId) {\n+   return getUser(requestedUserId);\n+ }\n\nReview this diff and publish the PR review with submit_pr_review.\n`);\n\n    t.completed();\n    t.calledTool(\"submit_pr_review\");\n    t.check(t.reply, includes(\"submit_pr_review\").soft());\n  },\n});\n"
      },
      {
        "path": "README.md",
        "type": "registry:file",
        "target": "~/agent/README.md",
        "content": "# Code Reviewer\n\nReview GitHub pull requests from a native GitHub App channel. Mention\n`@code-reviewer` on a pull request and it publishes a GitHub review with inline\ncomments for concrete findings. Small, local fixes may include GitHub suggestion\nblocks that the PR author can apply manually.\n\nThe agent reviews changed behavior rather than style. It looks for bugs,\nregressions, security issues, rollout risk, and materially missing tests.\n\n## How it works\n\n1. Install this agent into an existing Eve app.\n2. Deploy the Eve app so GitHub can reach it over HTTPS.\n3. Create and install a GitHub App for the repositories you want reviewed.\n4. Point the GitHub App webhook to `/eve/v1/github`.\n5. Subscribe the GitHub App to PR comment events.\n6. Comment on a pull request:\n\n```md\n@code-reviewer review this\n```\n\nThe GitHub channel injects PR metadata and diff context, checks out the\nrepository into the Eve sandbox, and lets the agent inspect relevant files. The\nagent does not push commits, open branches, or modify the pull request. It only\npublishes review comments and optional suggestion blocks.\n\n## GitHub App setup\n\nCreate the GitHub App from **GitHub Settings -> Developer settings ->\nGitHub Apps -> New GitHub App**.\n\nUse these settings:\n\n- **GitHub App name**: `code-reviewer`, or another name that matches\n  `GITHUB_APP_SLUG`.\n- **Homepage URL**: your deployed Eve app URL.\n- **Callback URL**: leave blank.\n- **Request user authorization (OAuth) during installation**: disabled.\n- **Webhook**: active.\n- **Webhook URL**: `https://<your-eve-deployment>/eve/v1/github`.\n- **Webhook secret**: a long random value. Save the same value as\n  `GITHUB_WEBHOOK_SECRET`.\n\nThe webhook URL must be publicly reachable by GitHub. Localhost URLs do not work\nunless you expose them through a tunnel.\n\nAfter creating the app:\n\n1. Copy the **App ID** into `GITHUB_APP_ID`.\n2. Generate a private key from the app settings.\n3. Copy the private key PEM into `GITHUB_APP_PRIVATE_KEY`.\n4. Install the app on the target repositories from **Install App**.\n\nWhen storing the private key as a single-line environment variable, replace\nliteral newlines with `\\n`. Eve normalizes that form at runtime.\n\n## GitHub permissions\n\nUse the narrowest permissions that support review comments:\n\n- Metadata: read\n- Contents: read\n- Pull requests: read/write\n- Issues: read/write\n\nThe issues permission is needed for PR timeline comments and fallback replies.\n\n## GitHub events\n\nSubscribe only to the events this agent consumes:\n\n- Issue comments\n- Pull request review comments\n\nThe first event lets users mention `@code-reviewer` from the PR conversation\ntimeline. The second lets users mention it from a code review thread in the\nFiles changed view.\n\nYou do not need the broader Issues or Pull requests events for the default\nmention-driven workflow.\n\n## Environment\n\nThe registry installs a `.env.example` template. Put real secret values in your\ndeployment environment.\n\nSet the GitHub App credentials:\n\n```bash\nGITHUB_APP_ID=\nGITHUB_APP_PRIVATE_KEY=\nGITHUB_WEBHOOK_SECRET=\nGITHUB_APP_SLUG=code-reviewer\n```\n\n`GITHUB_APP_SLUG` must match the mention users type in GitHub. With the default\nvalue above, the trigger is:\n\n```md\n@code-reviewer review this\n```\n\nSet Vercel Redis/Upstash Marketplace REST credentials for rate limiting:\n\n```bash\nKV_REST_API_URL=\nKV_REST_API_TOKEN=\n```\n\nDo not use the read-only token for this agent. Rate limiting writes cooldown and\nreview publication keys. `KV_URL` and `REDIS_URL` are Redis protocol URLs and\nare not used by this REST client.\n\nThe default rate limits are intentionally stricter on public repositories:\n\n- one review every 15 minutes per PR\n- one review every 30 minutes per user per PR\n- 25 reviews per private repository per day\n- 10 reviews per public repository per day\n- one cooldown reply every 15 minutes per PR\n\nFor local development only, you can disable rate limiting:\n\n```bash\nCODE_REVIEWER_RATE_LIMIT_ENABLED=false\n```\n\nProduction public deployments should keep rate limiting enabled. If Upstash is\nunavailable, the default failure mode blocks public repositories and allows\nprivate repositories.\n\n## Deployment checklist\n\nBefore testing from GitHub, confirm:\n\n- The Eve app is deployed and has a POST webhook route at\n  `https://<your-eve-deployment>/eve/v1/github`.\n- The deployment has GitHub App credentials, Upstash Redis REST credentials,\n  and a model credential such as Vercel AI Gateway OIDC or\n  `AI_GATEWAY_API_KEY`.\n- The GitHub App is installed on the repository that contains the pull request.\n- The app has **Contents: read**, **Issues: read/write**, and **Pull requests:\n  read/write** on that repository.\n- The webhook is active and subscribed to **Issue comments** and **Pull request\n  review comments**.\n\nGitHub sends a `ping` webhook when you create or update the app. A successful\ndelivery should return HTTP 200. Then open a pull request and comment:\n\n```md\n@code-reviewer review this\n```\n\nExpected behavior:\n\n- GitHub accepts the webhook delivery.\n- The agent adds an `eyes` reaction unless progress reactions are disabled.\n- The agent posts a GitHub pull request review with inline comments when it\n  finds concrete issues.\n- If no inline finding is warranted, it posts a short PR timeline summary.\n\nCommon setup failures:\n\n- HTTP 401 from `/eve/v1/github`: `GITHUB_WEBHOOK_SECRET` does not match the\n  GitHub App webhook secret.\n- No response to a mention: the app is not subscribed to the comment event, the\n  mention does not match `GITHUB_APP_SLUG`, or the app is not installed on that\n  repository.\n- GitHub API 403: the app installation is missing repository access or one of\n  the required write permissions.\n- Public repository reviews are blocked: Upstash is unavailable and the default\n  failure mode is `public_closed`.\n\n## Development\n\n```bash\npnpm install\npnpm dev\n```\n\nRun `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.\nUse `pnpm eval -- --skip-report` for lightweight agent behavior checks.\n"
      },
      {
        "path": ".env.example",
        "type": "registry:file",
        "target": "~/.env.example",
        "content": "GITHUB_APP_ID=\nGITHUB_APP_PRIVATE_KEY=\nGITHUB_WEBHOOK_SECRET=\nGITHUB_APP_SLUG=code-reviewer\n\n# Vercel Redis/Upstash Marketplace REST credentials.\nKV_REST_API_URL=\nKV_REST_API_TOKEN=\n\nCODE_REVIEWER_RATE_LIMIT_ENABLED=true\nCODE_REVIEWER_RATE_LIMIT_PREFIX=evex:code-reviewer\nCODE_REVIEWER_PR_COOLDOWN_SECONDS=900\nCODE_REVIEWER_USER_PR_COOLDOWN_SECONDS=1800\nCODE_REVIEWER_PRIVATE_REPO_DAILY_LIMIT=25\nCODE_REVIEWER_PUBLIC_REPO_DAILY_LIMIT=10\nCODE_REVIEWER_COOLDOWN_REPLY=true\nCODE_REVIEWER_COOLDOWN_REPLY_SECONDS=900\nCODE_REVIEWER_RATE_LIMIT_FAILURE_MODE=public_closed\n"
      }
    ]
  },
  "github-release-scout": {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "github-release-scout",
    "type": "registry:item",
    "title": "GitHub Release Scout",
    "description": "Connects to GitHub, gathers recently merged pull requests, and prepares release notes that preserve traceability to PR numbers, labels, and rollout risk.",
    "author": "TommyBez",
    "categories": [
      "devops"
    ],
    "dependencies": [
      "eve@^0.11.4",
      "@octokit/rest@^22.0.1",
      "zod@4.3.6"
    ],
    "meta": {
      "slug": "github-release-scout",
      "category": "devops",
      "createdAt": "2026-06-20T00:00:00.000Z",
      "updatedAt": "2026-06-20T00:00:00.000Z"
    },
    "files": [
      {
        "path": "agent/agent.ts",
        "type": "registry:file",
        "target": "~/agent/agent.ts",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  model: \"anthropic/claude-sonnet-4.6\",\n});\n"
      },
      {
        "path": "agent/instructions.md",
        "type": "registry:file",
        "target": "~/agent/instructions.md",
        "content": "# Mission\nInspect GitHub pull requests and releases to prepare release-risk notes.\n\n# Workflow\n1. Use collect_merged_prs to gather recently merged pull requests.\n2. Identify migrations, auth changes, dependency changes, and customer-visible work.\n3. Group risky changes separately from routine maintenance.\n4. Draft release notes that preserve traceability to pull request numbers.\n\n# Output contract\nProvide release themes, high-risk changes, missing validation, and rollout callouts.\n"
      },
      {
        "path": "agent/tools/collect_merged_prs.ts",
        "type": "registry:file",
        "target": "~/agent/tools/collect_merged_prs.ts",
        "content": "import { Octokit } from \"@octokit/rest\";\nimport { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nexport default defineTool({\n  description: \"Fetch recently merged GitHub pull requests for release analysis.\",\n  inputSchema: z.object({\n    owner: z.string().min(1),\n    repo: z.string().min(1),\n    limit: z.number().int().min(1).max(100).default(30),\n    since: z.string().optional(),\n  }),\n  async execute({ owner, repo, limit, since }) {\n    const auth = process.env.GITHUB_TOKEN;\n    if (!auth) {\n      return { authRequired: true, missingEnv: \"GITHUB_TOKEN\", owner, repo };\n    }\n\n    const octokit = new Octokit({ auth });\n    const response = await octokit.pulls.list({\n      owner,\n      repo,\n      state: \"closed\",\n      sort: \"updated\",\n      direction: \"desc\",\n      per_page: limit,\n    });\n\n    const sinceTime = since ? new Date(since).getTime() : 0;\n    const merged = response.data\n      .filter((pull) => pull.merged_at)\n      .filter((pull) => !sinceTime || new Date(pull.merged_at || 0).getTime() >= sinceTime)\n      .map((pull) => ({\n        number: pull.number,\n        title: pull.title,\n        author: pull.user?.login,\n        mergedAt: pull.merged_at,\n        url: pull.html_url,\n        labels: pull.labels.map((label) => label.name),\n      }));\n\n    return { owner, repo, mergedCount: merged.length, merged };\n  },\n});\n"
      },
      {
        "path": "README.md",
        "type": "registry:file",
        "target": "~/agent/README.md",
        "content": "# GitHub Release Scout\n\nConnects to GitHub, gathers recently merged pull requests, and prepares release notes that preserve traceability to PR numbers, labels, and rollout risk.\n\n## Development\n\n```bash\npnpm install\npnpm dev\n```\n\nRun `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.\n"
      },
      {
        "path": ".env.example",
        "type": "registry:file",
        "target": "~/.env.example",
        "content": "GITHUB_TOKEN=\n"
      }
    ]
  },
  "incident-commander": {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "incident-commander",
    "type": "registry:item",
    "title": "Incident Commander",
    "description": "Designed for the first thirty minutes of an outage. It builds a factual timeline, tracks action items, and drafts stakeholder updates without blurring facts and assumptions.",
    "author": "TommyBez",
    "categories": [
      "devops"
    ],
    "dependencies": [
      "eve@^0.11.4",
      "date-fns@^4.4.0",
      "zod@4.3.6"
    ],
    "meta": {
      "slug": "incident-commander",
      "category": "devops",
      "createdAt": "2026-06-20T00:00:00.000Z",
      "updatedAt": "2026-06-20T00:00:00.000Z"
    },
    "files": [
      {
        "path": "agent/agent.ts",
        "type": "registry:file",
        "target": "~/agent/agent.ts",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  model: \"openai/gpt-5.4\",\n});\n"
      },
      {
        "path": "agent/instructions.md",
        "type": "registry:file",
        "target": "~/agent/instructions.md",
        "content": "# Mission\nYou are the first operator in the room during a production incident.\n\n# Priorities\n1. Stabilize customer impact.\n2. Build a trustworthy timeline.\n3. Assign clear next actions with owners and deadlines.\n4. Separate facts from assumptions in every update.\n\n# Workflow\n- Use build_timeline to order raw signals before drawing conclusions.\n- Use track_actions whenever there are more than three workstreams.\n- Delegate to timeline_builder when the event sequence is messy or incomplete.\n- Delegate to status_writer when stakeholders need a clean update drafted quickly.\n- Delegate to mitigation_coordinator when the action list is broad and needs tighter ownership.\n- Load the incident-comms skill before drafting an executive or customer-facing update.\n- Name the blast radius, likely failure domain, and safest containment option.\n- Escalate uncertainty early when data is missing or contradictory.\n\n# Output contract\nProvide:\n- current severity and confidence\n- impact summary in customer terms\n- a timeline of confirmed events\n- the next three actions with owners\n- the message you would send to stakeholders right now\n"
      },
      {
        "path": "agent/skills/incident-comms/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/incident-comms/SKILL.md",
        "content": "---\ndescription: Use when the incident needs a concise stakeholder or executive update.\n---\n\nWrite updates in four blocks:\n- current impact\n- what is confirmed\n- what is being done now\n- when the next update will arrive\n\nAvoid root-cause claims that are still speculative.\n"
      },
      {
        "path": "agent/skills/incident-comms/references/severity-matrix.md",
        "type": "registry:file",
        "target": "~/agent/skills/incident-comms/references/severity-matrix.md",
        "content": "# Severity guide\n- SEV1: widespread outage, data corruption, or security event in progress\n- SEV2: critical workflow degraded for a meaningful customer segment\n- SEV3: isolated or recoverable issue with a workaround\n\n# Upgrade the severity when\n- impact is spreading faster than mitigation\n- ownership is unclear\n- there is any chance of irreversible data loss\n\n# Downgrade only after\n- impact has stopped growing\n- mitigation is holding\n- follow-up owners are assigned\n"
      },
      {
        "path": "agent/skills/incident-comms/references/update-style.md",
        "type": "registry:file",
        "target": "~/agent/skills/incident-comms/references/update-style.md",
        "content": "# Update style\n- lead with customer impact\n- be explicit about uncertainty\n- avoid implementation trivia unless it affects decisions\n- always include the next checkpoint\n"
      },
      {
        "path": "agent/subagents/mitigation_coordinator/agent.ts",
        "type": "registry:file",
        "target": "~/agent/subagents/mitigation_coordinator/agent.ts",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  description: \"Turn incident workstreams into an ordered mitigation plan with clear owners, blockers, and escalation points.\",\n  model: \"openai/gpt-5.4\",\n});\n"
      },
      {
        "path": "agent/subagents/mitigation_coordinator/instructions.md",
        "type": "registry:file",
        "target": "~/agent/subagents/mitigation_coordinator/instructions.md",
        "content": "You are the workstream coordination specialist.\n\nNormalize parallel mitigation tasks into an execution plan. Make blockers visible, identify\noverloaded owners, and tell the parent what should be escalated immediately.\n"
      },
      {
        "path": "agent/subagents/mitigation_coordinator/tools/triage_actions.ts",
        "type": "registry:file",
        "target": "~/agent/subagents/mitigation_coordinator/tools/triage_actions.ts",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nconst action = z.object({\n  summary: z.string().min(1),\n  owner: z.string().min(1),\n  blocked: z.boolean().default(false),\n  impact: z.enum([\"low\", \"medium\", \"high\"]),\n});\n\nexport default defineTool({\n  description: \"Order mitigation actions by impact and blocker state.\",\n  inputSchema: z.object({\n    actions: z.array(action).min(1),\n  }),\n  async execute({ actions }) {\n    const impactRank = { high: 3, medium: 2, low: 1 };\n\n    return {\n      prioritized: actions\n        .map((action) => ({\n          ...action,\n          score: impactRank[action.impact] * 2 - (action.blocked ? 2 : 0),\n        }))\n        .sort((left, right) => right.score - left.score),\n    };\n  },\n});\n"
      },
      {
        "path": "agent/subagents/status_writer/agent.ts",
        "type": "registry:file",
        "target": "~/agent/subagents/status_writer/agent.ts",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  description: \"Draft high-clarity incident updates for stakeholders, executives, or customers without changing the underlying facts.\",\n  model: \"openai/gpt-5.4\",\n});\n"
      },
      {
        "path": "agent/subagents/status_writer/instructions.md",
        "type": "registry:file",
        "target": "~/agent/subagents/status_writer/instructions.md",
        "content": "You are the communications specialist during incidents.\n\nRewrite facts into calm, direct status updates. Keep the message safe for broad distribution,\navoid blame, and never imply the incident is resolved unless containment is confirmed.\n"
      },
      {
        "path": "agent/subagents/status_writer/tools/format_update.ts",
        "type": "registry:file",
        "target": "~/agent/subagents/status_writer/tools/format_update.ts",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nexport default defineTool({\n  description: \"Structure a stakeholder-safe incident update.\",\n  inputSchema: z.object({\n    impact: z.string().min(1),\n    confirmed: z.array(z.string()).min(1),\n    inFlight: z.array(z.string()).min(1),\n    nextUpdateAt: z.string().min(1),\n  }),\n  async execute({ impact, confirmed, inFlight, nextUpdateAt }) {\n    return {\n      update: [\n        \"Impact: \" + impact,\n        \"Confirmed: \" + confirmed.join(\"; \"),\n        \"In progress: \" + inFlight.join(\"; \"),\n        \"Next update: \" + nextUpdateAt,\n      ].join(\"\\n\"),\n    };\n  },\n});\n"
      },
      {
        "path": "agent/subagents/timeline_builder/agent.ts",
        "type": "registry:file",
        "target": "~/agent/subagents/timeline_builder/agent.ts",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  description: \"Reconstruct an incident timeline, highlight evidence gaps, and return only the factual sequence needed by the parent.\",\n  model: \"openai/gpt-5.4\",\n});\n"
      },
      {
        "path": "agent/subagents/timeline_builder/instructions.md",
        "type": "registry:file",
        "target": "~/agent/subagents/timeline_builder/instructions.md",
        "content": "You are the timeline reconstruction specialist.\n\nSeparate confirmed events from inference. Call out missing telemetry windows, contradictory\ntimestamps, and moments where the team likely lost observability.\n"
      },
      {
        "path": "agent/subagents/timeline_builder/tools/find_gaps.ts",
        "type": "registry:file",
        "target": "~/agent/subagents/timeline_builder/tools/find_gaps.ts",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nconst eventWindow = z.object({\n  source: z.string().min(1),\n  startedAt: z.string().min(1),\n  endedAt: z.string().min(1),\n  confidence: z.enum([\"low\", \"medium\", \"high\"]).default(\"medium\"),\n});\n\nexport default defineTool({\n  description: \"Highlight weak evidence windows inside an incident timeline.\",\n  inputSchema: z.object({\n    windows: z.array(eventWindow).min(1),\n  }),\n  async execute({ windows }) {\n    return {\n      weakWindows: windows.filter((window) => window.confidence !== \"high\"),\n      sourceCount: new Set(windows.map((window) => window.source)).size,\n    };\n  },\n});\n"
      },
      {
        "path": "agent/tools/build_timeline.ts",
        "type": "registry:file",
        "target": "~/agent/tools/build_timeline.ts",
        "content": "import { defineTool } from \"eve/tools\";\nimport { differenceInMinutes, parseISO } from \"date-fns\";\nimport { z } from \"zod\";\n\nconst incidentEvent = z.object({\n  at: z.string().min(1),\n  source: z.string().min(1),\n  summary: z.string().min(1),\n  evidence: z.string().optional(),\n});\n\nexport default defineTool({\n  description: \"Sort incident signals into a timeline and highlight suspicious gaps.\",\n  inputSchema: z.object({\n    events: z.array(incidentEvent).min(1),\n  }),\n  async execute({ events }) {\n    const ordered = [...events].sort((left, right) => {\n      return parseISO(left.at).getTime() - parseISO(right.at).getTime();\n    });\n\n    const gaps = [];\n    for (let index = 1; index < ordered.length; index += 1) {\n      const previous = ordered[index - 1];\n      const current = ordered[index];\n      const gapMinutes = differenceInMinutes(\n        parseISO(current.at),\n        parseISO(previous.at),\n      );\n\n      if (gapMinutes >= 20) {\n        gaps.push({\n          after: previous.at,\n          before: current.at,\n          gapMinutes,\n        });\n      }\n    }\n\n    return {\n      sources: Array.from(new Set(ordered.map((event) => event.source))),\n      gaps,\n      timeline: ordered.map((event, index) => ({\n        index: index + 1,\n        ...event,\n      })),\n    };\n  },\n});\n"
      },
      {
        "path": "agent/tools/track_actions.ts",
        "type": "registry:file",
        "target": "~/agent/tools/track_actions.ts",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nconst actionItem = z.object({\n  summary: z.string().min(1),\n  owner: z.string().default(\"unassigned\"),\n  status: z.enum([\"planned\", \"in_progress\", \"blocked\", \"done\"]),\n  dueAt: z.string().optional(),\n  blockers: z.array(z.string()).default([]),\n});\n\nexport default defineTool({\n  description: \"Summarize operational action items and reveal owner or blocker gaps.\",\n  inputSchema: z.object({\n    actions: z.array(actionItem).min(1),\n  }),\n  async execute({ actions }) {\n    const byOwner: Record<string, number> = {};\n    const blocked: string[] = [];\n    const unassigned: string[] = [];\n\n    for (const action of actions) {\n      byOwner[action.owner] = (byOwner[action.owner] ?? 0) + 1;\n      if (action.status === \"blocked\") blocked.push(action.summary);\n      if (action.owner === \"unassigned\") unassigned.push(action.summary);\n    }\n\n    return {\n      total: actions.length,\n      blocked,\n      unassigned,\n      byOwner,\n      open: actions.filter((action) => action.status !== \"done\").length,\n    };\n  },\n});\n"
      },
      {
        "path": "README.md",
        "type": "registry:file",
        "target": "~/agent/README.md",
        "content": "# Incident Commander\n\nDesigned for the first thirty minutes of an outage. It builds a factual timeline, tracks action items, and drafts stakeholder updates without blurring facts and assumptions.\n\n## Development\n\n```bash\npnpm install\npnpm dev\n```\n\nRun `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.\n"
      }
    ]
  },
  "linear-operations-agent": {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "linear-operations-agent",
    "type": "registry:item",
    "title": "Linear Operations Agent",
    "description": "A multi-channel Eve agent for Linear operations: issue triage, Slack intake, cycle health, backlog hygiene, project reporting, and weekly initiative updates.",
    "author": "TommyBez",
    "categories": [
      "productivity"
    ],
    "dependencies": [
      "@vercel/connect@^0.2.6",
      "eve@^0.11.10"
    ],
    "meta": {
      "slug": "linear-operations-agent",
      "category": "productivity",
      "createdAt": "2026-06-20T00:00:00.000Z",
      "updatedAt": "2026-06-23T00:00:00.000Z"
    },
    "files": [
      {
        "path": "agent/agent.ts",
        "type": "registry:file",
        "target": "~/agent/agent.ts",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  model: \"openai/gpt-5.4-mini\",\n});\n"
      },
      {
        "path": "agent/channels/linear.ts",
        "type": "registry:file",
        "target": "~/agent/channels/linear.ts",
        "content": "import { defaultLinearAuth, linearChannel } from \"eve/channels/linear\";\n\nimport { formatPolicySummary, linearOperationsConfig } from \"../lib/linear-operations-config.js\";\n\nconst isString = (value: string | undefined): value is string => value !== undefined;\n\ntype LinearIssueContext = {\n  readonly identifier?: string;\n  readonly id?: string;\n  readonly team?: {\n    readonly id?: string;\n    readonly key?: string;\n    readonly name?: string;\n  } | null;\n  readonly project?: {\n    readonly id?: string;\n    readonly name?: string;\n    readonly slug?: string;\n  } | null;\n};\n\ntype LinearAgentSessionEventLike = {\n  readonly action?: string;\n  readonly agentSession?: {\n    readonly issue?: LinearIssueContext | null;\n  } | null;\n};\n\nconst issueMatchesScope = (issue: LinearIssueContext | null | undefined): boolean => {\n  if (!issue) return true;\n\n  const teamCandidates = [issue.team?.id, issue.team?.key, issue.team?.name].filter(isString);\n  const projectCandidates = [issue.project?.id, issue.project?.slug, issue.project?.name].filter(isString);\n\n  const teamAllowed =\n    linearOperationsConfig.coveredTeams.length === 0 ||\n    teamCandidates.length === 0 ||\n    teamCandidates.some((team) => linearOperationsConfig.coveredTeams.includes(team));\n  const projectAllowed =\n    linearOperationsConfig.coveredProjects.length === 0 ||\n    projectCandidates.length === 0 ||\n    projectCandidates.some((project) => linearOperationsConfig.coveredProjects.includes(project));\n\n  return teamAllowed && projectAllowed;\n};\n\nconst formatLinearContext = (event: LinearAgentSessionEventLike): string => {\n  const issue = event.agentSession?.issue;\n  const issueLabel = issue?.identifier ?? issue?.id ?? \"unknown issue\";\n  const teamLabel = issue?.team?.key ?? issue?.team?.name ?? issue?.team?.id ?? \"unknown team\";\n  const projectLabel = issue?.project?.name ?? issue?.project?.slug ?? issue?.project?.id ?? \"no project\";\n\n  return [\n    \"Surface: Linear Agent Session.\",\n    `Issue: ${issueLabel}`,\n    `Team: ${teamLabel}`,\n    `Project: ${projectLabel}`,\n    \"Linear is the source of truth. Keep proposals and executed actions attached to the relevant Linear object.\",\n    \"Policy summary:\",\n    formatPolicySummary(),\n  ].join(\"\\n\");\n};\n\nexport default linearChannel({\n  credentials: {\n    accessToken: process.env.LINEAR_AGENT_ACCESS_TOKEN,\n    webhookSecret: process.env.LINEAR_WEBHOOK_SECRET,\n  },\n  onAgentSession: (_ctx, event) => {\n    const eventLike = event as LinearAgentSessionEventLike;\n    if (event.action !== \"created\" && event.action !== \"prompted\") return null;\n    if (!issueMatchesScope(eventLike.agentSession?.issue)) return null;\n\n    return {\n      auth: defaultLinearAuth(event),\n      context: [formatLinearContext(eventLike)],\n    };\n  },\n});\n"
      },
      {
        "path": "agent/channels/slack.ts",
        "type": "registry:file",
        "target": "~/agent/channels/slack.ts",
        "content": "import { connectSlackCredentials } from \"@vercel/connect/eve\";\nimport { defaultSlackAuth, loadThreadContextMessages, slackChannel } from \"eve/channels/slack\";\n\nconst SLACK_OPERATING_CONTEXT = [\n  \"Surface: Slack.\",\n  \"Slack is intake, coordination, notification, and scheduled delivery.\",\n  \"The final operational source of truth must live in Linear whenever work is created or changed.\",\n  \"Before sensitive Linear changes, ask for approval in the originating Slack thread or move the final confirmation to Linear.\",\n].join(\"\\n\");\n\nexport default slackChannel({\n  credentials: connectSlackCredentials(process.env.SLACK_CONNECT_UID ?? \"slack/linear-operations-agent\"),\n  async onAppMention(ctx, message) {\n    const auth = defaultSlackAuth(message, ctx);\n    try {\n      const priorMessages = await loadThreadContextMessages(ctx.thread, message, {\n        since: \"last-agent-reply\",\n      });\n\n      const transcript = priorMessages\n        .map(\n          (threadMessage) =>\n            `${threadMessage.isMe ? \"agent\" : (threadMessage.user ?? \"user\")}: ${threadMessage.markdown}`,\n        )\n        .join(\"\\n\");\n\n      return {\n        auth,\n        context: transcript\n          ? [SLACK_OPERATING_CONTEXT, `Recent Slack thread context since the last agent reply:\\n\\n${transcript}`]\n          : [SLACK_OPERATING_CONTEXT],\n      };\n    } catch {\n      return {\n        auth,\n        context: [SLACK_OPERATING_CONTEXT],\n      };\n    }\n  },\n  onDirectMessage: (ctx, message) => ({\n    auth: defaultSlackAuth(message, ctx),\n    context: [SLACK_OPERATING_CONTEXT],\n  }),\n});\n"
      },
      {
        "path": "agent/lib/linear-operations-config.ts",
        "type": "registry:file",
        "target": "~/agent/lib/linear-operations-config.ts",
        "content": "export type CoveredInitiative = {\n  readonly idOrName: string;\n  readonly slackChannelId?: string;\n  readonly weeklyUpdateEnabled: boolean;\n};\n\nexport type SlackChannelKind = \"default\" | \"triage\" | \"cycle\" | \"backlog\" | \"p1Monitoring\";\n\nexport type LinearOperationsConfig = {\n  readonly coveredTeams: readonly string[];\n  readonly coveredProjects: readonly string[];\n  readonly coveredInitiatives: readonly CoveredInitiative[];\n  readonly slack: {\n    readonly defaultChannelId?: string;\n    readonly triageChannelId?: string;\n    readonly cycleChannelId?: string;\n    readonly backlogChannelId?: string;\n    readonly p1MonitoringChannelId?: string;\n    readonly projectChannels: Readonly<Record<string, string>>;\n  };\n  readonly policy: {\n    readonly readOnlyTeams: readonly string[];\n    readonly maxBulkIssueCount: number;\n    readonly highPriorityValues: readonly number[];\n    readonly autoInitiativeUpdates: boolean;\n  };\n  readonly schedules: {\n    readonly dailyTriageDigest: string;\n    readonly cycleHealth: string;\n    readonly weeklyBacklogHygiene: string;\n    readonly weeklyProjectSummary: string;\n    readonly weeklyInitiativeUpdates: string;\n    readonly p1Monitoring: string;\n  };\n};\n\nconst DEFAULT_MAX_BULK_ISSUE_COUNT = 10;\nconst HIGH_PRIORITY_VALUES = [1, 2] as const;\n\nconst compactCsv = (value: string | undefined): string[] =>\n  (value ?? \"\")\n    .split(\",\")\n    .map((item) => item.trim())\n    .filter(Boolean);\n\nconst optional = (value: string | undefined): string | undefined => {\n  const trimmed = value?.trim();\n  return trimmed ? trimmed : undefined;\n};\n\nconst parseBoolean = (value: string | undefined, fallback: boolean): boolean => {\n  if (value === undefined) return fallback;\n  return value.trim().toLowerCase() !== \"false\";\n};\n\nconst parsePositiveInteger = (value: string | undefined, fallback: number): number => {\n  const parsed = Number.parseInt(value ?? \"\", 10);\n  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;\n};\n\nconst parseProjectChannels = (value: string | undefined): Record<string, string> => {\n  const entries: Record<string, string> = {};\n  for (const pair of compactCsv(value)) {\n    const [project, channelId] = pair.split(\":\").map((part) => part.trim());\n    if (project && channelId) entries[project] = channelId;\n  }\n  return entries;\n};\n\nconst parseCoveredInitiatives = (value: string | undefined): CoveredInitiative[] => {\n  return compactCsv(value).map((rawItem) => {\n    const [idOrName = \"\", slackChannelId, enabledFlag] = rawItem\n      .split(\"|\")\n      .map((part) => part.trim());\n\n    return {\n      idOrName,\n      slackChannelId: optional(slackChannelId),\n      weeklyUpdateEnabled: enabledFlag === undefined || enabledFlag.toLowerCase() !== \"false\",\n    };\n  });\n};\n\nexport const linearOperationsConfig = {\n  coveredTeams: compactCsv(process.env.LINEAR_OPS_COVERED_TEAMS),\n  coveredProjects: compactCsv(process.env.LINEAR_OPS_COVERED_PROJECTS),\n  coveredInitiatives: parseCoveredInitiatives(process.env.LINEAR_OPS_COVERED_INITIATIVES),\n  slack: {\n    defaultChannelId: optional(process.env.LINEAR_OPS_DEFAULT_SLACK_CHANNEL_ID),\n    triageChannelId: optional(process.env.LINEAR_OPS_TRIAGE_SLACK_CHANNEL_ID),\n    cycleChannelId: optional(process.env.LINEAR_OPS_CYCLE_SLACK_CHANNEL_ID),\n    backlogChannelId: optional(process.env.LINEAR_OPS_BACKLOG_SLACK_CHANNEL_ID),\n    p1MonitoringChannelId: optional(process.env.LINEAR_OPS_P1_SLACK_CHANNEL_ID),\n    projectChannels: parseProjectChannels(process.env.LINEAR_OPS_PROJECT_CHANNELS),\n  },\n  policy: {\n    readOnlyTeams: compactCsv(process.env.LINEAR_OPS_READ_ONLY_TEAMS),\n    maxBulkIssueCount: parsePositiveInteger(\n      process.env.LINEAR_OPS_MAX_BULK_ISSUE_COUNT,\n      DEFAULT_MAX_BULK_ISSUE_COUNT,\n    ),\n    highPriorityValues: HIGH_PRIORITY_VALUES,\n    autoInitiativeUpdates: parseBoolean(process.env.LINEAR_OPS_AUTO_INITIATIVE_UPDATES, true),\n  },\n  schedules: {\n    dailyTriageDigest: process.env.LINEAR_OPS_DAILY_TRIAGE_CRON ?? \"0 7 * * 1-5\",\n    cycleHealth: process.env.LINEAR_OPS_CYCLE_HEALTH_CRON ?? \"30 7 * * 1-5\",\n    weeklyBacklogHygiene: process.env.LINEAR_OPS_WEEKLY_BACKLOG_CRON ?? \"0 8 * * 1\",\n    weeklyProjectSummary: process.env.LINEAR_OPS_WEEKLY_PROJECT_CRON ?? \"30 8 * * 1\",\n    weeklyInitiativeUpdates: process.env.LINEAR_OPS_WEEKLY_INITIATIVE_CRON ?? \"0 9 * * 1\",\n    p1Monitoring: process.env.LINEAR_OPS_P1_MONITORING_CRON ?? \"0 13 * * 1-5\",\n  },\n} satisfies LinearOperationsConfig;\n\nexport const getSlackChannelId = (kind: SlackChannelKind): string | undefined => {\n  switch (kind) {\n    case \"triage\":\n      return linearOperationsConfig.slack.triageChannelId ?? linearOperationsConfig.slack.defaultChannelId;\n    case \"cycle\":\n      return linearOperationsConfig.slack.cycleChannelId ?? linearOperationsConfig.slack.defaultChannelId;\n    case \"backlog\":\n      return linearOperationsConfig.slack.backlogChannelId ?? linearOperationsConfig.slack.defaultChannelId;\n    case \"p1Monitoring\":\n      return (\n        linearOperationsConfig.slack.p1MonitoringChannelId ?? linearOperationsConfig.slack.defaultChannelId\n      );\n    case \"default\":\n      return linearOperationsConfig.slack.defaultChannelId;\n  }\n};\n\nexport const getProjectSlackChannelId = (projectNameOrId: string): string | undefined =>\n  linearOperationsConfig.slack.projectChannels[projectNameOrId] ?? linearOperationsConfig.slack.defaultChannelId;\n\nexport const getCoveredInitiative = (idOrName: string): CoveredInitiative | undefined =>\n  linearOperationsConfig.coveredInitiatives.find((initiative) => initiative.idOrName === idOrName);\n\nexport const isExplicitlyCoveredInitiative = (idOrName: string | undefined): boolean =>\n  idOrName !== undefined && getCoveredInitiative(idOrName) !== undefined;\n\nexport const formatPolicySummary = (): string => {\n  const readOnlyTeams = linearOperationsConfig.policy.readOnlyTeams.join(\", \") || \"none configured\";\n  const coveredTeams = linearOperationsConfig.coveredTeams.join(\", \") || \"all teams\";\n  const coveredProjects = linearOperationsConfig.coveredProjects.join(\", \") || \"all projects\";\n  const initiatives =\n    linearOperationsConfig.coveredInitiatives.map((initiative) => initiative.idOrName).join(\", \") ||\n    \"none configured\";\n\n  return [\n    `Covered teams: ${coveredTeams}`,\n    `Covered projects: ${coveredProjects}`,\n    `Read-only teams: ${readOnlyTeams}`,\n    `Explicit initiatives for weekly updates: ${initiatives}`,\n    `Max bulk issue count: ${linearOperationsConfig.policy.maxBulkIssueCount}`,\n  ].join(\"\\n\");\n};\n"
      },
      {
        "path": "agent/connections/linear.ts",
        "type": "registry:file",
        "target": "~/agent/connections/linear.ts",
        "content": "import { connect } from \"@vercel/connect/eve\";\nimport { defineMcpClientConnection } from \"eve/connections\";\n\nimport {\n  getCoveredInitiative,\n  linearOperationsConfig,\n} from \"../lib/linear-operations-config.js\";\n\nconst READ_TOOLS = [\n  \"list_issues\",\n  \"get_issue\",\n  \"list_comments\",\n  \"list_projects\",\n  \"get_status_updates\",\n  \"list_cycles\",\n  \"list_issue_labels\",\n  \"list_issue_statuses\",\n  \"get_issue_status\",\n  \"extract_images\",\n  \"search_documentation\",\n] as const;\n\nconst WRITE_TOOLS = [\n  \"save_issue\",\n  \"save_comment\",\n  \"save_project\",\n  \"save_document\",\n  \"save_status_update\",\n  \"delete_status_update\",\n] as const;\n\nconst normalizeToolName = (toolName: string): string => toolName.split(\"__\").at(-1) ?? toolName;\n\nconst asRecord = (value: unknown): Record<string, unknown> =>\n  typeof value === \"object\" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};\n\nconst getStringField = (input: Record<string, unknown>, field: string): string | undefined => {\n  const value = input[field];\n  return typeof value === \"string\" && value.trim() ? value : undefined;\n};\n\nconst needsSaveIssueApproval = (toolInput: unknown): boolean => {\n  const input = asRecord(toolInput);\n  if (!getStringField(input, \"id\")) return true;\n\n  const changedFields = Object.keys(input).filter((field) => field !== \"id\");\n  return changedFields.length > 0;\n};\n\nconst needsStatusUpdateApproval = (toolInput: unknown): boolean => {\n  const input = asRecord(toolInput);\n  const type = getStringField(input, \"type\");\n  const initiativeIdOrName =\n    getStringField(input, \"initiativeId\") ??\n    getStringField(input, \"initiativeName\") ??\n    getStringField(input, \"initiative\") ??\n    getStringField(input, \"projectMilestoneId\");\n  const coveredInitiative = getCoveredInitiative(initiativeIdOrName ?? \"\");\n\n  if (\n    type === \"initiative\" &&\n    linearOperationsConfig.policy.autoInitiativeUpdates &&\n    coveredInitiative?.weeklyUpdateEnabled === true\n  ) {\n    return false;\n  }\n\n  return true;\n};\n\nexport default defineMcpClientConnection({\n  url: \"https://mcp.linear.app/mcp\",\n  description:\n    \"Linear workspace operations: read issues, comments, projects, cycles, labels, statuses, status updates, and create approved operational updates.\",\n  auth: connect(process.env.LINEAR_CONNECT_UID ?? \"oauth/linear\"),\n  tools: {\n    allow: [...READ_TOOLS, ...WRITE_TOOLS],\n  },\n  approval: ({ toolName, toolInput }) => {\n    const normalizedToolName = normalizeToolName(toolName);\n\n    if (READ_TOOLS.includes(normalizedToolName as (typeof READ_TOOLS)[number])) return false;\n    if (normalizedToolName === \"save_comment\") return false;\n    if (normalizedToolName === \"save_status_update\") return needsStatusUpdateApproval(toolInput);\n    if (normalizedToolName === \"save_issue\") return needsSaveIssueApproval(toolInput);\n    if (\n      normalizedToolName === \"save_project\" ||\n      normalizedToolName === \"save_document\" ||\n      normalizedToolName === \"delete_status_update\"\n    ) {\n      return true;\n    }\n\n    return true;\n  },\n});\n"
      },
      {
        "path": "agent/instructions.md",
        "type": "registry:file",
        "target": "~/agent/instructions.md",
        "content": "# Mission\n\nYou are Linear Operations Agent, an Eve agent that helps teams turn Linear issues, Slack discussions, cycles, projects, backlog, and initiatives into clear operational work.\n\nLinear is the source of truth. Slack is for intake, coordination, notification, and scheduled delivery. Schedule runs should be concise and should avoid noise. Final operational changes must be attached to the relevant Linear object whenever the work creates or updates Linear state.\n\nUse the Linear MCP connection for Linear data. Do not assume tool schemas beyond what the MCP tool exposes at runtime. Prefer read tools first, then ask for approval before sensitive writes. Never invent issue identifiers, statuses, priorities, owners, labels, projects, cycles, or initiative data.\n\n## Operating Modes\n\n### Assisted\n\nRespond to explicit requests from Linear or Slack: triage, duplicate detection, clarification, decomposition, planning, incident support, project reporting, or initiative reporting.\n\n### Proactive\n\nSchedule runs publish operational digests to configured Slack channels, except weekly initiative updates, which are written directly to Linear as initiative status updates for explicitly configured initiatives only.\n\n### Approval\n\nAsk for approval before sensitive changes: issue creation, state changes, priority changes, assignee/delegate/project/cycle changes, duplicate or parent relationships, project/document changes, status update deletes, and any bulk action. Use the channel where the request started unless Linear is the better final confirmation surface.\n\n### Read-only\n\nWhen the policy or context is read-only, only read, analyze, summarize, and propose. Do not write to Linear unless the channel context and approval policy allow it.\n\n## Default Response Shape\n\nKeep outputs operational and concise:\n\n- Summary\n- Findings\n- Missing information\n- Recommendation\n- Proposed Linear action\n- Approval request, when needed\n\nAlways distinguish proposal from action already executed.\n\n## Linear Behavior\n\nIn Linear, respond in the Agent Session context. Keep the reference to the original request. Add clear context on the issue, project, cycle, or initiative involved. If an issue is vague, ask the smallest set of clarifying questions needed to make it actionable.\n\n## Slack Behavior\n\nIn Slack, interpret the thread as intake context. Separate discussion, decision, and action. Prepare or propose Linear work, then link or describe the target Linear object. Do not let Slack become the long-term source of truth.\n\n## Schedule Behavior\n\nFor recurring jobs, highlight only items that need attention, group similar findings, propose concrete next steps, and avoid invasive changes. Deliver operational digests to Slack. For weekly initiative updates, write the update directly to the configured Linear initiative; if Linear roadmaps or initiatives are unavailable, report the error clearly in Slack.\n"
      },
      {
        "path": "agent/schedules/cycle-health.ts",
        "type": "registry:file",
        "target": "~/agent/schedules/cycle-health.ts",
        "content": "import { defineSchedule } from \"eve/schedules\";\n\nimport slack from \"../channels/slack.js\";\nimport { getSlackChannelId, linearOperationsConfig } from \"../lib/linear-operations-config.js\";\n\nexport default defineSchedule({\n  cron: linearOperationsConfig.schedules.cycleHealth,\n  async run({ receive, waitUntil, appAuth }) {\n    const channelId = getSlackChannelId(\"cycle\");\n    if (!channelId) return;\n\n    waitUntil(\n      receive(slack, {\n        auth: appAuth,\n        target: { channelId },\n        message:\n          \"Run the Linear cycle health report for configured teams and current cycles. Check blocked issues, stale P0/P1 issues, owner overload, work added after the cycle started, scope creep, and completed work not closed. Deliver the operational report to Slack. Do not apply Linear updates automatically.\",\n      }),\n    );\n  },\n});\n"
      },
      {
        "path": "agent/schedules/daily-triage-digest.ts",
        "type": "registry:file",
        "target": "~/agent/schedules/daily-triage-digest.ts",
        "content": "import { defineSchedule } from \"eve/schedules\";\n\nimport slack from \"../channels/slack.js\";\nimport { getSlackChannelId, linearOperationsConfig } from \"../lib/linear-operations-config.js\";\n\nexport default defineSchedule({\n  cron: linearOperationsConfig.schedules.dailyTriageDigest,\n  async run({ receive, waitUntil, appAuth }) {\n    const channelId = getSlackChannelId(\"triage\");\n    if (!channelId) return;\n\n    waitUntil(\n      receive(slack, {\n        auth: appAuth,\n        target: { channelId },\n        message:\n          \"Run the daily Linear triage digest in read-only mode. Highlight only issues that need attention: in triage too long, missing owner, missing priority, stale updates, likely duplicates, or blocked work. Deliver a concise Slack digest with concrete next steps. Do not modify Linear objects.\",\n      }),\n    );\n  },\n});\n"
      },
      {
        "path": "agent/schedules/p1-monitoring.ts",
        "type": "registry:file",
        "target": "~/agent/schedules/p1-monitoring.ts",
        "content": "import { defineSchedule } from \"eve/schedules\";\n\nimport slack from \"../channels/slack.js\";\nimport { getSlackChannelId, linearOperationsConfig } from \"../lib/linear-operations-config.js\";\n\nexport default defineSchedule({\n  cron: linearOperationsConfig.schedules.p1Monitoring,\n  async run({ receive, waitUntil, appAuth }) {\n    const channelId = getSlackChannelId(\"p1Monitoring\");\n    if (!channelId) return;\n\n    waitUntil(\n      receive(slack, {\n        auth: appAuth,\n        target: { channelId },\n        message:\n          \"Monitor Linear P0/P1 issues in read-only mode. Alert only on critical issues without recent updates, missing owner, unresolved blockers, or unclear next action. Do not change state or priority.\",\n      }),\n    );\n  },\n});\n"
      },
      {
        "path": "agent/schedules/weekly-backlog-hygiene.ts",
        "type": "registry:file",
        "target": "~/agent/schedules/weekly-backlog-hygiene.ts",
        "content": "import { defineSchedule } from \"eve/schedules\";\n\nimport slack from \"../channels/slack.js\";\nimport { getSlackChannelId, linearOperationsConfig } from \"../lib/linear-operations-config.js\";\n\nexport default defineSchedule({\n  cron: linearOperationsConfig.schedules.weeklyBacklogHygiene,\n  async run({ receive, waitUntil, appAuth }) {\n    const channelId = getSlackChannelId(\"backlog\");\n    if (!channelId) return;\n\n    waitUntil(\n      receive(slack, {\n        auth: appAuth,\n        target: { channelId },\n        message:\n          \"Run weekly Linear backlog hygiene in proposal-only mode. Find stale, probably obsolete, duplicate, ownerless, priorityless, and under-specified issues. Group findings and propose concrete cleanup actions. Do not close, archive, reprioritize, or bulk update issues without approval.\",\n      }),\n    );\n  },\n});\n"
      },
      {
        "path": "agent/schedules/weekly-initiative-updates.ts",
        "type": "registry:file",
        "target": "~/agent/schedules/weekly-initiative-updates.ts",
        "content": "import { defineSchedule } from \"eve/schedules\";\n\nimport slack from \"../channels/slack.js\";\nimport {\n  getSlackChannelId,\n  linearOperationsConfig,\n} from \"../lib/linear-operations-config.js\";\n\nconst getEnabledInitiatives = () =>\n  linearOperationsConfig.coveredInitiatives.filter((initiative) => initiative.weeklyUpdateEnabled);\n\nexport default defineSchedule({\n  cron: linearOperationsConfig.schedules.weeklyInitiativeUpdates,\n  async run({ receive, waitUntil, appAuth }) {\n    const initiatives = getEnabledInitiatives();\n    if (initiatives.length === 0) return;\n\n    for (const initiative of initiatives) {\n      const channelId = initiative.slackChannelId ?? getSlackChannelId(\"default\");\n      if (!channelId) continue;\n\n      waitUntil(\n        receive(slack, {\n          auth: appAuth,\n          target: { channelId },\n          message: [\n            \"Create a weekly Linear initiative update for this explicitly configured initiative only.\",\n            `Configured initiative: ${initiative.idOrName}.`,\n            \"Analyze related issues, projects, recent completions, open work, blockers, risks, dependencies, pending decisions, scope changes, and recommended next steps.\",\n            'Write the final update directly to Linear with save_status_update({ type: \"initiative\" }).',\n            \"If Linear reports that roadmaps or initiatives are not enabled in this workspace, post a clear Slack error to this configured channel instead of producing a generic digest.\",\n          ].join(\"\\n\"),\n        }),\n      );\n    }\n  },\n});\n"
      },
      {
        "path": "agent/schedules/weekly-project-summary.ts",
        "type": "registry:file",
        "target": "~/agent/schedules/weekly-project-summary.ts",
        "content": "import { defineSchedule } from \"eve/schedules\";\n\nimport slack from \"../channels/slack.js\";\nimport { getSlackChannelId, linearOperationsConfig } from \"../lib/linear-operations-config.js\";\n\nexport default defineSchedule({\n  cron: linearOperationsConfig.schedules.weeklyProjectSummary,\n  async run({ receive, waitUntil, appAuth }) {\n    const channelId = getSlackChannelId(\"default\");\n    if (!channelId) return;\n\n    waitUntil(\n      receive(slack, {\n        auth: appAuth,\n        target: { channelId },\n        message:\n          \"Run the weekly Linear project summary for configured projects. Summarize state, recent progress, completed issues, open work, blockers, risks, pending decisions, next steps, and scope changes. Deliver the report to Slack. Use Linear project/status update writes only when explicitly requested and approved.\",\n      }),\n    );\n  },\n});\n"
      },
      {
        "path": "agent/skills/backlog-hygiene/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/backlog-hygiene/SKILL.md",
        "content": "---\ndescription: Find stale, obsolete, duplicate, under-specified, ownerless, and priorityless Linear backlog issues.\n---\n\n# Backlog Hygiene Skill\n\nUse this skill for backlog cleanup requests or weekly backlog hygiene schedules.\n\nProcess:\n\n1. Read configured team and project backlogs.\n2. Identify stale, obsolete, duplicate, ownerless, priorityless, and unclear issues.\n3. Group findings by recommended action.\n4. Keep bulk recommendations under the configured max bulk issue count unless asked otherwise.\n5. Propose cleanup actions instead of applying them automatically.\n6. Ask approval before closing, archiving, reprioritizing, moving, or bulk updating issues.\n\nOutput sections:\n\n- Backlog findings\n- Suggested cleanup actions\n- Duplicates or obsolete issues\n- Clarification candidates\n- Approval request for any write\n"
      },
      {
        "path": "agent/skills/clarification/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/clarification/SKILL.md",
        "content": "---\ndescription: Rewrite a vague Linear request into a clear problem statement with context, acceptance criteria, out of scope, and open questions.\n---\n\n# Clarification Skill\n\nUse this skill when a Linear issue or Slack intake is vague, incomplete, or not ready for implementation.\n\nProcess:\n\n1. Read the source issue, comments, and relevant Slack thread context if available.\n2. Extract the problem, user impact, current behavior, expected behavior, and constraints.\n3. Draft a clearer description without inventing facts.\n4. Add acceptance criteria that can be verified.\n5. Mark out-of-scope items to prevent scope creep.\n6. List open questions and missing evidence.\n7. Ask approval before updating the Linear issue description.\n\nOutput sections:\n\n- Problem\n- Context\n- Acceptance criteria\n- Out of scope\n- Open questions\n- Proposed Linear update\n"
      },
      {
        "path": "agent/skills/cycle-health/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/cycle-health/SKILL.md",
        "content": "---\ndescription: Analyze Linear cycle health, including blocked work, stale updates, scope creep, owner overload, and risky current-cycle issues.\n---\n\n# Cycle Health Skill\n\nUse this skill for current-cycle reports or schedule-driven cycle health checks.\n\nProcess:\n\n1. Identify configured teams and their current cycle.\n2. Read open and recently completed cycle issues.\n3. Flag blocked issues, stale P0/P1 work, ownerless work, work added after cycle start, and completed work not closed.\n4. Look for owner overload and unresolved dependencies.\n5. Keep the Slack report concise and action-oriented.\n6. Do not update Linear automatically during scheduled cycle reports.\n\nOutput sections:\n\n- Health status\n- Key risks\n- Issues needing attention\n- Scope changes\n- Recommended standup topics\n"
      },
      {
        "path": "agent/skills/decomposition/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/decomposition/SKILL.md",
        "content": "---\ndescription: Break a complex Linear issue into implementable sub-issues, dependencies, risks, and an approval-gated creation plan.\n---\n\n# Decomposition Skill\n\nUse this skill when a user asks to split an issue into tasks, sub-issues, milestones, or implementation steps.\n\nProcess:\n\n1. Read the parent issue and relevant comments.\n2. Identify independent work units that can be implemented and reviewed separately.\n3. Order tasks by dependency and risk.\n4. Propose ownership where there is enough evidence; otherwise mark owner as unknown.\n5. Include qualitative complexity and risk notes.\n6. Ask approval before creating sub-issues or changing parent relationships.\n\nOutput sections:\n\n- Proposed sub-issues\n- Dependency order\n- Risks\n- Ownership suggestions\n- Creation approval request\n"
      },
      {
        "path": "agent/skills/duplicate-detection/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/duplicate-detection/SKILL.md",
        "content": "---\ndescription: Find likely duplicate Linear issues, compare evidence, and propose link, merge, or closure actions.\n---\n\n# Duplicate Detection Skill\n\nUse this skill when a user asks whether an issue is duplicated or related.\n\nProcess:\n\n1. Extract search terms from title, description, error messages, product area, labels, and comments.\n2. Use `list_issues` with targeted queries.\n3. Use `get_issue` on the strongest candidates before making a recommendation.\n4. Compare scope, symptoms, environment, impacted user flow, and current status.\n5. Recommend the canonical issue to keep open.\n6. Ask approval before writing duplicate links, changing status, or closing anything.\n\nOutput sections:\n\n- Candidate duplicates\n- Why they match or do not match\n- Recommended canonical issue\n- Proposed Linear action\n- Approval request\n"
      },
      {
        "path": "agent/skills/incident-support/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/incident-support/SKILL.md",
        "content": "---\ndescription: Support P0/P1 bug and incident issues by identifying missing evidence, related work, priority, owner, stakeholder update, and follow-up actions.\n---\n\n# Incident Support Skill\n\nUse this skill for urgent bugs, incidents, P0/P1 monitoring, or questions about critical issue readiness.\n\nProcess:\n\n1. Read the critical issue, comments, status, priority, assignee, labels, project, and related issues.\n2. Identify impact, environment, reproduction steps, affected versions, timestamps, recent deploys, and mitigation state.\n3. Search for related incidents, fixes, or duplicate reports.\n4. Propose owner, stakeholder update, and follow-up issues only when supported by evidence.\n5. Ask approval before changing priority, state, assignee, project, cycle, or creating follow-up work.\n6. For scheduled monitoring, alert in Slack without changing Linear state.\n\nOutput sections:\n\n- Impact summary\n- Missing evidence\n- Related issues\n- Operational risk\n- Recommended next step\n- Approval request\n"
      },
      {
        "path": "agent/skills/initiative-reporting/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/initiative-reporting/SKILL.md",
        "content": "---\ndescription: Create weekly Linear initiative updates for explicitly configured initiatives, including progress, blockers, risks, and next steps.\n---\n\n# Initiative Reporting Skill\n\nUse this skill for weekly initiative update schedules or direct requests about configured initiatives.\n\nProcess:\n\n1. Work only on initiatives explicitly configured for coverage.\n2. Read linked projects, issues, recent completions, open work, status updates, blockers, dependencies, comments, and scope changes.\n3. Draft a concise weekly update with state, progress, blockers, risks, pending decisions, and next actions.\n4. Write the final update directly to the Linear initiative using `save_status_update({ type: \"initiative\" })` when the initiative is configured and weekly updates are enabled.\n5. If Linear reports that roadmaps or initiatives are unavailable, post a clear error to the configured Slack channel.\n6. Do not create initiative updates for unconfigured initiatives.\n\nOutput sections:\n\n- Initiative status\n- Recent progress\n- Blockers\n- Risks\n- Pending decisions\n- Recommended next steps\n"
      },
      {
        "path": "agent/skills/project-reporting/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/project-reporting/SKILL.md",
        "content": "---\ndescription: Produce Linear project reports covering status, progress, open work, blockers, risks, decisions, next steps, and scope changes.\n---\n\n# Project Reporting Skill\n\nUse this skill for project summaries, weekly project reports, and project decision support.\n\nProcess:\n\n1. Read project metadata, status updates, linked issues, labels, and comments.\n2. Summarize current state and recent progress.\n3. List completed work and open work that matters.\n4. Highlight blockers, risks, pending decisions, and scope changes.\n5. Recommend next steps.\n6. Deliver scheduled summaries to Slack. Only write Linear project or status updates when requested and approved.\n\nOutput sections:\n\n- Project status\n- Recent progress\n- Blockers\n- Risks\n- Pending decisions\n- Next steps\n"
      },
      {
        "path": "agent/skills/slack-intake/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/slack-intake/SKILL.md",
        "content": "---\ndescription: Turn a Slack thread into structured Linear work while preserving decisions, action items, and missing context.\n---\n\n# Slack Intake Skill\n\nUse this skill when a Slack mention asks to summarize a thread, create a Linear issue, link discussion to an issue, or identify what is missing before ticket creation.\n\nProcess:\n\n1. Read the provided thread context.\n2. Separate discussion, decisions, action items, evidence, and unresolved questions.\n3. Draft a Linear issue title and body.\n4. Suggest team, priority, labels, and project only when evidence supports them.\n5. Ask approval before creating or modifying Linear issues.\n6. After creation, respond in Slack with the Linear link and what was included.\n\nOutput sections:\n\n- Thread summary\n- Decision or action\n- Proposed Linear issue\n- Missing information\n- Approval request\n"
      },
      {
        "path": "agent/skills/triage/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/triage/SKILL.md",
        "content": "---\ndescription: Triage a Linear issue into type, priority, owner, team, labels, missing information, duplicates, and next step.\n---\n\n# Triage Skill\n\nUse this skill when a user asks for issue triage or asks whether an issue is actionable.\n\nProcess:\n\n1. Read the issue, comments, labels, status, team, project, cycle, priority, and assignee.\n2. Search for related or duplicate issues using the Linear MCP read tools.\n3. Classify the issue type: bug, feature, task, incident, support, product question, cleanup, or unclear.\n4. Identify missing information that blocks execution.\n5. Propose priority, owner or owner team, labels, project or cycle, and next step.\n6. Distinguish recommendations from actions already applied.\n7. Ask for approval before any sensitive Linear write.\n\nOutput sections:\n\n- Summary\n- Classification\n- Missing information\n- Suggested Linear metadata\n- Related or duplicate issues\n- Next step\n- Approval request, if needed\n"
      },
      {
        "path": "README.md",
        "type": "registry:file",
        "target": "~/agent/README.md",
        "content": "# Linear Operations Agent\n\nAn Eve agent for Linear operations across Linear, Slack, and scheduled runs.\n\nLinear is the source of truth. Slack is used for intake, coordination, notification, and scheduled report delivery. Scheduled initiative updates are written directly to Linear for explicitly configured initiatives.\n\n## Capabilities\n\n- Linear issue triage, clarification, decomposition, duplicate detection, and incident support.\n- Slack thread intake that prepares or creates structured Linear work after approval.\n- Scheduled daily triage, cycle health, backlog hygiene, project summaries, P0/P1 monitoring, and weekly initiative updates.\n- One Linear MCP connection with dynamic approval policy. No custom Linear SDK tools are included.\n\n## Linear Agent App Setup\n\nCreate a Linear OAuth app for the agent surface:\n\n- Use the authorize URL with `actor=app`.\n- Grant app scopes including `app:assignable` and `app:mentionable`.\n- Subscribe to `AgentSessionEvent`.\n- Configure the webhook URL as `/eve/v1/linear`.\n- Set `LINEAR_AGENT_ACCESS_TOKEN` for Agent Activities and proactive sessions.\n- Set `LINEAR_WEBHOOK_SECRET` for webhook verification.\n\nThe Linear channel accepts only `created` and `prompted` Agent Session events.\n\n## Linear MCP OAuth Setup\n\nThe agent uses one MCP client connection:\n\n- URL: `https://mcp.linear.app/mcp`\n- Auth: Vercel Connect via `connect(process.env.LINEAR_CONNECT_UID ?? \"oauth/linear\")`\n- Default Connect UID: `oauth/linear`\n\nConfigure a Vercel Connect client for Linear and ensure the authenticated user has access to the workspace data the agent should read or update.\n\n## Slack Setup\n\nThe Slack channel uses Vercel Connect:\n\n- Default Connect UID: `slack/linear-operations-agent`\n- Trigger path: `/eve/v1/slack`\n- Configure `SLACK_CONNECT_UID` if you use a different Connect UID.\n\nSlack is not the final system of record. For operational work, the agent should create or update Linear after approval, then reply in Slack with the result.\n\n## Configuration\n\nUse `.env.example` as the configuration contract.\n\n`LINEAR_OPS_COVERED_TEAMS` and `LINEAR_OPS_COVERED_PROJECTS` are comma-separated allow-lists. Empty values mean all teams or all projects.\n\n`LINEAR_OPS_COVERED_INITIATIVES` is comma-separated and supports:\n\n```text\ninitiative-id-or-name|optional-slack-channel-id|optional-enabled-flag\n```\n\nExample:\n\n```text\nPayments Revamp|C0123ABC|true,Mobile Foundations||false\n```\n\nWeekly initiative updates are automatic only when the initiative is explicitly configured and `weeklyUpdateEnabled` is not `false`. If the Linear workspace does not have roadmaps or initiatives enabled, the schedule should publish a clear Slack error instead of a generic digest.\n\nProject-to-channel mappings use:\n\n```text\nLINEAR_OPS_PROJECT_CHANNELS=Payments Revamp:C0123ABC,Mobile:C0456DEF\n```\n\n## Approval Policy\n\nRead tools do not require approval. Non-destructive comments do not require approval. Initiative status updates do not require approval only when `type === \"initiative\"` and the initiative is explicitly configured.\n\nApproval is required for:\n\n- Creating issues.\n- Changing issue state, priority, assignee, delegate, project, cycle, duplicate, parent, blocker, or related relationships.\n- High-priority issue writes where priority is `1` or `2`.\n- Project writes.\n- Document writes.\n- Status update deletes.\n- Bulk or irreversible actions.\n\nThe approval predicate is synchronous and input-based. If deciding safely requires reading current Linear state, the agent must read with MCP first, then ask for approval before the sensitive write.\n\n## Commands\n\n```bash\npnpm install\npnpm info\npnpm build\n```\n\nDuring development, trigger a schedule with:\n\n```bash\ncurl -X POST http://localhost:3000/eve/v1/dev/schedules/daily-triage-digest\n```\n\nOther schedule ids are `cycle-health`, `weekly-backlog-hygiene`, `weekly-project-summary`, `weekly-initiative-updates`, and `p1-monitoring`.\n"
      },
      {
        "path": ".env.example",
        "type": "registry:file",
        "target": "~/.env.example",
        "content": "LINEAR_AGENT_ACCESS_TOKEN=\nLINEAR_WEBHOOK_SECRET=\nLINEAR_CONNECT_UID=oauth/linear\nSLACK_CONNECT_UID=slack/linear-operations-agent\n\nLINEAR_OPS_COVERED_TEAMS=\nLINEAR_OPS_COVERED_PROJECTS=\nLINEAR_OPS_COVERED_INITIATIVES=\nLINEAR_OPS_READ_ONLY_TEAMS=\nLINEAR_OPS_MAX_BULK_ISSUE_COUNT=10\nLINEAR_OPS_AUTO_INITIATIVE_UPDATES=true\n\nLINEAR_OPS_DEFAULT_SLACK_CHANNEL_ID=\nLINEAR_OPS_TRIAGE_SLACK_CHANNEL_ID=\nLINEAR_OPS_CYCLE_SLACK_CHANNEL_ID=\nLINEAR_OPS_BACKLOG_SLACK_CHANNEL_ID=\nLINEAR_OPS_P1_SLACK_CHANNEL_ID=\nLINEAR_OPS_PROJECT_CHANNELS=\n\nLINEAR_OPS_DAILY_TRIAGE_CRON=\"0 7 * * 1-5\"\nLINEAR_OPS_CYCLE_HEALTH_CRON=\"30 7 * * 1-5\"\nLINEAR_OPS_WEEKLY_BACKLOG_CRON=\"0 8 * * 1\"\nLINEAR_OPS_WEEKLY_PROJECT_CRON=\"30 8 * * 1\"\nLINEAR_OPS_WEEKLY_INITIATIVE_CRON=\"0 9 * * 1\"\nLINEAR_OPS_P1_MONITORING_CRON=\"0 13 * * 1-5\"\n"
      }
    ]
  },
  "resend-lifecycle-mailer": {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "resend-lifecycle-mailer",
    "type": "registry:item",
    "title": "Resend Lifecycle Mailer",
    "description": "Builds event-driven lifecycle emails, previews exact recipients and HTML, and only sends through Resend when dry-run mode is disabled.",
    "author": "TommyBez",
    "categories": [
      "support"
    ],
    "dependencies": [
      "eve@^0.11.4",
      "resend@^6.14.0",
      "zod@4.3.6"
    ],
    "meta": {
      "slug": "resend-lifecycle-mailer",
      "category": "support",
      "createdAt": "2026-06-20T00:00:00.000Z",
      "updatedAt": "2026-06-20T00:00:00.000Z"
    },
    "files": [
      {
        "path": "agent/agent.ts",
        "type": "registry:file",
        "target": "~/agent/agent.ts",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  model: \"openai/gpt-5.4-mini\",\n});\n"
      },
      {
        "path": "agent/instructions.md",
        "type": "registry:file",
        "target": "~/agent/instructions.md",
        "content": "# Mission\nDraft and optionally send lifecycle emails that are tied to clear product events.\n\n# Workflow\n1. Use send_lifecycle_email in dry-run mode to preview copy and recipients.\n2. Keep the subject concrete and the body tied to the user's actual state.\n3. Do not send unless a human has reviewed the exact recipients and copy.\n4. Report message IDs and failures when sending is enabled.\n\n# Output contract\nReturn the email preview, recipient count, and send status.\n"
      },
      {
        "path": "agent/tools/send_lifecycle_email.ts",
        "type": "registry:file",
        "target": "~/agent/tools/send_lifecycle_email.ts",
        "content": "import { Resend } from \"resend\";\nimport { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nexport default defineTool({\n  description: \"Preview or send a lifecycle email through Resend.\",\n  inputSchema: z.object({\n    from: z.string().email(),\n    to: z.array(z.string().email()).min(1).max(50),\n    subject: z.string().min(1),\n    html: z.string().min(1),\n    dryRun: z.boolean().default(true),\n  }),\n  async execute({ from, to, subject, html, dryRun }) {\n    const apiKey = process.env.RESEND_API_KEY;\n    if (!apiKey) {\n      return { authRequired: true, missingEnv: \"RESEND_API_KEY\", recipients: to.length };\n    }\n\n    if (dryRun) {\n      return { dryRun: true, from, to, subject, htmlPreview: html.slice(0, 500) };\n    }\n\n    const resend = new Resend(apiKey);\n    const result = await resend.emails.send({ from, to, subject, html });\n    return { result };\n  },\n});\n"
      },
      {
        "path": "README.md",
        "type": "registry:file",
        "target": "~/agent/README.md",
        "content": "# Resend Lifecycle Mailer\n\nBuilds event-driven lifecycle emails, previews exact recipients and HTML, and only sends through Resend when dry-run mode is disabled.\n\n## Development\n\n```bash\npnpm install\npnpm dev\n```\n\nRun `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.\n"
      },
      {
        "path": ".env.example",
        "type": "registry:file",
        "target": "~/.env.example",
        "content": "RESEND_API_KEY=\n"
      }
    ]
  }
} as const satisfies Record<string, RegistryItem>
