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
      "name": "linear-sprint-triage",
      "type": "registry:item",
      "title": "Linear Sprint Triage",
      "description": "Fetches Linear team issues, highlights unassigned or high-priority work, and separates delivery risk from simple backlog hygiene.",
      "author": "TommyBez",
      "categories": [
        "productivity"
      ],
      "dependencies": [
        "eve@^0.11.4",
        "@linear/sdk@^86.0.0",
        "zod@4.3.6"
      ],
      "meta": {
        "slug": "linear-sprint-triage",
        "category": "productivity",
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
          "path": "agent/tools/fetch_team_issues.ts",
          "type": "registry:file",
          "target": "~/agent/tools/fetch_team_issues.ts"
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
      "name": "postgres-data-analyst",
      "type": "registry:item",
      "title": "Postgres Data Analyst",
      "description": "A Slack-native Eve agent that inspects a configured Postgres database and answers analytics questions with bounded read-only SQL.",
      "author": "TommyBez",
      "categories": [
        "data"
      ],
      "dependencies": [
        "@vercel/connect@^0.2.6",
        "eve@^0.11.10",
        "pg@^8.21.0",
        "pgsql-ast-parser@^12.0.1",
        "zod@4.3.6"
      ],
      "meta": {
        "slug": "postgres-data-analyst",
        "category": "data",
        "createdAt": "2026-06-23T00:00:00.000Z",
        "updatedAt": "2026-06-23T00:00:00.000Z"
      },
      "files": [
        {
          "path": "agent/agent.ts",
          "type": "registry:file",
          "target": "~/agent/agent.ts"
        },
        {
          "path": "agent/channels/slack.ts",
          "type": "registry:file",
          "target": "~/agent/channels/slack.ts"
        },
        {
          "path": "agent/instructions.md",
          "type": "registry:file",
          "target": "~/agent/instructions.md"
        },
        {
          "path": "agent/lib/postgres.ts",
          "type": "registry:file",
          "target": "~/agent/lib/postgres.ts"
        },
        {
          "path": "agent/lib/sql-policy.ts",
          "type": "registry:file",
          "target": "~/agent/lib/sql-policy.ts"
        },
        {
          "path": "agent/tools/describe_schema.ts",
          "type": "registry:file",
          "target": "~/agent/tools/describe_schema.ts"
        },
        {
          "path": "agent/tools/run_sql.ts",
          "type": "registry:file",
          "target": "~/agent/tools/run_sql.ts"
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
  "linear-sprint-triage": {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "linear-sprint-triage",
    "type": "registry:item",
    "title": "Linear Sprint Triage",
    "description": "Fetches Linear team issues, highlights unassigned or high-priority work, and separates delivery risk from simple backlog hygiene.",
    "author": "TommyBez",
    "categories": [
      "productivity"
    ],
    "dependencies": [
      "eve@^0.11.4",
      "@linear/sdk@^86.0.0",
      "zod@4.3.6"
    ],
    "meta": {
      "slug": "linear-sprint-triage",
      "category": "productivity",
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
        "content": "# Mission\nInspect Linear issues and turn sprint risk into a focused engineering triage.\n\n# Workflow\n1. Use fetch_team_issues to pull active work for a Linear team.\n2. Highlight blocked, overdue, unassigned, and high-priority issues.\n3. Separate delivery risk from scope ambiguity.\n4. Recommend which issues need owner clarification or scope cuts.\n\n# Output contract\nReturn sprint risks, owner gaps, and a short standup-ready update.\n"
      },
      {
        "path": "agent/tools/fetch_team_issues.ts",
        "type": "registry:file",
        "target": "~/agent/tools/fetch_team_issues.ts",
        "content": "import { LinearClient } from \"@linear/sdk\";\nimport { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nexport default defineTool({\n  description: \"Fetch Linear issues for a team and identify delivery-risk signals.\",\n  inputSchema: z.object({\n    teamKey: z.string().min(1),\n    limit: z.number().int().min(1).max(100).default(40),\n  }),\n  async execute({ teamKey, limit }) {\n    const apiKey = process.env.LINEAR_API_KEY;\n    if (!apiKey) {\n      return { authRequired: true, missingEnv: \"LINEAR_API_KEY\", teamKey };\n    }\n\n    const linear = new LinearClient({ apiKey });\n    const issues = await linear.issues({\n      first: limit,\n      filter: { team: { key: { eq: teamKey } } },\n    });\n\n    const nodes = await Promise.all(\n      issues.nodes.map(async (issue) => {\n        const [assignee, state] = await Promise.all([\n          issue.assignee,\n          issue.state,\n        ]);\n\n        return {\n          identifier: issue.identifier,\n          title: issue.title,\n          priority: issue.priority,\n          estimate: issue.estimate,\n          assignee: assignee ? assignee.name : null,\n          state: state ? state.name : null,\n          url: issue.url,\n        };\n      }),\n    );\n\n    return {\n      teamKey,\n      issueCount: nodes.length,\n      unassigned: nodes.filter((issue) => !issue.assignee),\n      highPriority: nodes.filter(\n        (issue) => issue.priority > 0 && issue.priority <= 2,\n      ),\n      issues: nodes,\n    };\n  },\n});\n"
      },
      {
        "path": "README.md",
        "type": "registry:file",
        "target": "~/agent/README.md",
        "content": "# Linear Sprint Triage\n\nFetches Linear team issues, highlights unassigned or high-priority work, and separates delivery risk from simple backlog hygiene.\n\n## Development\n\n```bash\npnpm install\npnpm dev\n```\n\nRun `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.\n"
      },
      {
        "path": ".env.example",
        "type": "registry:file",
        "target": "~/.env.example",
        "content": "LINEAR_API_KEY=\n"
      }
    ]
  },
  "postgres-data-analyst": {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "postgres-data-analyst",
    "type": "registry:item",
    "title": "Postgres Data Analyst",
    "description": "A Slack-native Eve agent that inspects a configured Postgres database and answers analytics questions with bounded read-only SQL.",
    "author": "TommyBez",
    "categories": [
      "data"
    ],
    "dependencies": [
      "@vercel/connect@^0.2.6",
      "eve@^0.11.10",
      "pg@^8.21.0",
      "pgsql-ast-parser@^12.0.1",
      "zod@4.3.6"
    ],
    "meta": {
      "slug": "postgres-data-analyst",
      "category": "data",
      "createdAt": "2026-06-23T00:00:00.000Z",
      "updatedAt": "2026-06-23T00:00:00.000Z"
    },
    "files": [
      {
        "path": "agent/agent.ts",
        "type": "registry:file",
        "target": "~/agent/agent.ts",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  model: \"zai/glm-5.2\",\n});\n"
      },
      {
        "path": "agent/channels/slack.ts",
        "type": "registry:file",
        "target": "~/agent/channels/slack.ts",
        "content": "import { connectSlackCredentials } from \"@vercel/connect/eve\";\nimport { slackChannel } from \"eve/channels/slack\";\n\nconst SLACK_CONNECT_UID =\n  process.env.DATA_ANALYST_SLACK_CONNECT_UID || \"slack/postgres-data-analyst\";\n\nexport default slackChannel({\n  credentials: connectSlackCredentials(SLACK_CONNECT_UID),\n});\n"
      },
      {
        "path": "agent/instructions.md",
        "type": "registry:file",
        "target": "~/agent/instructions.md",
        "content": "# Mission\nYou are a careful Postgres data analyst in Slack. You help people understand a\nsingle configured Postgres database through schema inspection and read-only\nanalytical SQL.\n\n# Operating rules\n- Treat the database as read-only. Never claim write access and never attempt to\n  mutate data.\n- Inspect schema metadata before querying unfamiliar tables.\n- Ask a clarifying question when the metric definition, time range, table\n  choice, or grain is ambiguous.\n- Prefer aggregate answers and concise explanations over raw row dumps.\n- Explain assumptions, filters, units, date windows, and caveats in the final\n  answer.\n- Return only the rows needed to answer the question. Do not expose credentials,\n  hidden configuration, or unnecessary sensitive row-level data.\n- If a query is rejected by policy, revise it into a simpler read-only SELECT\n  query over allowed schemas and tables.\n\n# Workflow\n1. Use describe_schema when you need table or column context.\n2. Write one read-only SQL query that answers the question directly.\n3. Use run_sql to execute the query.\n4. Interpret the result in plain language for Slack.\n5. If the result is incomplete or truncated, say so and narrow the question\n   before issuing broader SQL.\n"
      },
      {
        "path": "agent/lib/postgres.ts",
        "type": "registry:file",
        "target": "~/agent/lib/postgres.ts",
        "content": "import pg from \"pg\";\n\nconst DEFAULT_ALLOWED_SCHEMAS = \"public\";\nconst DEFAULT_MAX_ROWS = 200;\nconst DEFAULT_STATEMENT_TIMEOUT_MS = 10_000;\nconst MIN_MAX_ROWS = 1;\nconst MAX_MAX_ROWS = 1_000;\nconst MIN_TIMEOUT_MS = 1_000;\nconst MAX_TIMEOUT_MS = 60_000;\nconst IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;\n\nexport type DataAnalystConfig = {\n  allowedSchemas: readonly string[];\n  blockedTables: ReadonlySet<string>;\n  databaseUrl: string | null;\n  maxRows: number;\n  statementTimeoutMs: number;\n};\n\nlet pool: pg.Pool | null = null;\nlet poolDatabaseUrl: string | null = null;\n\nexport function getDataAnalystConfig(): DataAnalystConfig {\n  const allowedSchemas = parseIdentifierList(\n    process.env.DATA_ANALYST_ALLOWED_SCHEMAS || DEFAULT_ALLOWED_SCHEMAS,\n    \"DATA_ANALYST_ALLOWED_SCHEMAS\",\n  );\n\n  return {\n    allowedSchemas,\n    blockedTables: new Set(\n      parseTableList(process.env.DATA_ANALYST_BLOCKED_TABLES || \"\"),\n    ),\n    databaseUrl: process.env.DATA_ANALYST_DATABASE_URL?.trim() || null,\n    maxRows: readIntegerEnv(\n      \"DATA_ANALYST_MAX_ROWS\",\n      DEFAULT_MAX_ROWS,\n      MIN_MAX_ROWS,\n      MAX_MAX_ROWS,\n    ),\n    statementTimeoutMs: readIntegerEnv(\n      \"DATA_ANALYST_STATEMENT_TIMEOUT_MS\",\n      DEFAULT_STATEMENT_TIMEOUT_MS,\n      MIN_TIMEOUT_MS,\n      MAX_TIMEOUT_MS,\n    ),\n  };\n}\n\nexport function getRequiredDatabaseUrl(config: DataAnalystConfig): string {\n  if (!config.databaseUrl) {\n    throw new Error(\n      \"DATA_ANALYST_DATABASE_URL is required. Set it to a read-only Postgres connection string.\",\n    );\n  }\n\n  return config.databaseUrl;\n}\n\nexport function getPool(config: DataAnalystConfig): pg.Pool {\n  const databaseUrl = getRequiredDatabaseUrl(config);\n  if (pool && poolDatabaseUrl === databaseUrl) {\n    return pool;\n  }\n\n  pool = new pg.Pool({\n    application_name: \"postgres-data-analyst\",\n    connectionString: databaseUrl,\n    max: 3,\n  });\n  poolDatabaseUrl = databaseUrl;\n  return pool;\n}\n\nexport function quoteIdentifier(identifier: string): string {\n  if (!IDENTIFIER_PATTERN.test(identifier)) {\n    throw new Error(`Invalid Postgres identifier: ${identifier}`);\n  }\n\n  return `\"${identifier.replaceAll('\"', '\"\"')}\"`;\n}\n\nfunction parseIdentifierList(value: string, envName: string): readonly string[] {\n  const identifiers = value\n    .split(\",\")\n    .map((part) => part.trim())\n    .filter((part) => part.length > 0);\n\n  if (identifiers.length === 0) {\n    throw new Error(`${envName} must include at least one schema.`);\n  }\n\n  for (const identifier of identifiers) {\n    if (!IDENTIFIER_PATTERN.test(identifier)) {\n      throw new Error(`${envName} contains invalid identifier \"${identifier}\".`);\n    }\n  }\n\n  return identifiers;\n}\n\nfunction parseTableList(value: string): readonly string[] {\n  return value\n    .split(\",\")\n    .map((part) => part.trim())\n    .filter((part) => part.length > 0)\n    .map((entry) => {\n      const pieces = entry.split(\".\");\n      if (pieces.length > 2) {\n        throw new Error(`Invalid DATA_ANALYST_BLOCKED_TABLES entry \"${entry}\".`);\n      }\n\n      for (const piece of pieces) {\n        if (!IDENTIFIER_PATTERN.test(piece)) {\n          throw new Error(\n            `DATA_ANALYST_BLOCKED_TABLES contains invalid identifier \"${entry}\".`,\n          );\n        }\n      }\n\n      return entry.toLowerCase();\n    });\n}\n\nfunction readIntegerEnv(\n  envName: string,\n  defaultValue: number,\n  min: number,\n  max: number,\n): number {\n  const raw = process.env[envName]?.trim();\n  if (!raw) {\n    return defaultValue;\n  }\n\n  const value = Number.parseInt(raw, 10);\n  if (!Number.isInteger(value) || value < min || value > max) {\n    throw new Error(`${envName} must be an integer from ${min} to ${max}.`);\n  }\n\n  return value;\n}\n"
      },
      {
        "path": "agent/lib/sql-policy.ts",
        "type": "registry:file",
        "target": "~/agent/lib/sql-policy.ts",
        "content": "import { parse, type Statement } from \"pgsql-ast-parser\";\nimport type { DataAnalystConfig } from \"./postgres\";\n\nconst ALLOWED_STATEMENT_TYPES = new Set([\n  \"select\",\n  \"union\",\n  \"union all\",\n  \"with\",\n  \"with recursive\",\n]);\n\nconst DISALLOWED_STATEMENT_TYPES = new Set([\n  \"alter index\",\n  \"alter sequence\",\n  \"alter table\",\n  \"begin\",\n  \"comment\",\n  \"commit\",\n  \"create composite type\",\n  \"create enum\",\n  \"create extension\",\n  \"create function\",\n  \"create index\",\n  \"create materialized view\",\n  \"create schema\",\n  \"create sequence\",\n  \"create table\",\n  \"create view\",\n  \"deallocate\",\n  \"delete\",\n  \"do\",\n  \"drop function\",\n  \"drop index\",\n  \"drop sequence\",\n  \"drop table\",\n  \"drop trigger\",\n  \"drop type\",\n  \"insert\",\n  \"prepare\",\n  \"raise\",\n  \"refresh materialized view\",\n  \"rollback\",\n  \"set\",\n  \"set names\",\n  \"set timezone\",\n  \"show\",\n  \"start transaction\",\n  \"tablespace\",\n  \"truncate table\",\n  \"update\",\n  \"values\",\n]);\n\ntype TableReference = {\n  name: string;\n  schema: string | null;\n};\n\nexport type ValidatedSql = {\n  tables: readonly TableReference[];\n};\n\nexport function validateReadOnlySql(\n  sql: string,\n  config: DataAnalystConfig,\n): ValidatedSql {\n  const trimmedSql = trimSql(sql);\n  let statements: Statement[];\n\n  try {\n    statements = parse(trimmedSql);\n  } catch (error) {\n    throw new Error(\n      `SQL could not be parsed. Use a single read-only SELECT query with standard Postgres syntax. ${formatUnknownError(error)}`,\n    );\n  }\n\n  if (statements.length !== 1) {\n    throw new Error(\"Only one SQL statement is allowed.\");\n  }\n\n  const [statement] = statements;\n  if (!statement) {\n    throw new Error(\"SQL query is empty.\");\n  }\n\n  assertReadOnlyStatementTree(statement);\n\n  const tables = collectPolicyTableReferences(statement);\n  assertTablePolicy(tables, config);\n  return { tables };\n}\n\nexport function trimSql(sql: string): string {\n  return sql.trim().replace(/;+$/u, \"\").trim();\n}\n\nfunction assertReadOnlyStatementTree(statement: Statement): void {\n  const statementType = statement.type;\n  if (!ALLOWED_STATEMENT_TYPES.has(statementType)) {\n    throw new Error(`Only SELECT and WITH queries are allowed. Received ${statementType}.`);\n  }\n\n  walkAst(statement, (node) => {\n    const type = readNodeType(node);\n    if (type && DISALLOWED_STATEMENT_TYPES.has(type)) {\n      throw new Error(`SQL statement type \"${type}\" is not allowed.`);\n    }\n  });\n}\n\nfunction collectPolicyTableReferences(statement: Statement): readonly TableReference[] {\n  const tables: TableReference[] = [];\n  collectPolicyTableReferencesFromNode(statement, tables, new Set());\n  return tables;\n}\n\nfunction collectPolicyTableReferencesFromNode(\n  value: unknown,\n  tables: TableReference[],\n  cteAliases: ReadonlySet<string>,\n): void {\n  if (Array.isArray(value)) {\n    for (const item of value) {\n      collectPolicyTableReferencesFromNode(item, tables, cteAliases);\n    }\n    return;\n  }\n\n  if (!value || typeof value !== \"object\") {\n    return;\n  }\n\n  const node = value as Record<string, unknown>;\n  const type = readNodeType(node);\n  if (type === \"with\") {\n    collectWithTableReferences(node, tables, cteAliases);\n    return;\n  }\n\n  if (type === \"with recursive\") {\n    collectWithRecursiveTableReferences(node, tables, cteAliases);\n    return;\n  }\n\n  if (type === \"table\") {\n    const table = readTableReference(node);\n    if (table && !isCteReference(table, cteAliases)) {\n      tables.push(table);\n    }\n  }\n\n  for (const child of Object.values(node)) {\n    collectPolicyTableReferencesFromNode(child, tables, cteAliases);\n  }\n}\n\nfunction collectWithTableReferences(\n  node: Record<string, unknown>,\n  tables: TableReference[],\n  parentCteAliases: ReadonlySet<string>,\n): void {\n  const ownAliases = collectBindingAliases(readArrayProperty(node, \"bind\"));\n  for (const binding of readArrayProperty(node, \"bind\")) {\n    const statement = readObjectProperty(binding, \"statement\");\n    collectPolicyTableReferencesFromNode(statement, tables, parentCteAliases);\n  }\n\n  collectPolicyTableReferencesFromNode(\n    readObjectProperty(node, \"in\"),\n    tables,\n    mergeSets(parentCteAliases, ownAliases),\n  );\n}\n\nfunction collectWithRecursiveTableReferences(\n  node: Record<string, unknown>,\n  tables: TableReference[],\n  parentCteAliases: ReadonlySet<string>,\n): void {\n  const alias = readNameProperty(node, \"alias\");\n  const aliases = alias\n    ? mergeSets(parentCteAliases, new Set([alias.toLowerCase()]))\n    : parentCteAliases;\n\n  collectPolicyTableReferencesFromNode(\n    readObjectProperty(node, \"statement\"),\n    tables,\n    aliases,\n  );\n  collectPolicyTableReferencesFromNode(readObjectProperty(node, \"in\"), tables, aliases);\n}\n\nfunction collectBindingAliases(bindings: readonly unknown[]): ReadonlySet<string> {\n  const aliases = new Set<string>();\n  for (const binding of bindings) {\n    const alias = readNameProperty(binding, \"alias\");\n    if (alias) {\n      aliases.add(alias.toLowerCase());\n    }\n  }\n\n  return aliases;\n}\n\nfunction readTableReference(node: Record<string, unknown>): TableReference | null {\n  const tableName = readObjectProperty(node, \"name\");\n  const name = readStringProperty(tableName, \"name\");\n  if (!name) {\n    return null;\n  }\n\n  return {\n    name,\n    schema: readStringProperty(tableName, \"schema\"),\n  };\n}\n\nfunction isCteReference(\n  table: TableReference,\n  cteAliases: ReadonlySet<string>,\n): boolean {\n  return table.schema === null && cteAliases.has(table.name.toLowerCase());\n}\n\nfunction mergeSets(\n  first: ReadonlySet<string>,\n  second: ReadonlySet<string>,\n): ReadonlySet<string> {\n  return new Set([...first, ...second]);\n}\n\nfunction assertTablePolicy(\n  tables: readonly TableReference[],\n  config: DataAnalystConfig,\n): void {\n  const allowedSchemas = new Set(\n    config.allowedSchemas.map((schema) => schema.toLowerCase()),\n  );\n\n  for (const table of tables) {\n    const schema = table.schema?.toLowerCase() ?? null;\n    const name = table.name.toLowerCase();\n\n    if (schema && !allowedSchemas.has(schema)) {\n      throw new Error(`Schema \"${table.schema}\" is not allowed.`);\n    }\n\n    if (!schema && name.startsWith(\"pg_\")) {\n      throw new Error(`Unqualified Postgres catalog table \"${table.name}\" is not allowed.`);\n    }\n\n    const qualifiedName = schema ? `${schema}.${name}` : name;\n    if (config.blockedTables.has(name) || config.blockedTables.has(qualifiedName)) {\n      throw new Error(`Table \"${qualifiedName}\" is blocked for this agent.`);\n    }\n  }\n}\n\nfunction walkAst(value: unknown, visit: (node: Record<string, unknown>) => void): void {\n  if (Array.isArray(value)) {\n    for (const item of value) {\n      walkAst(item, visit);\n    }\n    return;\n  }\n\n  if (!value || typeof value !== \"object\") {\n    return;\n  }\n\n  const node = value as Record<string, unknown>;\n  visit(node);\n\n  for (const child of Object.values(node)) {\n    walkAst(child, visit);\n  }\n}\n\nfunction readNodeType(node: Record<string, unknown>): string | null {\n  return readStringProperty(node, \"type\");\n}\n\nfunction readArrayProperty(\n  node: Record<string, unknown>,\n  property: string,\n): readonly unknown[] {\n  const value = node[property];\n  return Array.isArray(value) ? value : [];\n}\n\nfunction readNameProperty(\n  node: unknown,\n  property: string,\n): string | null {\n  const value = readObjectProperty(node, property);\n  return readStringProperty(value, \"name\");\n}\n\nfunction readObjectProperty(\n  node: unknown,\n  property: string,\n): Record<string, unknown> | null {\n  if (!node || typeof node !== \"object\") {\n    return null;\n  }\n\n  const value = (node as Record<string, unknown>)[property];\n  if (!value || typeof value !== \"object\" || Array.isArray(value)) {\n    return null;\n  }\n\n  return value as Record<string, unknown>;\n}\n\nfunction readStringProperty(\n  node: Record<string, unknown> | null,\n  property: string,\n): string | null {\n  const value = node?.[property];\n  return typeof value === \"string\" && value.length > 0 ? value : null;\n}\n\nfunction formatUnknownError(error: unknown): string {\n  if (error instanceof Error && error.message) {\n    return error.message;\n  }\n\n  return \"Unknown parser error.\";\n}\n"
      },
      {
        "path": "agent/tools/describe_schema.ts",
        "type": "registry:file",
        "target": "~/agent/tools/describe_schema.ts",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\nimport { getDataAnalystConfig, getPool } from \"../lib/postgres\";\n\nconst SCHEMA_COLUMN_LIMIT = 1_000;\n\ntype TableKind =\n  | \"foreign_table\"\n  | \"materialized_view\"\n  | \"partitioned_table\"\n  | \"table\"\n  | \"unknown\"\n  | \"view\";\n\ntype SchemaColumn = {\n  column: string;\n  dataType: string;\n  nullable: boolean;\n  ordinalPosition: number;\n  primaryKey: boolean;\n};\n\ntype SchemaTable = {\n  columns: SchemaColumn[];\n  kind: TableKind;\n  schema: string;\n  table: string;\n};\n\ntype DescribeSchemaOutput =\n  | {\n      ok: true;\n      tables: SchemaTable[];\n      truncated: boolean;\n    }\n  | {\n      error: string;\n      missingEnv?: string;\n      ok: false;\n    };\n\nconst BLOCKED_TABLE_CONDITION = `\n  not exists (\n    select 1\n    from unnest($3::text[]) blocked_table(name)\n    where lower(c.table_name) = blocked_table.name\n      or lower(c.table_schema || '.' || c.table_name) = blocked_table.name\n  )\n`;\n\nexport default defineTool({\n  description:\n    \"Describe allowed Postgres schemas, tables, columns, types, nullability, and primary-key columns.\",\n  inputSchema: z.object({\n    schema: z.string().min(1).optional(),\n    table: z.string().min(1).optional(),\n  }),\n  async execute({ schema, table }): Promise<DescribeSchemaOutput> {\n    try {\n      const config = getDataAnalystConfig();\n      if (!config.databaseUrl) {\n        return {\n          ok: false,\n          error:\n            \"DATA_ANALYST_DATABASE_URL is required. Set it to a read-only Postgres connection string.\",\n          missingEnv: \"DATA_ANALYST_DATABASE_URL\",\n        };\n      }\n\n      if (schema && !config.allowedSchemas.includes(schema)) {\n        return { ok: true, tables: [], truncated: false };\n      }\n\n      const pool = getPool(config);\n      const schemas = schema ? [schema] : config.allowedSchemas;\n      const result = await pool.query(\n        `\n          select\n            c.table_schema,\n            c.table_name,\n            c.column_name,\n            c.ordinal_position,\n            c.data_type,\n            c.udt_name,\n            c.is_nullable,\n            case cls.relkind\n              when 'r' then 'table'\n              when 'p' then 'partitioned_table'\n              when 'v' then 'view'\n              when 'm' then 'materialized_view'\n              when 'f' then 'foreign_table'\n              else 'unknown'\n            end as relation_kind,\n            tc.constraint_type = 'PRIMARY KEY' as is_primary_key\n          from information_schema.columns c\n          join pg_catalog.pg_namespace n\n            on n.nspname = c.table_schema\n          join pg_catalog.pg_class cls\n            on cls.relnamespace = n.oid\n            and cls.relname = c.table_name\n            and cls.relkind in ('r', 'p', 'v', 'm', 'f')\n          left join information_schema.key_column_usage kcu\n            on kcu.table_schema = c.table_schema\n            and kcu.table_name = c.table_name\n            and kcu.column_name = c.column_name\n          left join information_schema.table_constraints tc\n            on tc.constraint_schema = kcu.constraint_schema\n            and tc.constraint_name = kcu.constraint_name\n            and tc.table_schema = c.table_schema\n            and tc.table_name = c.table_name\n            and tc.constraint_type = 'PRIMARY KEY'\n          where c.table_schema = any($1)\n            and ($2::text is null or c.table_name = $2)\n            and ${BLOCKED_TABLE_CONDITION}\n          order by c.table_schema, c.table_name, c.ordinal_position\n          limit ${SCHEMA_COLUMN_LIMIT + 1}\n        `,\n        [schemas, table ?? null, [...config.blockedTables]],\n      );\n\n      const filteredRows = result.rows.filter(\n        (row) =>\n          !isBlockedTable(\n            String(row.table_schema),\n            String(row.table_name),\n            config.blockedTables,\n          ),\n      );\n\n      return {\n        ok: true,\n        tables: groupColumns(filteredRows),\n        truncated: filteredRows.length > SCHEMA_COLUMN_LIMIT,\n      };\n    } catch (error) {\n      return { ok: false, error: formatUnknownError(error) };\n    }\n  },\n  toModelOutput(output) {\n    if (!output.ok) {\n      return { type: \"json\", value: output };\n    }\n\n    return {\n      type: \"json\",\n      value: {\n        ok: true,\n        tableCount: output.tables.length,\n        tables: output.tables,\n        truncated: output.truncated,\n      },\n    };\n  },\n});\n\nfunction groupColumns(rows: readonly Record<string, unknown>[]): SchemaTable[] {\n  const tables = new Map<string, SchemaTable>();\n\n  for (const row of rows.slice(0, SCHEMA_COLUMN_LIMIT)) {\n    const schema = String(row.table_schema);\n    const table = String(row.table_name);\n    const key = `${schema}.${table}`;\n    const existing = tables.get(key) ?? {\n      schema,\n      table,\n      columns: [],\n      kind: readRelationKind(row.relation_kind),\n    };\n\n    existing.columns.push({\n      column: String(row.column_name),\n      dataType: String(row.data_type ?? row.udt_name),\n      nullable: row.is_nullable === \"YES\",\n      ordinalPosition: Number(row.ordinal_position),\n      primaryKey: row.is_primary_key === true,\n    });\n    tables.set(key, existing);\n  }\n\n  return [...tables.values()];\n}\n\nfunction readRelationKind(value: unknown): TableKind {\n  if (\n    value === \"foreign_table\" ||\n    value === \"materialized_view\" ||\n    value === \"partitioned_table\" ||\n    value === \"table\" ||\n    value === \"view\"\n  ) {\n    return value;\n  }\n\n  return \"unknown\";\n}\n\nfunction isBlockedTable(\n  schema: string,\n  table: string,\n  blockedTables: ReadonlySet<string>,\n): boolean {\n  const tableName = table.toLowerCase();\n  const qualifiedName = `${schema.toLowerCase()}.${tableName}`;\n  return blockedTables.has(tableName) || blockedTables.has(qualifiedName);\n}\n\nfunction formatUnknownError(error: unknown): string {\n  if (error instanceof Error && error.message) {\n    return error.message;\n  }\n\n  return \"Unknown schema inspection error.\";\n}\n"
      },
      {
        "path": "agent/tools/run_sql.ts",
        "type": "registry:file",
        "target": "~/agent/tools/run_sql.ts",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\nimport {\n  getDataAnalystConfig,\n  getPool,\n  quoteIdentifier,\n} from \"../lib/postgres\";\nimport { trimSql, validateReadOnlySql } from \"../lib/sql-policy\";\n\ntype QueryColumn = {\n  dataTypeId: number;\n  name: string;\n};\n\ntype RunSqlOutput =\n  | {\n      columns: QueryColumn[];\n      durationMs: number;\n      ok: true;\n      rowCount: number;\n      rows: Record<string, unknown>[];\n      truncated: boolean;\n    }\n  | {\n      error: string;\n      missingEnv?: string;\n      ok: false;\n    };\n\nexport default defineTool({\n  description:\n    \"Run one bounded read-only Postgres SELECT or WITH query against the configured analytics database.\",\n  inputSchema: z.object({\n    sql: z.string().min(1).describe(\"A single read-only SELECT or WITH query.\"),\n  }),\n  async execute({ sql }): Promise<RunSqlOutput> {\n    const startedAt = Date.now();\n\n    try {\n      const config = getDataAnalystConfig();\n      if (!config.databaseUrl) {\n        return {\n          ok: false,\n          error:\n            \"DATA_ANALYST_DATABASE_URL is required. Set it to a read-only Postgres connection string.\",\n          missingEnv: \"DATA_ANALYST_DATABASE_URL\",\n        };\n      }\n\n      validateReadOnlySql(sql, config);\n\n      const pool = getPool(config);\n      const client = await pool.connect();\n      try {\n        await client.query(\"BEGIN\");\n        await client.query(\"SET TRANSACTION READ ONLY\");\n        await client.query(`SET LOCAL statement_timeout = ${config.statementTimeoutMs}`);\n        await client.query(\n          `SET LOCAL search_path TO ${config.allowedSchemas.map(quoteIdentifier).join(\", \")}`,\n        );\n\n        const result = await client.query(\n          `select * from (\\n${trimSql(sql)}\\n) as data_analyst_result limit ${config.maxRows + 1}`,\n        );\n        await client.query(\"COMMIT\");\n\n        const rows = result.rows.slice(0, config.maxRows);\n        return {\n          ok: true,\n          columns: result.fields.map((field) => ({\n            dataTypeId: field.dataTypeID,\n            name: field.name,\n          })),\n          durationMs: Date.now() - startedAt,\n          rowCount: rows.length,\n          rows,\n          truncated: result.rows.length > config.maxRows,\n        };\n      } catch (error) {\n        await client.query(\"ROLLBACK\").catch(() => undefined);\n        throw error;\n      } finally {\n        client.release();\n      }\n    } catch (error) {\n      return { ok: false, error: formatUnknownError(error) };\n    }\n  },\n  toModelOutput(output) {\n    if (!output.ok) {\n      return { type: \"json\", value: output };\n    }\n\n    return {\n      type: \"json\",\n      value: {\n        ok: true,\n        columns: output.columns.map((column) => column.name),\n        durationMs: output.durationMs,\n        rowCount: output.rowCount,\n        rows: output.rows,\n        truncated: output.truncated,\n      },\n    };\n  },\n});\n\nfunction formatUnknownError(error: unknown): string {\n  if (error instanceof Error && error.message) {\n    return error.message;\n  }\n\n  return \"Unknown SQL execution error.\";\n}\n"
      },
      {
        "path": "README.md",
        "type": "registry:file",
        "target": "~/agent/README.md",
        "content": "# Postgres Data Analyst\n\nAn Eve-native Slack analyst for a single Postgres database. It answers Slack\nmentions and DMs, inspects schema metadata, and runs bounded read-only SQL\nthrough authored tools.\n\n## Install\n\nInstall this registry item into an existing Eve app:\n\n```bash\nnpx shadcn@latest add @evex/postgres-data-analyst\n```\n\nThen install the public runtime dependencies listed by the registry item.\n\n## Start using it in Slack\n\nThis agent uses Eve's documented Slack channel path through Vercel Connect. Do\nnot create or manage `SLACK_BOT_TOKEN` or `SLACK_SIGNING_SECRET` variables.\n\nBefore connecting Slack, make sure the Eve app that installed this registry item\nis deployed on Vercel or otherwise reachable through HTTPS. Slack events must be\nable to reach the Eve Slack route:\n\n```text\n/eve/v1/slack\n```\n\nCreate the Slack Connect client from the Vercel project used by the Eve app:\n\n```bash\nnpm install -g vercel@latest\nvercel connect create slack --triggers\n```\n\nThis command is the Slack installation step. It creates the Vercel Connect\nconnector and opens the Slack authorization flow. Choose the Slack workspace\nwhere the agent should live and approve the app installation there. If the CLI\nprints an authorization URL instead of opening a browser, open that URL and\ncomplete the Slack install.\n\nAfter authorization succeeds, copy the UID printed by the command. Then attach\nthat Slack client to Eve's Slack route:\n\n```bash\nvercel connect detach <uid> --yes\nvercel connect attach <uid> --triggers --trigger-path /eve/v1/slack --yes\n```\n\nSet the same UID in the Eve app environment and redeploy the app:\n\n```env\nDATA_ANALYST_SLACK_CONNECT_UID=<uid>\n```\n\nThe default UID used by the agent is `slack/postgres-data-analyst`.\n\nAfter the app is deployed:\n\n1. Open the same Slack workspace that you authorized during\n   `vercel connect create slack --triggers`.\n2. Find the Slack app that was installed during that authorization flow.\n3. Add the app to every channel where it should answer.\n4. In a channel, mention the app and ask a database question.\n5. In a DM, message the app directly.\n\nIf you cannot find the app in Slack, the Slack authorization step was not\ncompleted for that workspace. Run `vercel connect create slack --triggers`\nagain from the Vercel project, authorize the correct workspace, attach the new\nUID to `/eve/v1/slack`, update `DATA_ANALYST_SLACK_CONNECT_UID`, and redeploy.\n\nGood first prompts:\n\n```text\nWhat schemas and tables can you see?\n```\n\n```text\nShow total signups by month for the last 6 months.\n```\n\nIf the agent does not answer, verify:\n\n- `eve info --json` lists a Slack channel with `urlPath: \"/eve/v1/slack\"`;\n- `DATA_ANALYST_SLACK_CONNECT_UID` exactly matches the Vercel Connect UID;\n- the Connect trigger is attached with `--trigger-path /eve/v1/slack`;\n- the app was redeployed after setting env vars;\n- `DATA_ANALYST_DATABASE_URL` points to a working read-only Postgres role.\n\n## Database setup\n\nCreate a read-only Postgres role and use it for `DATA_ANALYST_DATABASE_URL`.\nThe role must not have write privileges. SQL validation in the agent is defense\nin depth; the database role is the enforcement boundary.\n\n```sql\ncreate role data_analyst_reader login password 'replace-me';\ngrant usage on schema public to data_analyst_reader;\ngrant select on all tables in schema public to data_analyst_reader;\nalter default privileges in schema public\n  grant select on tables to data_analyst_reader;\n```\n\nSet the runtime environment:\n\n```env\nDATA_ANALYST_DATABASE_URL=postgres://data_analyst_reader:replace-me@host/db\nDATA_ANALYST_ALLOWED_SCHEMAS=public\nDATA_ANALYST_BLOCKED_TABLES=\nDATA_ANALYST_MAX_ROWS=200\nDATA_ANALYST_STATEMENT_TIMEOUT_MS=10000\nDATA_ANALYST_SLACK_CONNECT_UID=slack/postgres-data-analyst\n```\n\n`DATA_ANALYST_BLOCKED_TABLES` accepts comma-separated table names such as\n`users,public.accounts`.\n\n## Neon\n\nUse a read-only role on the target branch, or point the agent at a reporting\nbranch/replica. Keep `DATA_ANALYST_ALLOWED_SCHEMAS` limited to the reporting\nschemas the Slack audience is allowed to inspect.\n\n## Supabase\n\nUse a dedicated read-only Postgres role instead of the service role. Grant\n`SELECT` only on the schemas/tables the agent should analyze, then use that\nconnection string as `DATA_ANALYST_DATABASE_URL`.\n\n## Runtime contract\n\nRead-only access can still expose sensitive data. Do not grant this agent\naccess to PII tables unless the Slack workspace and channel audience are allowed\nto see that data.\n"
      },
      {
        "path": ".env.example",
        "type": "registry:file",
        "target": "~/.env.example",
        "content": "DATA_ANALYST_DATABASE_URL=\nDATA_ANALYST_ALLOWED_SCHEMAS=public\nDATA_ANALYST_BLOCKED_TABLES=\nDATA_ANALYST_MAX_ROWS=200\nDATA_ANALYST_STATEMENT_TIMEOUT_MS=10000\nDATA_ANALYST_SLACK_CONNECT_UID=slack/postgres-data-analyst\n"
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
