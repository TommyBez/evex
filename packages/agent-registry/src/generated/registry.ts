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
        "ai@7.0.0-beta.178",
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
    },
    {
      "name": "x-draft-assistant",
      "type": "registry:item",
      "title": "X Draft Assistant",
      "description": "A scheduled Eve agent that scans a configured set of X (Twitter) profiles every day, surfaces hot topics from their recent posts, researches each topic with the Parallel web search API, and creates three draft candidates for X in Typefully so a human can review and publish them.",
      "categories": [
        "research"
      ],
      "dependencies": [
        "eve@^0.15.1",
        "parallel-web@^1.1.0",
        "zod@4.3.6"
      ],
      "meta": {
        "slug": "x-draft-assistant",
        "category": "research",
        "createdAt": "2026-06-26T15:22:15.793Z",
        "updatedAt": "2026-06-26T15:40:00.000Z"
      },
      "author": "TommyBez",
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
          "path": "agent/lib/hot-topic-config.ts",
          "type": "registry:file",
          "target": "~/agent/lib/hot-topic-config.ts"
        },
        {
          "path": "agent/lib/typefully-client.ts",
          "type": "registry:file",
          "target": "~/agent/lib/typefully-client.ts"
        },
        {
          "path": "agent/schedules/daily-x-drafts.ts",
          "type": "registry:file",
          "target": "~/agent/schedules/daily-x-drafts.ts"
        },
        {
          "path": "agent/skills/typefully-best-practices/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/typefully-best-practices/SKILL.md"
        },
        {
          "path": "agent/skills/typefully-best-practices/references/exactly-once.md",
          "type": "registry:file",
          "target": "~/agent/skills/typefully-best-practices/references/exactly-once.md"
        },
        {
          "path": "agent/skills/typefully-best-practices/references/x-automation.md",
          "type": "registry:file",
          "target": "~/agent/skills/typefully-best-practices/references/x-automation.md"
        },
        {
          "path": "agent/tools/create_x_drafts.ts",
          "type": "registry:file",
          "target": "~/agent/tools/create_x_drafts.ts"
        },
        {
          "path": "agent/tools/preview_x_draft.ts",
          "type": "registry:file",
          "target": "~/agent/tools/preview_x_draft.ts"
        },
        {
          "path": "agent/tools/research_hot_topics.ts",
          "type": "registry:file",
          "target": "~/agent/tools/research_hot_topics.ts"
        },
        {
          "path": "agent/tools/scan_x_profiles.ts",
          "type": "registry:file",
          "target": "~/agent/tools/scan_x_profiles.ts"
        },
        {
          "path": "evals/evals.config.ts",
          "type": "registry:file",
          "target": "~/evals/evals.config.ts"
        },
        {
          "path": "evals/x-draft-assistant.eval.ts",
          "type": "registry:file",
          "target": "~/evals/x-draft-assistant.eval.ts"
        },
        {
          "path": "evals/create-confirmation.eval.ts",
          "type": "registry:file",
          "target": "~/evals/create-confirmation.eval.ts"
        },
        {
          "path": "evals/missing-config-does-not-create.eval.ts",
          "type": "registry:file",
          "target": "~/evals/missing-config-does-not-create.eval.ts"
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
      "name": "x-hot-topic-digest",
      "type": "registry:item",
      "title": "X Hot Topic Digest",
      "description": "A scheduled Eve agent that scans a configured set of X (Twitter) profiles every day, surfaces hot topics from their recent posts, researches each topic with the Parallel web search API, and delivers an HTML digest by email through Resend.",
      "categories": [
        "research"
      ],
      "dependencies": [
        "eve@^0.15.1",
        "parallel-web@^1.1.0",
        "resend@^6.14.0",
        "zod@4.3.6"
      ],
      "meta": {
        "slug": "x-hot-topic-digest",
        "category": "research",
        "createdAt": "2026-06-26T09:40:22.348Z",
        "updatedAt": "2026-06-26T10:50:00.000Z"
      },
      "author": "TommyBez",
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
          "path": "agent/lib/hot-topic-config.ts",
          "type": "registry:file",
          "target": "~/agent/lib/hot-topic-config.ts"
        },
        {
          "path": "agent/schedules/daily-hot-topic-digest.ts",
          "type": "registry:file",
          "target": "~/agent/schedules/daily-hot-topic-digest.ts"
        },
        {
          "path": "agent/skills/email-best-practices/SKILL.md",
          "type": "registry:file",
          "target": "~/agent/skills/email-best-practices/SKILL.md"
        },
        {
          "path": "agent/skills/email-best-practices/references/accessibility.md",
          "type": "registry:file",
          "target": "~/agent/skills/email-best-practices/references/accessibility.md"
        },
        {
          "path": "agent/skills/email-best-practices/references/sending-reliability.md",
          "type": "registry:file",
          "target": "~/agent/skills/email-best-practices/references/sending-reliability.md"
        },
        {
          "path": "agent/tools/preview_digest_email.ts",
          "type": "registry:file",
          "target": "~/agent/tools/preview_digest_email.ts"
        },
        {
          "path": "agent/tools/research_hot_topics.ts",
          "type": "registry:file",
          "target": "~/agent/tools/research_hot_topics.ts"
        },
        {
          "path": "agent/tools/scan_x_profiles.ts",
          "type": "registry:file",
          "target": "~/agent/tools/scan_x_profiles.ts"
        },
        {
          "path": "agent/tools/send_digest_email.ts",
          "type": "registry:file",
          "target": "~/agent/tools/send_digest_email.ts"
        },
        {
          "path": "evals/evals.config.ts",
          "type": "registry:file",
          "target": "~/evals/evals.config.ts"
        },
        {
          "path": "evals/hot-topic-digest.eval.ts",
          "type": "registry:file",
          "target": "~/evals/hot-topic-digest.eval.ts"
        },
        {
          "path": "evals/missing-config-does-not-send.eval.ts",
          "type": "registry:file",
          "target": "~/evals/missing-config-does-not-send.eval.ts"
        },
        {
          "path": "evals/send-confirmation.eval.ts",
          "type": "registry:file",
          "target": "~/evals/send-confirmation.eval.ts"
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
      "ai@7.0.0-beta.178",
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
        "content": "import { connectSlackCredentials } from \"@vercel/connect/eve\";\nimport { defaultSlackAuth, loadThreadContextMessages, slackChannel } from \"eve/channels/slack\";\n\nconst SLACK_OPERATING_CONTEXT = [\n  \"Surface: Slack.\",\n  \"Slack is intake, coordination, notification, and scheduled delivery.\",\n  \"The final operational source of truth must live in Linear whenever work is created or changed.\",\n  \"Before sensitive Linear changes, ask for approval in the originating Slack thread or move the final confirmation to Linear.\",\n].join(\"\\n\");\n\nconst getRequiredEnv = (name: string): string => {\n  const value = process.env[name]?.trim();\n  if (!value) {\n    throw new Error(\n      `${name} is required. Create a Vercel Connect Slack connector and set this to the returned connector UID.`,\n    );\n  }\n  return value;\n};\n\nexport default slackChannel({\n  credentials: connectSlackCredentials(getRequiredEnv(\"SLACK_CONNECT_UID\")),\n  async onAppMention(ctx, message) {\n    const auth = defaultSlackAuth(message, ctx);\n    try {\n      const priorMessages = await loadThreadContextMessages(ctx.thread, message, {\n        since: \"last-agent-reply\",\n      });\n\n      const transcript = priorMessages\n        .map(\n          (threadMessage) =>\n            `${threadMessage.isMe ? \"agent\" : (threadMessage.user ?? \"user\")}: ${threadMessage.markdown}`,\n        )\n        .join(\"\\n\");\n\n      return {\n        auth,\n        context: transcript\n          ? [SLACK_OPERATING_CONTEXT, `Recent Slack thread context since the last agent reply:\\n\\n${transcript}`]\n          : [SLACK_OPERATING_CONTEXT],\n      };\n    } catch {\n      return {\n        auth,\n        context: [SLACK_OPERATING_CONTEXT],\n      };\n    }\n  },\n  onDirectMessage: (ctx, message) => ({\n    auth: defaultSlackAuth(message, ctx),\n    context: [SLACK_OPERATING_CONTEXT],\n  }),\n});\n"
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
        "content": "import { connect } from \"@vercel/connect/eve\";\nimport { defineMcpClientConnection } from \"eve/connections\";\n\nimport {\n  getCoveredInitiative,\n  linearOperationsConfig,\n} from \"../lib/linear-operations-config.js\";\n\nconst READ_TOOLS = [\n  \"list_issues\",\n  \"get_issue\",\n  \"list_comments\",\n  \"list_projects\",\n  \"get_status_updates\",\n  \"list_cycles\",\n  \"list_issue_labels\",\n  \"list_issue_statuses\",\n  \"get_issue_status\",\n  \"extract_images\",\n  \"search_documentation\",\n] as const;\n\nconst WRITE_TOOLS = [\n  \"save_issue\",\n  \"save_comment\",\n  \"save_project\",\n  \"save_document\",\n  \"save_status_update\",\n  \"delete_status_update\",\n] as const;\n\nconst normalizeToolName = (toolName: string): string => toolName.split(\"__\").at(-1) ?? toolName;\n\nconst asRecord = (value: unknown): Record<string, unknown> =>\n  typeof value === \"object\" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};\n\nconst getStringField = (input: Record<string, unknown>, field: string): string | undefined => {\n  const value = input[field];\n  return typeof value === \"string\" && value.trim() ? value : undefined;\n};\n\nconst getRequiredEnv = (name: string): string => {\n  const value = process.env[name]?.trim();\n  if (!value) {\n    throw new Error(\n      `${name} is required. Create a Vercel Connect Linear connector and set this to the returned connector UID.`,\n    );\n  }\n  return value;\n};\n\nconst needsSaveIssueApproval = (toolInput: unknown): boolean => {\n  const input = asRecord(toolInput);\n  if (!getStringField(input, \"id\")) return true;\n\n  const changedFields = Object.keys(input).filter((field) => field !== \"id\");\n  return changedFields.length > 0;\n};\n\nconst needsStatusUpdateApproval = (toolInput: unknown): boolean => {\n  const input = asRecord(toolInput);\n  const type = getStringField(input, \"type\");\n  const initiativeIdOrName =\n    getStringField(input, \"initiativeId\") ??\n    getStringField(input, \"initiativeName\") ??\n    getStringField(input, \"initiative\") ??\n    getStringField(input, \"projectMilestoneId\");\n  const coveredInitiative = getCoveredInitiative(initiativeIdOrName ?? \"\");\n\n  if (\n    type === \"initiative\" &&\n    linearOperationsConfig.policy.autoInitiativeUpdates &&\n    coveredInitiative?.weeklyUpdateEnabled === true\n  ) {\n    return false;\n  }\n\n  return true;\n};\n\nexport default defineMcpClientConnection({\n  url: \"https://mcp.linear.app/mcp\",\n  description:\n    \"Linear workspace operations: read issues, comments, projects, cycles, labels, statuses, status updates, and create approved operational updates.\",\n  auth: connect(getRequiredEnv(\"LINEAR_CONNECT_UID\")),\n  tools: {\n    allow: [...READ_TOOLS, ...WRITE_TOOLS],\n  },\n  approval: ({ toolName, toolInput }) => {\n    const normalizedToolName = normalizeToolName(toolName);\n\n    if (READ_TOOLS.includes(normalizedToolName as (typeof READ_TOOLS)[number])) return false;\n    if (normalizedToolName === \"save_comment\") return false;\n    if (normalizedToolName === \"save_status_update\") return needsStatusUpdateApproval(toolInput);\n    if (normalizedToolName === \"save_issue\") return needsSaveIssueApproval(toolInput);\n    if (\n      normalizedToolName === \"save_project\" ||\n      normalizedToolName === \"save_document\" ||\n      normalizedToolName === \"delete_status_update\"\n    ) {\n      return true;\n    }\n\n    return true;\n  },\n});\n"
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
        "content": "# Linear Operations Agent\n\nAn Eve agent for Linear operations across Linear, Slack, and scheduled runs.\n\nLinear is the source of truth. Slack is used for intake, coordination, notification, and scheduled report delivery. Scheduled initiative updates are written directly to Linear for explicitly configured initiatives.\n\n## What You Are Setting Up\n\nThis agent has three different integration points. They are intentionally separate:\n\n| Part | File | Runtime route or server | Credentials |\n| --- | --- | --- | --- |\n| Linear channel | `agent/channels/linear.ts` | `POST /eve/v1/linear` | `LINEAR_AGENT_ACCESS_TOKEN`, `LINEAR_WEBHOOK_SECRET` |\n| Slack channel | `agent/channels/slack.ts` | `POST /eve/v1/slack` | Vercel Connect Slack UID in `SLACK_CONNECT_UID` |\n| Linear MCP connection | `agent/connections/linear.ts` | `https://mcp.linear.app/mcp` | Vercel Connect Linear OAuth UID in `LINEAR_CONNECT_UID` |\n\nThe Linear channel is how users mention or delegate work to the agent inside Linear. The Slack channel is how users mention or DM the agent in Slack. The Linear MCP connection is how the agent reads and writes Linear data from any surface, including Slack and schedules.\n\nDo not replace the Linear MCP connection with custom Linear SDK tools for this agent. The connection exposes the allowed Linear MCP tools and applies the dynamic approval policy in one place.\n\n## Capabilities\n\n- Linear issue triage, clarification, decomposition, duplicate detection, and incident support.\n- Slack thread intake that prepares or creates structured Linear work after approval.\n- Scheduled daily triage, cycle health, backlog hygiene, project summaries, P0/P1 monitoring, and weekly initiative updates.\n- One Linear MCP connection with dynamic approval policy. No custom Linear SDK tools are included.\n\n## Prerequisites\n\n- Node.js 24 or newer.\n- An Eve deployment URL that Linear and Slack can reach over HTTPS.\n- Access to create or configure a Linear Agent app.\n- Access to Vercel Connect for the Slack channel and the Linear MCP OAuth connection.\n- A Slack workspace where the agent app can be installed.\n- A Linear workspace where the MCP-authenticated user has access to the teams, projects, issues, and initiatives the agent should operate on.\n\nFor local webhook testing, expose the local Eve server through a public HTTPS tunnel and use that public URL in Linear and Slack.\n\n## Install And Verify The Agent\n\nInstall the registry item into an existing Eve app:\n\n```bash\nnpx shadcn@latest add https://evex.sh/r/linear-operations-agent\npnpm install\n```\n\nThen run the equivalent Eve checks for your app. In this packaged example the scripts are:\n\n```bash\npnpm info\npnpm build\n```\n\nRun these after completing the Slack and Linear connector setup below.\n\n`pnpm info` should show:\n\n- channels: `linear` at `/eve/v1/linear` and `slack` at `/eve/v1/slack`;\n- one MCP connection named `linear`;\n- the scheduled jobs and skills included with the agent;\n- no custom Linear SDK tools.\n\n## Deploy Or Expose The Eve App\n\nBoth inbound channels need an HTTPS URL:\n\n- Linear sends `AgentSessionEvent` webhooks to `/eve/v1/linear`.\n- Slack sends Connect-triggered Slack events to `/eve/v1/slack`.\n\nFor production on Vercel, Eve's Slack channel docs use:\n\n```bash\nVERCEL_USE_EXPERIMENTAL_FRAMEWORKS=1 vercel deploy --prod\n```\n\nFor local testing, expose the Eve dev server through a public HTTPS tunnel and use that tunnel URL in Linear and Slack. Do not configure Linear or Slack with a plain `localhost` URL.\n\n## Environment Variables\n\nStart from `.env.example`:\n\n```bash\nLINEAR_AGENT_ACCESS_TOKEN=\nLINEAR_WEBHOOK_SECRET=\nLINEAR_CONNECT_UID=\nSLACK_CONNECT_UID=\n\nLINEAR_OPS_DEFAULT_SLACK_CHANNEL_ID=\nLINEAR_OPS_TRIAGE_SLACK_CHANNEL_ID=\nLINEAR_OPS_CYCLE_SLACK_CHANNEL_ID=\nLINEAR_OPS_BACKLOG_SLACK_CHANNEL_ID=\nLINEAR_OPS_P1_SLACK_CHANNEL_ID=\n```\n\nThe top-level credentials do different jobs:\n\n- `LINEAR_AGENT_ACCESS_TOKEN` is used by the Linear channel to post Agent Activities and manage Agent Sessions.\n- `LINEAR_CONNECT_UID` is the `uid` returned by `vercel connect create linear`.\n- `SLACK_CONNECT_UID` is the `uid` returned by `vercel connect create slack`.\n\n`LINEAR_AGENT_ACCESS_TOKEN` does not authorize Linear MCP tools. Linear MCP reads and writes use the Vercel Connect Linear connector referenced by `LINEAR_CONNECT_UID`.\n\n## 1. Configure The Linear Channel\n\nCreate or configure the Linear Agent app that represents this agent inside Linear.\n\nThis setup is only for the Linear channel. It does not authorize the Linear MCP connection.\n\nIn Linear:\n\n1. Configure the app authorize URL with `actor=app`.\n2. Grant the app agent scopes, including `app:assignable` and `app:mentionable`.\n3. Subscribe the app webhook to `AgentSessionEvent`.\n4. Set the webhook URL to:\n\n```text\nhttps://<your-eve-deployment>/eve/v1/linear\n```\n\n5. Copy the Linear webhook secret into `LINEAR_WEBHOOK_SECRET`.\n6. Create or copy the app access token into `LINEAR_AGENT_ACCESS_TOKEN`.\n\nThe channel accepts only Linear Agent Session events with action `created` or `prompted`. It ignores other Linear webhook events. If `LINEAR_OPS_COVERED_TEAMS` or `LINEAR_OPS_COVERED_PROJECTS` is configured, the channel also filters events by the issue team or project before waking the agent.\n\nUse this surface for:\n\n- `@agent triage this issue`;\n- `@agent find duplicates`;\n- delegating a Linear issue to the agent;\n- continuing a Linear Agent Session after the agent asks a question.\n\n## 2. Configure The Slack Channel\n\nThe Slack channel uses Vercel Connect. You do not configure `SLACK_BOT_TOKEN` or `SLACK_SIGNING_SECRET` directly in this agent.\n\nThis setup is only for Slack delivery and intake. It does not authorize Linear MCP tools.\n\nCreate a Slack Connect client and attach its trigger to Eve's Slack route:\n\n```bash\nnpm install -g vercel@latest\nvercel connect create slack --name linear-operations-agent --triggers --format=json\nvercel connect detach <slack-connect-uid> --yes\nvercel connect attach <slack-connect-uid> --triggers --trigger-path /eve/v1/slack --yes\n```\n\nThen set the returned `uid`:\n\n```bash\nSLACK_CONNECT_UID=<slack-connect-uid>\n```\n\nThe `--triggers` flag is required because Slack must deliver `app_mention` and direct message events to `/eve/v1/slack`. The channel loads recent thread context on app mentions with `since: \"last-agent-reply\"`, then tells the model that Slack is intake and delivery while Linear remains the operational source of truth.\n\nUse this surface for:\n\n- `@agent create a Linear issue from this thread`;\n- `@agent link this discussion to ENG-123`;\n- `@agent show me P1 issues without updates`;\n- scheduled digest delivery into configured Slack channels.\n\n## 3. Configure The Linear MCP Connection\n\nThis setup is for reading and writing Linear data through MCP tools. It is separate from the Linear Agent app webhook and separate from the Slack Connect client.\n\nThe MCP connection is defined in `agent/connections/linear.ts`:\n\n```ts\ndefineMcpClientConnection({\n  url: \"https://mcp.linear.app/mcp\",\n  auth: connect(getRequiredEnv(\"LINEAR_CONNECT_UID\")),\n});\n```\n\nCreate a Vercel Connect connector of type `linear`:\n\n```bash\nvercel connect create linear --name linear-operations-agent --format=json\n```\n\nThen set the returned `uid`:\n\n```bash\nLINEAR_CONNECT_UID=<uid returned by Vercel>\n```\n\nThe first tool call that needs the Linear MCP connection can trigger an Eve authorization challenge. The user follows the sign-in URL, Vercel Connect stores and refreshes the Linear OAuth credential, and Eve retries the tool call. The token is not shown to the model or serialized into conversation history.\n\nThe connection allow-list is:\n\n- read tools: `list_issues`, `get_issue`, `list_comments`, `list_projects`, `get_status_updates`, `list_cycles`, `list_issue_labels`, `list_issue_statuses`, `get_issue_status`, `extract_images`, `search_documentation`;\n- write tools: `save_issue`, `save_comment`, `save_project`, `save_document`, `save_status_update`, `delete_status_update`.\n\n## 4. Configure Scope, Slack Delivery, And Schedules\n\nTeam and project filters are comma-separated. Empty values mean all teams or all projects:\n\n```bash\nLINEAR_OPS_COVERED_TEAMS=ENG,Web\nLINEAR_OPS_COVERED_PROJECTS=Payments Revamp,Mobile Foundations\nLINEAR_OPS_READ_ONLY_TEAMS=Platform\n```\n\nSlack schedule delivery uses channel IDs:\n\n```bash\nLINEAR_OPS_DEFAULT_SLACK_CHANNEL_ID=C0123DEFAULT\nLINEAR_OPS_TRIAGE_SLACK_CHANNEL_ID=C0123TRIAGE\nLINEAR_OPS_CYCLE_SLACK_CHANNEL_ID=C0123CYCLE\nLINEAR_OPS_BACKLOG_SLACK_CHANNEL_ID=C0123BACKLOG\nLINEAR_OPS_P1_SLACK_CHANNEL_ID=C0123P1\n```\n\nProject-specific Slack delivery uses `project-or-id:channel-id` pairs:\n\n```bash\nLINEAR_OPS_PROJECT_CHANNELS=Payments Revamp:C0123PAY,Mobile Foundations:C0456MOB\n```\n\nExplicit initiative configuration uses:\n\n```text\ninitiative-id-or-name|optional-slack-channel-id|optional-enabled-flag\n```\n\nExample:\n\n```bash\nLINEAR_OPS_COVERED_INITIATIVES=\"Payments Revamp|C0123PAY|true,Mobile Foundations||false\"\n```\n\nWeekly initiative updates are automatic only when:\n\n- `LINEAR_OPS_AUTO_INITIATIVE_UPDATES` is not `false`;\n- the initiative is listed in `LINEAR_OPS_COVERED_INITIATIVES`;\n- that initiative's enabled flag is omitted or set to `true`;\n- Linear MCP supports initiative status updates in the workspace.\n\nThe default cron values are UTC:\n\n```bash\nLINEAR_OPS_DAILY_TRIAGE_CRON=\"0 7 * * 1-5\"\nLINEAR_OPS_CYCLE_HEALTH_CRON=\"30 7 * * 1-5\"\nLINEAR_OPS_WEEKLY_BACKLOG_CRON=\"0 8 * * 1\"\nLINEAR_OPS_WEEKLY_PROJECT_CRON=\"30 8 * * 1\"\nLINEAR_OPS_WEEKLY_INITIATIVE_CRON=\"0 9 * * 1\"\nLINEAR_OPS_P1_MONITORING_CRON=\"0 13 * * 1-5\"\n```\n\nScheduled operational digests are delivered to Slack. Weekly initiative updates are created directly in Linear with `save_status_update({ type: \"initiative\" })`; Slack is used only for delivery errors or configured notification context.\n\n## Approval Policy\n\nThe approval policy is implemented on the single Linear MCP connection.\n\nNo approval is required for:\n\n- read tools;\n- `save_comment` for non-destructive summaries or proposals;\n- `save_status_update` only when `type === \"initiative\"` and the initiative is explicitly configured for weekly updates.\n\nApproval is required for:\n\n- issue creation;\n- issue changes to state, priority, assignee, delegate, project, cycle, duplicate, parent, blocker, or related relationships;\n- high-priority issue writes where priority is `1` or `2`;\n- project writes;\n- document writes;\n- status update deletes;\n- bulk or irreversible actions.\n\nThe approval predicate is synchronous and input-based. If deciding safely requires the current Linear state, the agent must first read with MCP, then ask for approval before the sensitive write.\n\n## Smoke Tests\n\nAfter deployment and env setup:\n\n1. In Linear, mention or delegate an issue:\n\n```text\n@agent triage this issue\n```\n\nExpected: the agent replies in the Linear Agent Session and attaches proposals to the Linear context.\n\n2. In Slack, mention the agent in a thread:\n\n```text\n@agent summarize the thread and propose a Linear issue\n```\n\nExpected: the agent reads recent thread context, proposes Linear work, and asks for approval before sensitive changes.\n\n3. From Slack or Linear, ask for a read-only Linear query:\n\n```text\n@agent show me P1 issues without updates\n```\n\nExpected: if the caller has not authorized the Linear MCP connection yet, Eve surfaces a Linear Connect authorization challenge. After authorization, the agent can call the allowed Linear MCP read tools.\n\n4. Trigger a development schedule:\n\n```bash\ncurl -X POST http://localhost:3000/eve/v1/dev/schedules/daily-triage-digest\n```\n\nOther schedule ids are `cycle-health`, `weekly-backlog-hygiene`, `weekly-project-summary`, `weekly-initiative-updates`, and `p1-monitoring`.\n\n## Troubleshooting\n\nIf Linear mentions do nothing, check that the Linear app webhook points to `/eve/v1/linear`, subscribes to `AgentSessionEvent`, and sends a valid `Linear-Signature` matching `LINEAR_WEBHOOK_SECRET`.\n\nIf Linear Agent Session replies fail, check `LINEAR_AGENT_ACCESS_TOKEN`. This token lets the channel post Agent Activities and manage Agent Sessions; it is not used for Linear MCP reads or writes.\n\nIf Slack mentions do nothing, check that the Slack Connect client is attached with `--triggers` and `--trigger-path /eve/v1/slack`, and that `SLACK_CONNECT_UID` matches the created connector UID.\n\nIf Slack-triggered Linear reads or writes fail with authorization required, complete the Linear MCP Connect sign-in flow for the caller. `LINEAR_CONNECT_UID` must match the Linear Connect OAuth connector, not the Slack connector.\n\nIf scheduled jobs do not post, set the relevant Slack channel ID env var. The schedule handlers return without posting when no target channel ID is configured.\n\nIf weekly initiative updates do not write to Linear, confirm the initiative is explicitly listed in `LINEAR_OPS_COVERED_INITIATIVES` and that the workspace supports Linear initiatives or roadmaps.\n"
      },
      {
        "path": ".env.example",
        "type": "registry:file",
        "target": "~/.env.example",
        "content": "LINEAR_AGENT_ACCESS_TOKEN=\nLINEAR_WEBHOOK_SECRET=\nLINEAR_CONNECT_UID=\nSLACK_CONNECT_UID=\n\nLINEAR_OPS_COVERED_TEAMS=\nLINEAR_OPS_COVERED_PROJECTS=\nLINEAR_OPS_COVERED_INITIATIVES=\nLINEAR_OPS_READ_ONLY_TEAMS=\nLINEAR_OPS_MAX_BULK_ISSUE_COUNT=10\nLINEAR_OPS_AUTO_INITIATIVE_UPDATES=true\n\nLINEAR_OPS_DEFAULT_SLACK_CHANNEL_ID=\nLINEAR_OPS_TRIAGE_SLACK_CHANNEL_ID=\nLINEAR_OPS_CYCLE_SLACK_CHANNEL_ID=\nLINEAR_OPS_BACKLOG_SLACK_CHANNEL_ID=\nLINEAR_OPS_P1_SLACK_CHANNEL_ID=\nLINEAR_OPS_PROJECT_CHANNELS=\n\nLINEAR_OPS_DAILY_TRIAGE_CRON=\"0 7 * * 1-5\"\nLINEAR_OPS_CYCLE_HEALTH_CRON=\"30 7 * * 1-5\"\nLINEAR_OPS_WEEKLY_BACKLOG_CRON=\"0 8 * * 1\"\nLINEAR_OPS_WEEKLY_PROJECT_CRON=\"30 8 * * 1\"\nLINEAR_OPS_WEEKLY_INITIATIVE_CRON=\"0 9 * * 1\"\nLINEAR_OPS_P1_MONITORING_CRON=\"0 13 * * 1-5\"\n"
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
  },
  "x-draft-assistant": {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "x-draft-assistant",
    "type": "registry:item",
    "title": "X Draft Assistant",
    "description": "A scheduled Eve agent that scans a configured set of X (Twitter) profiles every day, surfaces hot topics from their recent posts, researches each topic with the Parallel web search API, and creates three draft candidates for X in Typefully so a human can review and publish them.",
    "categories": [
      "research"
    ],
    "dependencies": [
      "eve@^0.15.1",
      "parallel-web@^1.1.0",
      "zod@4.3.6"
    ],
    "meta": {
      "slug": "x-draft-assistant",
      "category": "research",
      "createdAt": "2026-06-26T15:22:15.793Z",
      "updatedAt": "2026-06-26T15:40:00.000Z"
    },
    "author": "TommyBez",
    "files": [
      {
        "path": "agent/agent.ts",
        "type": "registry:file",
        "target": "~/agent/agent.ts",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  model: \"deepseek/deepseek-v4-flash\",\n});\n"
      },
      {
        "path": "agent/instructions.md",
        "type": "registry:file",
        "target": "~/agent/instructions.md",
        "content": "# Mission\nProduce three X (Twitter) draft candidates every day from hot topics surfaced on a\nwatched set of profiles, researched with the Parallel web search API, and created\nas drafts in Typefully for a human to review and publish.\n\n# Workflow\n1. Load the typefully-best-practices skill before drafting or creating any X\n   draft. The skill encodes X automation compliance, character limits, and the\n   exactly-once draft creation model.\n2. Use scan_x_profiles to pull recent posts from every configured handle, scoped\n   to the last `X_HOT_TOPIC_LOOKBACK_HOURS` (default 24). If no handles are\n   configured, stop and report the missing configuration instead of inventing\n   profiles. Only treat posts inside the lookback window as hot-topic candidates,\n   so the drafts do not repeat the same topics day over day.\n3. From the returned posts, surface up to `X_HOT_TOPIC_MAX_TOPICS` hot topics. A\n   hot topic is a recurring theme, announcement, launch, debate, or signal that\n   appears across posts or that carries outsized engagement for a profile.\n   Cluster near-duplicates into a single topic.\n4. For each hot topic, use research_hot_topics with 2-3 focused keyword queries\n   to gather ranked web sources with provenance. Skip research for topics that\n   are too vague to query.\n5. Draft exactly `X_HOT_TOPIC_DRAFT_COUNT` (default 3) distinct X post candidates\n   from the researched topics. Each candidate is either a single tweet or a short\n   thread (1-5 posts). Candidates must differ in angle, tone, or length \u2014 not\n   just rearranged words \u2014 so the user has a real choice. Respect the 280-char X\n   limit per post. Cite originating X posts as\n   `https://x.com/<handle>/status/<id>` only with handles and ids returned by\n   scan_x_profiles. Do not fabricate URLs, post ids, or quotes.\n6. Always call preview_x_draft first to review the exact drafts, post lengths,\n   target social set, tag, and madeWithAi flag. The social set id, tag, and\n   madeWithAi flag come from `TYPEFULLY_SOCIAL_SET_ID`, `X_HOT_TOPIC_DRAFT_TAG`,\n   and `X_HOT_TOPIC_DRAFT_MADE_WITH_AI` and cannot be overridden through tool\n   input \u2014 never try to pass `socialSetId`, `tag`, or `madeWithAi` to the create\n   tool. The made-with-AI label defaults to true because these posts are drafted\n   by an LLM; only disable it if a human rewrites the posts before publishing.\n7. To create the drafts in Typefully, call create_x_drafts with `confirmCreate:\n   true` and a stable, unique `idempotencyKey` per draft. The recommended scheme\n   is `x-draft-assistant-<windowStartUtc>-<n>`, where `<windowStartUtc>` is the\n   `windowStart` value returned by scan_x_profiles (the RFC3339 UTC start of\n   this run's lookback window) and `<n>` is the 1-based index of the draft\n   candidate within the run. Using the lookback window start makes the key\n   unique per run even when the schedule fires more than once a day, and stable\n   across retries of the same run. Reuse the same key if the step is retried so\n   a replayed create does not duplicate the draft. Never call create_x_drafts\n   without an idempotencyKey per draft, and never reuse the same key across two\n   drafts in one call. If create_x_drafts returns a draft with `created: false`\n   and an `error`, report the error and do not retry inside the same step.\n\n# Output contract\nReturn:\n- the list of hot topics with origin posts and research sources\n- the three X draft candidates (title, posts, scratchpad) as previewed by\n  preview_x_draft\n- the create result from create_x_drafts when it was called, including each\n  draft's idempotencyKey, draftId, and private_url\n- any missing configuration that blocked a step\n\n# Guardrails\n- Do not publish or schedule drafts in Typefully. The agent only creates drafts.\n- Do not disable the X \"made with AI\" disclosure unless a human rewrites the\n  posts before publishing. The posts are drafted by an LLM, so the label is\n  required by X's content disclosure policy.\n- Do not set a reply target on a draft unless the user explicitly asked for a\n  reply to a specific post.\n- Do not duplicate text across the three candidates in one run.\n- Do not fabricate URLs, excerpts, or post ids. Every citation must come from a\n  tool result.\n- Do not retry a failed create_x_drafts call inside the same Eve step.\n- If a tool reports `authRequired` or `notConfigured`, stop and report it instead\n  of proceeding.\n"
      },
      {
        "path": "agent/lib/hot-topic-config.ts",
        "type": "registry:file",
        "target": "~/agent/lib/hot-topic-config.ts",
        "content": "export type HotTopicConfig = {\n  readonly handles: readonly string[];\n  readonly dailyCron: string;\n  readonly lookbackHours: number;\n  readonly maxTweetsPerProfile: number;\n  readonly maxHotTopics: number;\n  readonly searchMaxResults: number;\n  readonly searchMode: \"turbo\" | \"basic\" | \"advanced\";\n  readonly draft: {\n    readonly count: number;\n    readonly madeWithAi: boolean;\n    readonly tag?: string;\n    readonly socialSetId?: string;\n  };\n};\n\nconst DEFAULT_MAX_TWEETS_PER_PROFILE = 20;\nconst DEFAULT_MAX_HOT_TOPICS = 5;\nconst DEFAULT_SEARCH_MAX_RESULTS = 5;\nconst DEFAULT_SEARCH_MODE = \"basic\";\nconst DEFAULT_DAILY_CRON = \"0 8 * * *\";\nconst DEFAULT_LOOKBACK_HOURS = 24;\nconst DEFAULT_DRAFT_COUNT = 3;\nconst DEFAULT_DRAFT_MADE_WITH_AI = true;\n\nconst compactCsv = (value: string | undefined): string[] =>\n  (value ?? \"\")\n    .split(\",\")\n    .map((item) => item.trim())\n    .filter(Boolean);\n\nconst optional = (value: string | undefined): string | undefined => {\n  const trimmed = value?.trim();\n  return trimmed ? trimmed : undefined;\n};\n\nconst parsePositiveInteger = (value: string | undefined, fallback: number): number => {\n  const parsed = Number.parseInt(value ?? \"\", 10);\n  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;\n};\n\nconst parseSearchMode = (value: string | undefined): \"turbo\" | \"basic\" | \"advanced\" => {\n  const trimmed = value?.trim().toLowerCase();\n  if (trimmed === \"turbo\" || trimmed === \"basic\" || trimmed === \"advanced\") {\n    return trimmed;\n  }\n  return DEFAULT_SEARCH_MODE;\n};\n\nconst parseBoolean = (value: string | undefined, fallback: boolean): boolean => {\n  const trimmed = value?.trim().toLowerCase();\n  if (trimmed === \"true\" || trimmed === \"1\" || trimmed === \"yes\" || trimmed === \"on\") {\n    return true;\n  }\n  if (trimmed === \"false\" || trimmed === \"0\" || trimmed === \"no\" || trimmed === \"off\") {\n    return false;\n  }\n  return fallback;\n};\n\nconst toRfc3339Utc = (date: Date): string =>\n  date.toISOString().replace(/\\.\\d{3}Z$/, \"Z\");\n\nexport const getLookbackStartTime = (now: Date = new Date()): string =>\n  toRfc3339Utc(new Date(now.getTime() - hotTopicConfig.lookbackHours * 60 * 60 * 1000));\n\nexport const hotTopicConfig = {\n  handles: compactCsv(process.env.X_HOT_TOPIC_HANDLES),\n  dailyCron: optional(process.env.X_HOT_TOPIC_DAILY_CRON) ?? DEFAULT_DAILY_CRON,\n  lookbackHours: parsePositiveInteger(\n    process.env.X_HOT_TOPIC_LOOKBACK_HOURS,\n    DEFAULT_LOOKBACK_HOURS,\n  ),\n  maxTweetsPerProfile: parsePositiveInteger(\n    process.env.X_HOT_TOPIC_MAX_TWEETS_PER_PROFILE,\n    DEFAULT_MAX_TWEETS_PER_PROFILE,\n  ),\n  maxHotTopics: parsePositiveInteger(\n    process.env.X_HOT_TOPIC_MAX_TOPICS,\n    DEFAULT_MAX_HOT_TOPICS,\n  ),\n  searchMaxResults: parsePositiveInteger(\n    process.env.X_HOT_TOPIC_SEARCH_MAX_RESULTS,\n    DEFAULT_SEARCH_MAX_RESULTS,\n  ),\n  searchMode: parseSearchMode(process.env.X_HOT_TOPIC_SEARCH_MODE),\n  draft: {\n    count: parsePositiveInteger(\n      process.env.X_HOT_TOPIC_DRAFT_COUNT,\n      DEFAULT_DRAFT_COUNT,\n    ),\n    madeWithAi: parseBoolean(\n      process.env.X_HOT_TOPIC_DRAFT_MADE_WITH_AI,\n      DEFAULT_DRAFT_MADE_WITH_AI,\n    ),\n    tag: optional(process.env.X_HOT_TOPIC_DRAFT_TAG),\n    socialSetId: optional(process.env.TYPEFULLY_SOCIAL_SET_ID),\n  },\n} satisfies HotTopicConfig;\n"
      },
      {
        "path": "agent/lib/typefully-client.ts",
        "type": "registry:file",
        "target": "~/agent/lib/typefully-client.ts",
        "content": "// Typefully Public API v2 client. Minimal surface for creating X drafts.\n// Reference: https://typefully.com/docs/api\n\nconst TYPEFULLY_API_BASE = \"https://api.typefully.com\";\n\nexport type TypefullyXPost = {\n  readonly text: string;\n  readonly madeWithAi?: boolean;\n};\n\nexport type TypefullyCreateDraftInput = {\n  readonly socialSetId: string;\n  readonly posts: readonly TypefullyXPost[];\n  readonly draftTitle?: string;\n  readonly scratchpad?: string;\n  readonly tags?: readonly string[];\n};\n\nexport type TypefullyCreateDraftResponse = {\n  readonly id: number;\n  readonly social_set_id: number;\n  readonly status: string;\n  readonly preview: string;\n  readonly private_url: string;\n  readonly share_url?: string | null;\n  readonly draft_title?: string | null;\n  readonly scheduled_date?: string | null;\n  readonly created_at: string;\n};\n\nexport type TypefullyError = {\n  readonly message: string;\n  readonly status: number;\n  readonly body: string;\n};\n\nexport class TypefullyApiError extends Error {\n  readonly status: number;\n  readonly body: string;\n  constructor(error: TypefullyError) {\n    super(error.message);\n    this.name = \"TypefullyApiError\";\n    this.status = error.status;\n    this.body = error.body;\n  }\n}\n\ntype TypefullyErrorBody = {\n  readonly error?: {\n    readonly code?: string;\n    readonly message?: string;\n    readonly details?: readonly {\n      readonly message?: string;\n      readonly field?: string;\n    }[];\n  };\n};\n\nfunction summarizeErrorBody(body: string, status: number): string {\n  if (!body) {\n    return `Typefully API ${status} with no response body.`;\n  }\n  try {\n    const parsed = JSON.parse(body) as TypefullyErrorBody;\n    const top = parsed.error?.message;\n    if (top) {\n      return `Typefully API ${status}: ${top}`;\n    }\n  } catch {\n    // Fall through to the raw slice.\n  }\n  return `Typefully API ${status}: ${body.slice(0, 500)}`;\n}\n\nexport async function createTypefullyDraft(\n  input: TypefullyCreateDraftInput,\n  apiKey: string,\n): Promise<TypefullyCreateDraftResponse> {\n  const payload = {\n    platforms: {\n      x: {\n        enabled: true,\n        posts: input.posts.map((post) => ({\n          text: post.text,\n          ...(post.madeWithAi ? { made_with_ai: true } : {}),\n        })),\n        settings: {},\n      },\n    },\n    draft_title: input.draftTitle,\n    scratchpad_text: input.scratchpad,\n    tags: input.tags,\n    share: false,\n  };\n\n  const response = await fetch(\n    `${TYPEFULLY_API_BASE}/v2/social-sets/${encodeURIComponent(input.socialSetId)}/drafts`,\n    {\n      method: \"POST\",\n      headers: {\n        Authorization: `Bearer ${apiKey}`,\n        \"Content-Type\": \"application/json\",\n      },\n      body: JSON.stringify(payload),\n    },\n  );\n\n  const responseText = await response.text();\n  if (!response.ok) {\n    throw new TypefullyApiError({\n      message: summarizeErrorBody(responseText, response.status),\n      status: response.status,\n      body: responseText,\n    });\n  }\n\n  const data = JSON.parse(responseText) as TypefullyCreateDraftResponse;\n  return {\n    ...data,\n    draft_title: data.draft_title ?? input.draftTitle ?? null,\n  };\n}\n"
      },
      {
        "path": "agent/schedules/daily-x-drafts.ts",
        "type": "registry:file",
        "target": "~/agent/schedules/daily-x-drafts.ts",
        "content": "import { defineSchedule } from \"eve/schedules\";\n\nimport { hotTopicConfig } from \"../lib/hot-topic-config.js\";\n\nexport default defineSchedule({\n  cron: hotTopicConfig.dailyCron,\n  markdown: `Run the daily X draft assistant.\n\n1. Use scan_x_profiles to scan every handle configured in X_HOT_TOPIC_HANDLES, scoped to the last ${hotTopicConfig.lookbackHours} hours (X_HOT_TOPIC_LOOKBACK_HOURS). Only treat posts inside the lookback window as hot-topic candidates.\n2. Surface up to ${hotTopicConfig.maxHotTopics} hot topics from those posts.\n3. For each topic, call research_hot_topics with focused keyword queries.\n4. Draft exactly ${hotTopicConfig.draft.count} distinct X post candidates (single tweets or short threads, 280 chars per post, different angles) from the researched topics. Cite originating posts as https://x.com/<handle>/status/<id> only with handles and ids returned by scan_x_profiles.\n5. Call preview_x_draft to review the drafts, post lengths, target social set, tag, and madeWithAi flag (defaults to true because the posts are drafted by an LLM).\n6. To create the drafts in Typefully, call create_x_drafts with confirmCreate=true and a stable, unique idempotencyKey per draft. The recommended scheme is x-draft-assistant-<windowStartUtc>-<n>, where <windowStartUtc> is the windowStart value returned by scan_x_profiles (RFC3339 UTC, e.g. 2026-06-26T08:00:00Z) and <n> is the 1-based candidate index in this run. Using the lookback window start makes the key unique per run even when the schedule fires more than once a day, and stable across retries of the same run. Reuse the same key if the step is retried so a replayed create does not duplicate the draft.\n\nIf any required environment variable is missing (X_BEARER_TOKEN, PARALLEL_API_KEY, TYPEFULLY_API_KEY, TYPEFULLY_SOCIAL_SET_ID), stop and report the missing configuration. Do not invent handles, topics, sources, or draft text. Never call create_x_drafts without confirmCreate=true and a unique idempotencyKey per draft. Do not publish or schedule the drafts; the agent only creates them. Do not disable the X \"made with AI\" disclosure (X_HOT_TOPIC_DRAFT_MADE_WITH_AI) unless a human rewrites the posts before publishing.`,\n});\n"
      },
      {
        "path": "agent/skills/typefully-best-practices/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/typefully-best-practices/SKILL.md",
        "content": "---\ndescription: Use when drafting or creating X (Twitter) posts through Typefully \u2014 X automation compliance, character limits, and exactly-once draft creation.\n---\n\nGuidance for drafting X posts and creating Typefully drafts without violating X's\nautomation rules or producing duplicate drafts. Apply these rules whenever an X\ndraft is being authored or created through Typefully.\n\n## X automation compliance\n\nX's automation rules apply to anything posted through the Typefully API on behalf\nof an account. The agent only creates drafts; it never publishes or schedules\nthem, but the same rules govern the content that lands in the queue.\n\n- **No duplicate content across drafts in the same run.** Each of the three draft\n  candidates must take a distinct angle on the same hot topic. Reusing the same\n  text across drafts risks an X duplicate-content flag.\n- **No unsolicited automated replies.** Never set a reply target on a draft\n  unless the user explicitly asked for a reply to a specific post. The agent\n  creates top-level posts only.\n- **No trending manipulation.** Do not stuff hashtags or pile onto a trending\n  topic to game visibility. The drafts react to a real signal from watched\n  profiles, not to the trending tab.\n- **No fake engagement.** The agent does not like, repost, follow, or reply. It\n  only creates drafts.\n- **Label AI-drafted posts.** X's content disclosure policy requires a \"made\n  with AI\" label on posts generated by an LLM. The agent drafts posts with a\n  model, so `X_HOT_TOPIC_DRAFT_MADE_WITH_AI` defaults to `true` and\n  `create_x_drafts` sets `made_with_ai: true` on every X post. Only disable the\n  label if a human rewrites the posts before publishing.\n- **Respect rate limits.** The Typefully API rate-limits draft creation per user\n  and per social set. One run produces at most three drafts; do not loop create\n  calls to retry a failed draft in the same step.\n\nSee [x-automation](./references/x-automation.md) for the full compliance model.\n\n## Exactly-once draft creation\n\nThe Typefully v2 API does not accept a server-side idempotency key, so a replayed\nEve step would normally create a second draft. The agent defends against that\nwith a per-draft `idempotencyKey` plus an in-process cache of successful\ncreates:\n\n- Derive each key from the run, not from `Date.now()` or a fresh random value.\n  A stable scheme is `x-draft-assistant-<windowStartUtc>-<n>`, where\n  `<windowStartUtc>` is the `windowStart` value returned by `scan_x_profiles`\n  (RFC3339 UTC start of this run's lookback window) and `n` is the 1-based index\n  of the draft candidate within the run. Anchoring to the lookback window start\n  makes the key unique per run even when the schedule fires more than once a\n  day, and stable across retries of the same run.\n- Each draft in a single `create_x_drafts` call must have a unique key. Duplicate\n  keys inside one call are rejected before any POST is issued.\n- A replayed step with the same key returns the recorded response instead of\n  issuing a second POST. Failures are not cached, so the same key can be retried.\n- `confirmCreate` must be `true` before any draft is created. Treat it as a\n  guardrail: always call `preview_x_draft` first, then create with the flag set.\n\nSee [exactly-once](./references/exactly-once.md) for the idempotency and retry\nmodel in detail.\n\n## Drafting for X\n\nX posts are short, single-purpose, and easy to read in a fast scroll.\n\n- Each post is at most 280 characters. `preview_x_draft` validates this; longer\n  posts are rejected before any network call.\n- A single-post draft is a tweet. A multi-post draft is a thread: order posts so\n  the thread reads top-to-bottom, lead with the takeaway, and let later posts add\n  evidence or nuance.\n- Keep drafts distinct: the three candidates should differ in angle, length, or\n  tone \u2014 not just rearranged words.\n- Cite the originating X post when its content anchors the draft. Link as\n  `https://x.com/<handle>/status/<id>` and only use handles and ids returned by\n  `scan_x_profiles`.\n- Do not fabricate URLs, post ids, or quotes. Every citation must come from a\n  tool result.\n- Every X post is labeled \"made with AI\" on create, because the posts are drafted\n  by an LLM. Do not disable the label unless a human rewrites the posts before\n  publishing.\n\n## Output discipline\n\nThe agent creates drafts only. It never schedules, publishes, or shares them.\nLeave the drafts in `draft` status for a human to review in Typefully.\n"
      },
      {
        "path": "agent/skills/typefully-best-practices/references/exactly-once.md",
        "type": "registry:file",
        "target": "~/agent/skills/typefully-best-practices/references/exactly-once.md",
        "content": "# Exactly Once\n\nEnsuring a Typefully draft is created exactly once across Eve step replays.\n\n## The problem\n\nEve replays completed steps from their recorded result, but a step interrupted\nmid-execution re-runs. If a `create_x_drafts` call is interrupted after the\nTypefully POST succeeds but before the result is recorded, a replay issues a\nsecond POST and creates a duplicate draft.\n\nThe Typefully v2 API does not accept a server-side idempotency key, so the\ndefense is in-process: a per-draft `idempotencyKey` plus a cache of successful\ncreates keyed by that key.\n\n### Scope of the in-process cache\n\nThe cache lives in the Node process that ran the create. It protects against\nEve step replays inside that process (the common case: a step interrupted\nmid-execution re-runs in the same session). It does **not** protect against\nreplays that cross a process boundary \u2014 a serverless cold start, a redeploy,\nor a process restart will see an empty cache and issue a second POST if Eve\nreplays the step there. A durable store (Redis, Postgres, or another\nshared-state backend) would be needed to close that gap, and is out of scope\nfor this agent. The mitigations in place are:\n\n- The recommended `idempotencyKey` is derived from the run's lookback window\n  start, so a re-triggered run with the same window reuses the same key \u2014 but\n  only the in-process cache can short-circuit it.\n- `confirmCreate` must be `true` before any POST goes out, so accidental\n  creates are gated.\n- The agent never publishes or schedules drafts, so a duplicate draft is\n  reviewable noise in Typefully, not a public double-post.\n\n## Solution: per-draft idempotency keys\n\nEach draft in a `create_x_drafts` call carries a stable `idempotencyKey`. Before\nissuing a POST, the tool checks the cache:\n\n- A hit returns the recorded response with `replayed: true` and never issues a\n  second POST.\n- A miss issues the POST, then stores the response on success. Failures are not\n  cached, so the same key can be retried on a later run.\n\n### Key generation strategies\n\n| Strategy | Example | Use when |\n|----------|---------|----------|\n| Lookback window start (recommended) | `x-draft-assistant-2026-06-26T08:00:00Z-1` | One draft per candidate per run; unique per run even sub-daily |\n| Run + topic slug | `x-draft-assistant-2026-06-26T08:00:00Z-ai-sdk-5` | Stable across topic reordering within a run |\n| UUID | `crypto.randomUUID()` | No natural key (generate once, reuse on retry) |\n\n**Best practice:** use deterministic keys based on the run's lookback window\nstart (returned by `scan_x_profiles` as `windowStart`) and the candidate index.\nThe window start is unique per run even when the schedule fires more than once\na day, and is stable across retries of the same run. If the same logical create\nis retried, the same key must be regenerated. Avoid `Date.now()` or random\nvalues generated fresh on each attempt \u2014 a fresh value per attempt breaks\nexactly-once.\n\n### Duplicate keys inside one call\n\nEach draft in a single `create_x_drafts` call must have a unique\n`idempotencyKey`. The tool rejects a call with duplicate keys before any POST is\nissued, so a misconfigured run cannot create one draft and silently drop another.\n\n## Result shape: distinguish `created`, `replayed`, and failures\n\nThe tool returns one entry per draft, tagged so the caller can tell them apart:\n\n```typescript\ntype DraftResult =\n  | { created: true; draftId; privateUrl; ... }\n  | { replayed: true; draftId; privateUrl; ... }\n  | { created: false; error: { message; status? } };\n```\n\nA `replayed` entry is a success \u2014 the draft already exists and the replay did not\nduplicate it. A `created: false` entry is a failure that can be retried with the\nsame key on a later run.\n\n## Retry logic\n\nA failed create should not be retried inside the same Eve step. The Typefully\nper-social-set rate limit on `drafts.create` is small, and a tight retry loop\nwill burn through it. Surface the failure in the output and let the user retry on\na later run, reusing the same `idempotencyKey` so a successful retry does not\nduplicate the draft.\n\n| Error type | Retry? | Notes |\n|------------|--------|-------|\n| 429 (rate limit) | No, defer to a later run | Wait for the rate limit window |\n| 5xx (server error) | Yes, on a later run | Transient, likely to resolve |\n| 4xx (client error) | No | Fix the request first |\n| Network timeout | Yes, on a later run | Transient |\n\n## The `confirmCreate` guard\n\n`create_x_drafts` requires `confirmCreate: true` before it issues any POST. This\nis a separate guard from the idempotency key: the key makes replays safe, the\nflag makes accidental creates impossible. Always call `preview_x_draft` first,\nreview the candidates, then call `create_x_drafts` with the flag set.\n\n## Related\n\n- [X Automation](./x-automation.md) \u2014 content and engagement rules for X drafts\n"
      },
      {
        "path": "agent/skills/typefully-best-practices/references/x-automation.md",
        "type": "registry:file",
        "target": "~/agent/skills/typefully-best-practices/references/x-automation.md",
        "content": "# X Automation Compliance\n\nX's automation rules govern anything posted through the Typefully API on behalf of\nan account. The agent only creates drafts \u2014 it never publishes or schedules \u2014 but\nthe same rules govern the content that lands in the queue.\n\n## Rules\n\n### No duplicate content across drafts in the same run\n\nEach of the three draft candidates must take a distinct angle on the same hot\ntopic. Reusing the same text across drafts risks an X duplicate-content flag and\nreduces the value of offering the user three options.\n\n### No unsolicited automated replies\n\nNever set a reply target on a draft unless the user explicitly asked for a reply\nto a specific post. The agent creates top-level posts only. Replying to\nunrelated accounts is one of the fastest ways to get an account flagged.\n\n### No trending manipulation\n\nDo not stuff hashtags or pile onto a trending topic to game visibility. The\ndrafts react to a real signal from watched profiles, not to the trending tab. If\na topic is genuinely trending, write about it for its substance, not for the\ntrend.\n\n### No fake engagement\n\nThe agent does not like, repost, follow, or reply. It only creates drafts. Do\nnot add engagement-style framing (\"boost this\", \"retweet if you agree\") to draft\ntext either.\n\n### Label AI-drafted posts\n\nX's content disclosure policy requires a \"made with AI\" label on posts generated\nby an LLM. The agent drafts posts with a model, so every X post is created with\n`made_with_ai: true` by default. `X_HOT_TOPIC_DRAFT_MADE_WITH_AI` controls the\nflag and defaults to `true`.\n\nOnly disable the label (`X_HOT_TOPIC_DRAFT_MADE_WITH_AI=false`) if a human\nrewrites the posts before publishing. Disabling it for AI-drafted content\nviolates X's content disclosure policy and risks account enforcement.\n\n### Respect rate limits\n\nThe Typefully API rate-limits draft creation per user and per social set. One\nrun produces at most three drafts; do not loop create calls to retry a failed\ndraft in the same step. If a draft fails, surface the error in the output and let\nthe user retry on a later run.\n\n## Priority order\n\nWhen you cannot satisfy every rule, fix in this order:\n\n1. Missing \"made with AI\" label on AI-drafted posts (policy violation, account\n   enforcement risk).\n2. Duplicate content across the three drafts in the same run.\n3. Unsolicited reply target on a draft.\n4. Hashtag stuffing or trending manipulation.\n5. Engagement-bait framing in the post text.\n6. Retrying a failed create in the same step.\n\n## Authoring checklist\n\n- [ ] `X_HOT_TOPIC_DRAFT_MADE_WITH_AI` is `true` (default) unless a human rewrites the posts before publishing\n- [ ] Each of the three draft candidates has distinct text and a distinct angle\n- [ ] No draft sets a reply target unless the user explicitly asked for a reply\n- [ ] No hashtag stuffing, no engagement bait, no trending manipulation\n- [ ] No retry loop on a failed `create_x_drafts` call inside one step\n\n## Related\n\n- [Exactly Once](./exactly-once.md) \u2014 idempotent draft creation and replay safety\n"
      },
      {
        "path": "agent/tools/create_x_drafts.ts",
        "type": "registry:file",
        "target": "~/agent/tools/create_x_drafts.ts",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nimport { hotTopicConfig } from \"../lib/hot-topic-config.js\";\nimport {\n  createTypefullyDraft,\n  TypefullyApiError,\n  type TypefullyCreateDraftResponse,\n} from \"../lib/typefully-client.js\";\n\nconst X_POST_MAX_CHARS = 280;\n\nconst postSchema = z\n  .string()\n  .min(1)\n  .max(X_POST_MAX_CHARS, `X posts must be at most ${X_POST_MAX_CHARS} characters.`);\n\nconst draftSchema = z.object({\n  idempotencyKey: z\n    .string()\n    .min(1)\n    .max(255)\n    .describe(\n      \"Stable unique key for this draft, scoped to this run. Reused across retries of the same step so a replayed create does not duplicate the draft. Must be unique per draft, not per run.\",\n    ),\n  title: z\n    .string()\n    .min(1)\n    .max(120)\n    .describe(\"Internal Typefully draft title. Not posted to social media.\"),\n  posts: z\n    .array(postSchema)\n    .min(1)\n    .max(25)\n    .describe(\n      \"Ordered X posts that make up the draft. A single post is a tweet; multiple posts are a thread.\",\n    ),\n  scratchpad: z\n    .string()\n    .max(2_000)\n    .optional()\n    .describe(\n      \"Optional private notes attached to the draft in Typefully. Not posted to social media.\",\n    ),\n});\n\nconst draftsSchema = z\n  .array(draftSchema)\n  .min(1)\n  .max(5)\n  .describe(\"Up to 5 X draft candidates to create in Typefully.\");\n\nconst payloadSchema = z.object({\n  drafts: draftsSchema,\n  confirmCreate: z\n    .boolean()\n    .describe(\n      \"Must be true to create drafts in Typefully. Acts as an explicit guard against accidental creates.\",\n    ),\n});\n\ntype CreatedDraft = {\n  readonly idempotencyKey: string;\n  readonly title: string;\n  readonly created: true;\n  readonly draftId: number;\n  readonly socialSetId: string;\n  readonly privateUrl: string;\n  readonly preview: string;\n  readonly status: string;\n};\n\ntype ReplayedDraft = {\n  readonly idempotencyKey: string;\n  readonly title: string;\n  readonly replayed: true;\n  readonly draftId: number;\n  readonly socialSetId: string;\n  readonly privateUrl: string;\n};\n\ntype FailedDraft = {\n  readonly idempotencyKey: string;\n  readonly title: string;\n  readonly created: false;\n  readonly error: { readonly message: string; readonly status?: number };\n};\n\ntype CreateXDraftsOutput = {\n  readonly socialSetId: string;\n  readonly tag?: string;\n  readonly madeWithAi: boolean;\n  readonly createdCount: number;\n  readonly replayedCount: number;\n  readonly failedCount: number;\n  readonly drafts: readonly (CreatedDraft | ReplayedDraft | FailedDraft)[];\n};\n\n// Successful creates are cached so a replayed Eve step returns the recorded\n// result instead of issuing a second POST, as long as the replay happens in\n// the same Node process. The Typefully v2 API does not accept a server-side\n// idempotency key, so the cache is in-process and keyed by the caller-provided\n// idempotencyKey. A replay that crosses a process boundary (serverless cold\n// start, redeploy, restart) sees an empty cache and will POST again \u2014 a\n// durable store would be needed to close that gap. Failures are not cached so\n// they can be retried with the same key.\nconst createdCache = new Map<\n  string,\n  { readonly title: string; readonly socialSetId: string; readonly response: TypefullyCreateDraftResponse }\n>();\n\nfunction duplicateIdempotencyKeys(drafts: readonly { idempotencyKey: string }[]): string[] {\n  const seen = new Set<string>();\n  const duplicates = new Set<string>();\n  for (const draft of drafts) {\n    if (seen.has(draft.idempotencyKey)) {\n      duplicates.add(draft.idempotencyKey);\n    } else {\n      seen.add(draft.idempotencyKey);\n    }\n  }\n  return [...duplicates];\n}\n\nexport default defineTool({\n  description:\n    \"Create one or more X draft candidates in Typefully. Each draft requires a stable idempotencyKey so a replayed step does not duplicate the draft. The target social set, tag, and madeWithAi disclosure come from configuration and cannot be overridden via input. Always call preview_x_draft first. Drafts are saved (not scheduled and not published). When madeWithAi is enabled (default), every X post is labeled as made with AI per X's content disclosure policy.\",\n  inputSchema: payloadSchema,\n  async execute({ drafts, confirmCreate }): Promise<CreateXDraftsOutput> {\n    const apiKey = process.env.TYPEFULLY_API_KEY;\n    const madeWithAi = hotTopicConfig.draft.madeWithAi;\n    if (!apiKey) {\n      return {\n        socialSetId: hotTopicConfig.draft.socialSetId ?? \"\",\n        madeWithAi,\n        createdCount: 0,\n        replayedCount: 0,\n        failedCount: drafts.length,\n        drafts: drafts.map((draft) => ({\n          idempotencyKey: draft.idempotencyKey,\n          title: draft.title,\n          created: false,\n          error: { message: \"Missing TYPEFULLY_API_KEY environment variable.\" },\n        })),\n      };\n    }\n\n    if (!confirmCreate) {\n      return {\n        socialSetId: hotTopicConfig.draft.socialSetId ?? \"\",\n        madeWithAi,\n        createdCount: 0,\n        replayedCount: 0,\n        failedCount: drafts.length,\n        drafts: drafts.map((draft) => ({\n          idempotencyKey: draft.idempotencyKey,\n          title: draft.title,\n          created: false,\n          error: {\n            message:\n              \"confirmCreate must be true to create drafts. Call preview_x_draft to review them first.\",\n          },\n        })),\n      };\n    }\n\n    const socialSetId = hotTopicConfig.draft.socialSetId;\n    if (!socialSetId) {\n      return {\n        socialSetId: \"\",\n        madeWithAi,\n        createdCount: 0,\n        replayedCount: 0,\n        failedCount: drafts.length,\n        drafts: drafts.map((draft) => ({\n          idempotencyKey: draft.idempotencyKey,\n          title: draft.title,\n          created: false,\n          error: { message: \"Missing TYPEFULLY_SOCIAL_SET_ID environment variable.\" },\n        })),\n      };\n    }\n\n    const duplicates = duplicateIdempotencyKeys(drafts);\n    if (duplicates.length > 0) {\n      return {\n        socialSetId,\n        madeWithAi,\n        createdCount: 0,\n        replayedCount: 0,\n        failedCount: drafts.length,\n        drafts: drafts.map((draft) => ({\n          idempotencyKey: draft.idempotencyKey,\n          title: draft.title,\n          created: false,\n          error: {\n            message: `Duplicate idempotencyKey \"${draft.idempotencyKey}\". Each draft needs a unique key.`,\n          },\n        })),\n      };\n    }\n\n    const tag = hotTopicConfig.draft.tag;\n    const tags = tag ? [tag] : undefined;\n    const results: (CreatedDraft | ReplayedDraft | FailedDraft)[] = [];\n\n    for (const draft of drafts) {\n      const cached = createdCache.get(draft.idempotencyKey);\n      if (cached) {\n        results.push({\n          idempotencyKey: draft.idempotencyKey,\n          title: draft.title,\n          replayed: true,\n          draftId: cached.response.id,\n          socialSetId: cached.socialSetId,\n          privateUrl: cached.response.private_url,\n        });\n        continue;\n      }\n\n      try {\n        const response = await createTypefullyDraft(\n          {\n            socialSetId,\n            posts: draft.posts.map((post) => ({ text: post, madeWithAi })),\n            draftTitle: draft.title,\n            scratchpad: draft.scratchpad,\n            tags,\n          },\n          apiKey,\n        );\n        createdCache.set(draft.idempotencyKey, {\n          title: draft.title,\n          socialSetId,\n          response,\n        });\n        results.push({\n          idempotencyKey: draft.idempotencyKey,\n          title: draft.title,\n          created: true,\n          draftId: response.id,\n          socialSetId,\n          privateUrl: response.private_url,\n          preview: response.preview,\n          status: response.status,\n        });\n      } catch (error) {\n        const message =\n          error instanceof TypefullyApiError\n            ? error.message\n            : error instanceof Error\n              ? error.message\n              : String(error);\n        const failedDraft: FailedDraft =\n          error instanceof TypefullyApiError\n            ? {\n                idempotencyKey: draft.idempotencyKey,\n                title: draft.title,\n                created: false,\n                error: { message, status: error.status },\n              }\n            : {\n                idempotencyKey: draft.idempotencyKey,\n                title: draft.title,\n                created: false,\n                error: { message },\n              };\n        results.push(failedDraft);\n      }\n    }\n\n    const createdCount = results.filter(isCreatedDraft).length;\n    const replayedCount = results.filter(isReplayedDraft).length;\n    const failedCount = results.filter(isFailedDraft).length;\n\n    return {\n      socialSetId,\n      madeWithAi,\n      ...(tag ? { tag } : {}),\n      createdCount,\n      replayedCount,\n      failedCount,\n      drafts: results,\n    };\n  },\n});\n\nfunction isCreatedDraft(draft: CreatedDraft | ReplayedDraft | FailedDraft): draft is CreatedDraft {\n  return \"created\" in draft && draft.created === true;\n}\n\nfunction isReplayedDraft(\n  draft: CreatedDraft | ReplayedDraft | FailedDraft,\n): draft is ReplayedDraft {\n  return \"replayed\" in draft;\n}\n\nfunction isFailedDraft(draft: CreatedDraft | ReplayedDraft | FailedDraft): draft is FailedDraft {\n  return \"created\" in draft && draft.created === false;\n}\n"
      },
      {
        "path": "agent/tools/preview_x_draft.ts",
        "type": "registry:file",
        "target": "~/agent/tools/preview_x_draft.ts",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nimport { hotTopicConfig } from \"../lib/hot-topic-config.js\";\n\nconst X_POST_MAX_CHARS = 280;\n\nconst postSchema = z\n  .string()\n  .min(1)\n  .max(X_POST_MAX_CHARS, `X posts must be at most ${X_POST_MAX_CHARS} characters.`);\n\nconst draftSchema = z.object({\n  title: z\n    .string()\n    .min(1)\n    .max(120)\n    .describe(\"Internal Typefully draft title. Not posted to social media.\"),\n  posts: z\n    .array(postSchema)\n    .min(1)\n    .max(25)\n    .describe(\n      \"Ordered X posts that make up the draft. A single post is a tweet; multiple posts are a thread.\",\n    ),\n  scratchpad: z\n    .string()\n    .max(2_000)\n    .optional()\n    .describe(\n      \"Optional private notes attached to the draft in Typefully. Not posted to social media.\",\n    ),\n});\n\nconst draftsSchema = z\n  .array(draftSchema)\n  .min(1)\n  .max(5)\n  .describe(\"Up to 5 X draft candidates to preview before creating them in Typefully.\");\n\nexport default defineTool({\n  description:\n    \"Preview one or more X draft candidates without creating them in Typefully. Validates each post against the 280-character X limit, the post count per draft, and resolves the target social set from configuration. Returns the exact payload that create_x_drafts would send, including the madeWithAi flag from configuration. The target social set and tag come from configuration and cannot be overridden via input. Always call preview_x_draft before create_x_drafts.\",\n  inputSchema: z.object({\n    drafts: draftsSchema,\n  }),\n  async execute({ drafts }) {\n    const apiKey = process.env.TYPEFULLY_API_KEY;\n    if (!apiKey) {\n      return { authRequired: true, missingEnv: \"TYPEFULLY_API_KEY\" };\n    }\n\n    const socialSetId = hotTopicConfig.draft.socialSetId;\n    if (!socialSetId) {\n      return { notConfigured: true, missingEnv: \"TYPEFULLY_SOCIAL_SET_ID\" };\n    }\n\n    return {\n      dryRun: true,\n      socialSetId,\n      tag: hotTopicConfig.draft.tag ?? null,\n      madeWithAi: hotTopicConfig.draft.madeWithAi,\n      draftCount: drafts.length,\n      drafts: drafts.map((draft) => ({\n        title: draft.title,\n        postCount: draft.posts.length,\n        posts: draft.posts,\n        postChars: draft.posts.map((post) => post.length),\n        maxChars: X_POST_MAX_CHARS,\n        madeWithAi: hotTopicConfig.draft.madeWithAi,\n        scratchpad: draft.scratchpad ?? null,\n      })),\n    };\n  },\n});\n"
      },
      {
        "path": "agent/tools/research_hot_topics.ts",
        "type": "registry:file",
        "target": "~/agent/tools/research_hot_topics.ts",
        "content": "import Parallel from \"parallel-web\";\nimport { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nimport { hotTopicConfig } from \"../lib/hot-topic-config.js\";\n\nexport default defineTool({\n  description:\n    \"Research a hot topic with the Parallel web search API and return ranked excerpts with provenance.\",\n  inputSchema: z.object({\n    topic: z.string().min(1).describe(\"The hot topic to research, in natural language.\"),\n    searchQueries: z\n      .array(z.string().min(1))\n      .min(1)\n      .max(5)\n      .describe(\"2-3 concise keyword queries (3-6 words each) to focus the search.\"),\n    maxResults: z\n      .number()\n      .int()\n      .min(1)\n      .max(10)\n      .optional()\n      .describe(\"Upper bound on returned results. Defaults to the agent config.\"),\n  }),\n  async execute({ topic, searchQueries, maxResults }) {\n    const apiKey = process.env.PARALLEL_API_KEY;\n    if (!apiKey) {\n      return { authRequired: true, missingEnv: \"PARALLEL_API_KEY\", topic };\n    }\n\n    const client = new Parallel({ apiKey });\n    const { results } = await client.search({\n      objective: `Research the following hot topic surfaced from X: ${topic}`,\n      search_queries: searchQueries,\n      mode: hotTopicConfig.searchMode,\n      advanced_settings: {\n        max_results: maxResults ?? hotTopicConfig.searchMaxResults,\n      },\n    });\n\n    return {\n      topic,\n      resultCount: results.length,\n      results: results.map((entry) => ({\n        url: entry.url,\n        title: entry.title ?? null,\n        publishDate: entry.publish_date ?? null,\n        excerpts: entry.excerpts,\n      })),\n    };\n  },\n});\n"
      },
      {
        "path": "agent/tools/scan_x_profiles.ts",
        "type": "registry:file",
        "target": "~/agent/tools/scan_x_profiles.ts",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nimport { getLookbackStartTime, hotTopicConfig } from \"../lib/hot-topic-config.js\";\n\nconst X_API_BASE = \"https://api.x.com/2\";\nconst TWEET_FIELDS = \"created_at,public_metrics,entities,lang\";\nconst EXCLUDE = \"retweets\";\nconst MIN_MAX_RESULTS = 5;\nconst MAX_MAX_RESULTS = 100;\n\ntype XPublicMetrics = {\n  readonly impression_count?: number;\n  readonly like_count?: number;\n  readonly reply_count?: number;\n  readonly retweet_count?: number;\n  readonly quote_count?: number;\n  readonly bookmark_count?: number;\n};\n\ntype XTweet = {\n  readonly id: string;\n  readonly text: string;\n  readonly created_at?: string;\n  readonly lang?: string;\n  readonly public_metrics?: XPublicMetrics;\n};\n\ntype XUserLookupResponse = {\n  readonly data?: { readonly id: string; readonly name: string; readonly username: string };\n};\n\ntype XTweetsResponse = {\n  readonly data?: readonly XTweet[];\n  readonly meta?: { readonly result_count?: number; readonly newest_id?: string };\n};\n\nconst userIdCache = new Map<string, string>();\n\nasync function xFetch<T>(path: string, searchParams?: URLSearchParams): Promise<T> {\n  const bearer = process.env.X_BEARER_TOKEN;\n  if (!bearer) {\n    throw new Error(\"Missing X_BEARER_TOKEN environment variable.\");\n  }\n\n  const url = searchParams ? `${path}?${searchParams.toString()}` : path;\n  const response = await fetch(`${X_API_BASE}${url}`, {\n    headers: { Authorization: `Bearer ${bearer}` },\n  });\n\n  if (!response.ok) {\n    const body = await response.text();\n    throw new Error(`X API ${response.status} for ${path}: ${body.slice(0, 500)}`);\n  }\n\n  return (await response.json()) as T;\n}\n\nasync function resolveUserId(handle: string): Promise<string> {\n  const normalized = handle.replace(/^@/, \"\");\n  const cached = userIdCache.get(normalized);\n  if (cached) return cached;\n\n  const lookup = await xFetch<XUserLookupResponse>(\n    `/users/by/username/${encodeURIComponent(normalized)}`,\n  );\n  if (!lookup.data?.id) {\n    throw new Error(`Could not resolve X user id for @${normalized}.`);\n  }\n\n  userIdCache.set(normalized, lookup.data.id);\n  return lookup.data.id;\n}\n\nasync function fetchUserTweets(handle: string, startTime: string): Promise<readonly XTweet[]> {\n  const userId = await resolveUserId(handle);\n  const maxResults = Math.min(\n    Math.max(hotTopicConfig.maxTweetsPerProfile, MIN_MAX_RESULTS),\n    MAX_MAX_RESULTS,\n  );\n  const params = new URLSearchParams({\n    max_results: maxResults.toString(),\n    \"tweet.fields\": TWEET_FIELDS,\n    exclude: EXCLUDE,\n    start_time: startTime,\n  });\n\n  const payload = await xFetch<XTweetsResponse>(`/users/${userId}/tweets`, params);\n  return payload.data ?? [];\n}\n\nfunction withinLookback(tweet: XTweet, startTimeMs: number): boolean {\n  if (!tweet.created_at) return false;\n  const createdAt = Date.parse(tweet.created_at);\n  return Number.isFinite(createdAt) && createdAt >= startTimeMs;\n}\n\nfunction summarizeTweet(tweet: XTweet) {\n  return {\n    id: tweet.id,\n    text: tweet.text,\n    createdAt: tweet.created_at,\n    lang: tweet.lang,\n    likes: tweet.public_metrics?.like_count ?? 0,\n    replies: tweet.public_metrics?.reply_count ?? 0,\n    reposts: tweet.public_metrics?.retweet_count ?? 0,\n    quotes: tweet.public_metrics?.quote_count ?? 0,\n    impressions: tweet.public_metrics?.impression_count ?? 0,\n  };\n}\n\nexport default defineTool({\n  description:\n    \"Scan configured X (Twitter) profiles for recent posts to surface hot topics. Uses X API v2 app-only bearer auth.\",\n  inputSchema: z.object({\n    handles: z\n      .array(z.string().min(1))\n      .optional()\n      .describe(\n        \"X handles to scan. Defaults to the X_HOT_TOPIC_HANDLES environment variable.\",\n      ),\n  }),\n  async execute({ handles }) {\n    const bearer = process.env.X_BEARER_TOKEN;\n    if (!bearer) {\n      return { authRequired: true, missingEnv: \"X_BEARER_TOKEN\" };\n    }\n\n    const targetHandles = handles?.length ? handles : hotTopicConfig.handles;\n    if (targetHandles.length === 0) {\n      return {\n        scannedProfiles: 0,\n        profiles: [],\n        note: \"No handles configured. Set X_HOT_TOPIC_HANDLES or pass handles explicitly.\",\n      };\n    }\n\n    const startTime = getLookbackStartTime();\n    const startTimeMs = Date.parse(startTime);\n\n    const profiles = [];\n    for (const handle of targetHandles) {\n      try {\n        const tweets = (await fetchUserTweets(handle, startTime)).filter((tweet) =>\n          withinLookback(tweet, startTimeMs),\n        );\n        profiles.push({\n          handle,\n          ok: true,\n          tweetCount: tweets.length,\n          tweets: tweets.map(summarizeTweet),\n        });\n      } catch (error) {\n        profiles.push({\n          handle,\n          ok: false,\n          error: error instanceof Error ? error.message : String(error),\n        });\n      }\n    }\n\n    const totalTweets = profiles.reduce(\n      (sum, profile) => sum + (profile.ok ? (profile.tweetCount ?? 0) : 0),\n      0,\n    );\n\n    return {\n      scannedProfiles: profiles.length,\n      totalTweets,\n      lookbackHours: hotTopicConfig.lookbackHours,\n      windowStart: startTime,\n      profiles,\n    };\n  },\n});\n"
      },
      {
        "path": "evals/evals.config.ts",
        "type": "registry:file",
        "target": "~/evals/evals.config.ts",
        "content": "import { defineEvalConfig } from \"eve/evals\";\n\nexport default defineEvalConfig({\n  timeoutMs: 120_000,\n});\n"
      },
      {
        "path": "evals/x-draft-assistant.eval.ts",
        "type": "registry:file",
        "target": "~/evals/x-draft-assistant.eval.ts",
        "content": "import { defineEval } from \"eve/evals\";\nimport { includes } from \"eve/evals/expect\";\n\nexport default defineEval({\n  description:\n    \"Scans a sample of X posts, researches hot topics with Parallel, and previews three X draft candidates without creating them in Typefully.\",\n  async test(t) {\n    await t.send(`\nRun the daily X hot topic Typefully drafts for the following sample posts.\n\nWatched handles: vercel, parallel_ai\n\nSample scan_x_profiles output:\n{\n  \"scannedProfiles\": 2,\n  \"totalTweets\": 2,\n  \"lookbackHours\": 24,\n  \"windowStart\": \"2026-06-25T08:00:00Z\",\n  \"profiles\": [\n    {\n      \"handle\": \"vercel\",\n      \"ok\": true,\n      \"tweetCount\": 1,\n      \"tweets\": [\n        {\n          \"id\": \"1700000000000000001\",\n          \"text\": \"We just shipped AI SDK 5 with native agent loops and durable execution.\",\n          \"createdAt\": \"2026-06-26T07:00:00.000Z\",\n          \"likes\": 320,\n          \"replies\": 22,\n          \"reposts\": 45,\n          \"quotes\": 8,\n          \"impressions\": 12000\n        }\n      ]\n    },\n    {\n      \"handle\": \"parallel_ai\",\n      \"ok\": true,\n      \"tweetCount\": 1,\n      \"tweets\": [\n        {\n          \"id\": \"1700000000000000002\",\n          \"text\": \"Parallel Monitor API is now GA: web change events streamed to proactive agents.\",\n          \"createdAt\": \"2026-06-26T07:30:00.000Z\",\n          \"likes\": 210,\n          \"replies\": 14,\n          \"reposts\": 33,\n          \"quotes\": 5,\n          \"impressions\": 9000\n        }\n      ]\n    }\n  ]\n}\n\nSurface up to 2 hot topics, research each with research_hot_topics, then draft exactly 3 distinct X post candidates and preview them with preview_x_draft. Do not call create_x_drafts in this run.\n`);\n\n    t.succeeded();\n    t.noFailedActions();\n    t.calledTool(\"research_hot_topics\").gate();\n    t.calledTool(\"preview_x_draft\").gate();\n    t.notCalledTool(\"create_x_drafts\").gate();\n    t.check(t.reply, includes(\"dryRun\").soft());\n    const replyLower = (t.reply ?? \"\").toLowerCase();\n    t.check(replyLower, includes(\"made with ai\").soft());\n  },\n});\n"
      },
      {
        "path": "evals/create-confirmation.eval.ts",
        "type": "registry:file",
        "target": "~/evals/create-confirmation.eval.ts",
        "content": "import { defineEval } from \"eve/evals\";\nimport { equals, includes } from \"eve/evals/expect\";\n\nexport default defineEval({\n  description:\n    \"Confirms the create path requires confirmCreate=true and a stable, unique idempotencyKey per draft, that madeWithAi/socialSetId/tag are never passed as tool input (they come from config), and that the reply mentions the X made-with-AI disclosure.\",\n  async test(t) {\n    const turn = await t.send(`\nThe three X draft candidates have been previewed with preview_x_draft and the user has approved creating them in Typefully. The scan_x_profiles run for this batch reported windowStart=2026-06-26T08:00:00Z.\n\nNow create the drafts with create_x_drafts. Use the lookback window start and the candidate index to build a stable, unique idempotencyKey per draft such as x-draft-assistant-2026-06-26T08:00:00Z-1, x-draft-assistant-2026-06-26T08:00:00Z-2, and x-draft-assistant-2026-06-26T08:00:00Z-3. Set confirmCreate=true. If you would otherwise create without confirmCreate=true, do not create and report that confirmation is required instead.\n`);\n\n    const call = turn.requireToolCall(\"create_x_drafts\");\n    t.check(call.input.confirmCreate, equals(true).gate());\n    const drafts = call.input.drafts as readonly { idempotencyKey?: string }[];\n    t.check(drafts.length === 3, equals(true).gate());\n    const keys = new Set<string>();\n    let allKeysUnique = true;\n    for (const draft of drafts) {\n      const key = draft.idempotencyKey;\n      if (typeof key !== \"string\" || key.length === 0 || keys.has(key)) {\n        allKeysUnique = false;\n      }\n      keys.add(key ?? \"\");\n    }\n    t.check(allKeysUnique, equals(true).gate());\n    t.check(call.input.socialSetId === undefined, equals(true).soft());\n    t.check(call.input.tag === undefined, equals(true).soft());\n    t.check(call.input.madeWithAi === undefined, equals(true).soft());\n    t.check(t.reply, includes(\"x-draft-assistant-2026-06-26T08:00:00Z-1\").soft());\n    const replyLower = (t.reply ?? \"\").toLowerCase();\n    t.check(replyLower, includes(\"made with ai\").soft());\n  },\n});\n"
      },
      {
        "path": "evals/missing-config-does-not-create.eval.ts",
        "type": "registry:file",
        "target": "~/evals/missing-config-does-not-create.eval.ts",
        "content": "import { defineEval } from \"eve/evals\";\nimport { includes } from \"eve/evals/expect\";\n\nexport default defineEval({\n  description:\n    \"When required configuration is missing, the agent stops and reports it instead of creating any Typefully drafts.\",\n  async test(t) {\n    await t.send(`\nRun the daily X hot topic Typefully drafts.\n\nThe scan_x_profiles tool returned:\n\n{\n  \"authRequired\": true,\n  \"missingEnv\": \"X_BEARER_TOKEN\"\n}\n\nNo handles could be scanned because the X bearer token is not configured. Proceed according to the instructions: do not invent handles, topics, sources, or draft text, and do not call create_x_drafts or preview_x_draft. Report the missing configuration clearly.\n`);\n\n    t.succeeded();\n    t.noFailedActions();\n    t.notCalledTool(\"create_x_drafts\").gate();\n    t.notCalledTool(\"preview_x_draft\").gate();\n    t.check(t.reply, includes(\"X_BEARER_TOKEN\").gate());\n  },\n});\n"
      },
      {
        "path": "README.md",
        "type": "registry:file",
        "target": "~/agent/README.md",
        "content": "# X Draft Assistant\n\nA scheduled Eve agent that scans a configured set of X (Twitter) profiles every day, surfaces hot topics from their recent posts, researches each topic with the [Parallel](https://parallel.ai/) web search API, and creates **three draft candidates** for X in [Typefully](https://typefully.com) so a human can review and publish them.\n\nIt runs on a cron schedule, reads only public posts via the X API v2, previews every draft in dry-run mode before creating anything for real, and never schedules or publishes the drafts.\n\n## What it does\n\n1. **Scan X profiles** \u2014 pulls recent posts (excluding retweets) from each handle in `X_HOT_TOPIC_HANDLES` using X API v2 app-only bearer auth.\n2. **Surface hot topics** \u2014 clusters the posts into up to `X_HOT_TOPIC_MAX_TOPICS` themes based on recurrence and engagement.\n3. **Research with Parallel** \u2014 for each topic, calls the Parallel Search API with focused keyword queries and returns ranked web sources with provenance.\n4. **Draft three X post candidates** \u2014 writes exactly `X_HOT_TOPIC_DRAFT_COUNT` (default 3) distinct candidates from the researched topics. Each candidate is either a single tweet or a short thread (1-5 posts), each post at most 280 characters, each candidate a different angle on the same signal.\n5. **Create drafts in Typefully** \u2014 previews every candidate with `preview_x_draft`, then creates them in Typefully through `create_x_drafts` only when `confirmCreate: true` and a stable, unique `idempotencyKey` per draft are provided. The idempotency key is held in an in-process cache and reused if Eve replays the step, so a retried create never produces a duplicate draft.\n\n## Installation\n\n```bash\nnpx shadcn@latest add https://evex.sh/r/x-draft-assistant\n```\n\n## Configuration\n\nCopy `.env.example` into your Eve app environment and fill in the values.\n\n### X credentials\n\n- `X_BEARER_TOKEN` \u2014 app-only bearer token from the X Developer Console. Required to read public posts.\n\n### Watched profiles and schedule\n\n- `X_HOT_TOPIC_HANDLES` \u2014 comma-separated X handles to scan (with or without `@`). Example: `vercel,parallel_ai,anthropicai`.\n- `X_HOT_TOPIC_DAILY_CRON` \u2014 5-field cron expression (UTC on Vercel). Defaults to `0 8 * * *` (daily at 08:00 UTC).\n- `X_HOT_TOPIC_LOOKBACK_HOURS` \u2014 lookback window in hours for posts to scan. Defaults to `24`, so each daily run only sees posts from the last 24 hours and does not repeat the same topics day over day. Set it lower for more frequent runs or higher for low-volume handles.\n- `X_HOT_TOPIC_MAX_TWEETS_PER_PROFILE` \u2014 max posts fetched per profile. Defaults to `20`. Clamped to the X API maximum of 100 and the minimum of 5; values above 100 are silently lowered to 100 rather than rejected, so a misconfigured run still returns posts instead of a 400.\n- `X_HOT_TOPIC_MAX_TOPICS` \u2014 max hot topics surfaced per run. Defaults to `5`.\n- `X_HOT_TOPIC_SEARCH_MAX_RESULTS` \u2014 max Parallel search results per topic. Defaults to `5`.\n- `X_HOT_TOPIC_SEARCH_MODE` \u2014 Parallel search mode: `turbo`, `basic`, or `advanced`. Defaults to `basic`.\n\n### Draft candidates\n\n- `X_HOT_TOPIC_DRAFT_COUNT` \u2014 number of distinct X draft candidates to produce per run. Defaults to `3`.\n- `X_HOT_TOPIC_DRAFT_MADE_WITH_AI` \u2014 whether to label every X post with the X \"made with AI\" content disclosure. Defaults to `true` because the agent drafts posts with an LLM. Set to `false` only if a human rewrites the posts before publishing.\n- `X_HOT_TOPIC_DRAFT_TAG` \u2014 optional Typefully tag slug to attach to every created draft. Tags must already exist in the social set; the agent does not create tags. Leave empty to skip tagging.\n\n### Typefully credentials\n\n- `TYPEFULLY_API_KEY` \u2014 Typefully API key from [typefully.com/?settings=api](https://typefully.com/?settings=api).\n- `TYPEFULLY_SOCIAL_SET_ID` \u2014 the Typefully social set id (the account) to create drafts under. Find it by listing your social sets via the Typefully API, or copy it from the Typefully URL for the account you want to post to.\n\nCreating drafts is a two-step, exactly-once-safe operation by design: the agent calls `preview_x_draft` first, then `create_x_drafts` with `confirmCreate: true` and a unique `idempotencyKey` per draft. The Typefully v2 API does not accept a server-side idempotency key, so the agent holds an in-process cache of successful creates keyed by the caller-provided idempotency key. A replayed Eve step with the same key returns the recorded response with `replayed: true` instead of issuing a second POST, so a retried create never duplicates a draft \u2014 as long as the replay happens in the same Node process. A replay that crosses a process boundary (serverless cold start, redeploy, restart) sees an empty cache and will POST again; a durable store (Redis, Postgres) would be needed to close that gap and is out of scope here. The recommended key is derived from the run's lookback window start (`scan_x_profiles` `windowStart`), so it is unique per run even when the schedule fires more than once a day, and stable across retries of the same run.\n\nWhen `X_HOT_TOPIC_DRAFT_MADE_WITH_AI` is `true` (the default), every X post in every created draft is labeled with the X \"made with AI\" content disclosure, since the agent drafts posts with an LLM. Set it to `false` only if a human rewrites the posts before publishing.\n\n### Parallel credentials\n\n- `PARALLEL_API_KEY` \u2014 Parallel API key from [platform.parallel.ai](https://platform.parallel.ai).\n\n## Smoke test\n\n1. Set `X_BEARER_TOKEN`, `PARALLEL_API_KEY`, `TYPEFULLY_API_KEY`, `TYPEFULLY_SOCIAL_SET_ID`, and at least one handle in `X_HOT_TOPIC_HANDLES`.\n2. Trigger the schedule while iterating in dev:\n\n   ```bash\n   curl -X POST http://localhost:3000/eve/v1/dev/schedules/daily-x-drafts\n   ```\n\n3. The agent should call `preview_x_draft` to review the three candidates. Creating is gated on `create_x_drafts` being called with `confirmCreate: true` and a unique `idempotencyKey` per draft, so a preview-only run creates nothing.\n4. After the run, open Typefully for the configured social set: the three drafts should appear in `draft` status, not scheduled and not published.\n\n## Troubleshooting\n\n- **`authRequired: missingEnv X_BEARER_TOKEN`** \u2014 the X bearer token is missing or empty.\n- **`Could not resolve X user id`** \u2014 a handle is wrong, suspended, or the app does not have access to user lookup.\n- **`authRequired: missingEnv PARALLEL_API_KEY`** \u2014 the Parallel API key is missing.\n- **`authRequired: missingEnv TYPEFULLY_API_KEY`** \u2014 the Typefully API key is missing.\n- **`notConfigured: missingEnv TYPEFULLY_SOCIAL_SET_ID`** \u2014 no social set configured. Set `TYPEFULLY_SOCIAL_SET_ID` to the Typefully account id you want to create drafts under.\n- **`notConfirmed: true`** \u2014 `create_x_drafts` was called without `confirmCreate: true`. Review the preview first, then call it with the flag set.\n- **`Duplicate idempotencyKey`** \u2014 two drafts in one `create_x_drafts` call shared a key. Each draft needs its own key (e.g. `x-draft-assistant-2026-06-26T08:00:00Z-1`, `-2`, `-3`).\n- **`Typefully API 404` for the social set** \u2014 `TYPEFULLY_SOCIAL_SET_ID` points at a social set the API key cannot access. Confirm the id and that the key belongs to the same user or team.\n- **`Typefully API 429`** \u2014 draft creation rate limit hit. Do not retry inside the same step; defer to a later run and reuse the same idempotency keys so a successful retry does not duplicate the drafts.\n- **No drafts appear in Typefully** \u2014 the agent only creates drafts when `create_x_drafts` is called with `confirmCreate: true` and a unique `idempotencyKey` per draft. Confirm the run reached the create step and that `TYPEFULLY_SOCIAL_SET_ID` matches the account you are looking at.\n\n## X automation compliance\n\nThe agent only creates drafts \u2014 it never publishes, schedules, replies, likes, or reposts. Each run produces at most three drafts with distinct text, never duplicates, never sets a reply target unless the user explicitly asks for a reply to a specific post, and labels every X post with the \"made with AI\" disclosure by default (configurable via `X_HOT_TOPIC_DRAFT_MADE_WITH_AI`) since the posts are drafted by an LLM. See the `typefully-best-practices` skill loaded by the agent for the full compliance model.\n\n## Development\n\n```bash\npnpm install\npnpm dev\n```\n\nRun `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.\n"
      },
      {
        "path": ".env.example",
        "type": "registry:file",
        "target": "~/.env.example",
        "content": "X_BEARER_TOKEN=\n\nX_HOT_TOPIC_HANDLES=\n\nX_HOT_TOPIC_DAILY_CRON=\"0 8 * * *\"\nX_HOT_TOPIC_LOOKBACK_HOURS=24\nX_HOT_TOPIC_MAX_TWEETS_PER_PROFILE=20\nX_HOT_TOPIC_MAX_TOPICS=5\nX_HOT_TOPIC_SEARCH_MAX_RESULTS=5\nX_HOT_TOPIC_SEARCH_MODE=basic\n\nX_HOT_TOPIC_DRAFT_COUNT=3\nX_HOT_TOPIC_DRAFT_MADE_WITH_AI=true\nX_HOT_TOPIC_DRAFT_TAG=\n\nPARALLEL_API_KEY=\nTYPEFULLY_API_KEY=\nTYPEFULLY_SOCIAL_SET_ID=\n"
      }
    ]
  },
  "x-hot-topic-digest": {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "x-hot-topic-digest",
    "type": "registry:item",
    "title": "X Hot Topic Digest",
    "description": "A scheduled Eve agent that scans a configured set of X (Twitter) profiles every day, surfaces hot topics from their recent posts, researches each topic with the Parallel web search API, and delivers an HTML digest by email through Resend.",
    "categories": [
      "research"
    ],
    "dependencies": [
      "eve@^0.15.1",
      "parallel-web@^1.1.0",
      "resend@^6.14.0",
      "zod@4.3.6"
    ],
    "meta": {
      "slug": "x-hot-topic-digest",
      "category": "research",
      "createdAt": "2026-06-26T09:40:22.348Z",
      "updatedAt": "2026-06-26T10:50:00.000Z"
    },
    "author": "TommyBez",
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
        "content": "# Mission\nProduce a daily digest of hot topics from a watched set of X (Twitter) profiles, researched with the Parallel web search API, and delivered by email through Resend.\n\n# Workflow\n1. Load the email-best-practices skill before drafting or sending the digest email.\n2. Use scan_x_profiles to pull recent posts from every configured handle, scoped to the last `X_HOT_TOPIC_LOOKBACK_HOURS` (default 24). If no handles are configured, stop and report the missing configuration instead of inventing profiles. Only treat posts inside the lookback window as hot-topic candidates, so the digest does not repeat the same topics day over day.\n3. From the returned posts, surface up to `X_HOT_TOPIC_MAX_TOPICS` hot topics. A hot topic is a recurring theme, announcement, launch, debate, or signal that appears across posts or that carries outsized engagement for a profile. Cluster near-duplicates into a single topic.\n4. For each hot topic, use research_hot_topics with 2-3 focused keyword queries to gather ranked web sources with provenance. Skip research for topics that are too vague to query.\n5. Compose a single digest email in HTML following the email-best-practices accessibility rules:\n   - a short intro naming the date and watched handles\n   - one section per hot topic with: a one-line takeaway, the originating X posts (handle, snippet, link `https://x.com/<handle>/status/<id>`), and the Parallel research sources (title, url, short excerpt)\n   - a closing note distinguishing observed X signal from web research\n6. Always call preview_digest_email first to review the exact recipients, sender, subject, and HTML. Recipients and sender come from `X_HOT_TOPIC_DIGEST_TO` / `X_HOT_TOPIC_DIGEST_FROM` and cannot be overridden through tool input \u2014 never try to pass `to` or `from` to the send tool.\n7. To send for real, call send_digest_email with `confirmSend: true` and a stable `idempotencyKey` derived from the digest date (for example `x-hot-topic-digest-YYYY-MM-DD`). Never call send_digest_email without an idempotencyKey. The idempotency key makes a replayed step safe, so reuse the same key if the step is retried. If send_digest_email returns `sent: false` with an `error`, report the error and do not treat the digest as delivered.\n\n# Output contract\nReturn:\n- the list of hot topics with origin posts and research sources\n- the email preview from preview_digest_email\n- the send result from send_digest_email when it was called, including the idempotencyKey\n- any missing configuration that blocked a step\n\n# Guardrails\n- Do not post on X. This agent only reads public posts and sends email.\n- Do not fabricate URLs, excerpts, or post ids. Every citation must come from a tool result.\n- If a tool reports `authRequired` or `notConfigured`, stop and report it instead of proceeding.\n"
      },
      {
        "path": "agent/lib/hot-topic-config.ts",
        "type": "registry:file",
        "target": "~/agent/lib/hot-topic-config.ts",
        "content": "export type HotTopicConfig = {\n  readonly handles: readonly string[];\n  readonly dailyCron: string;\n  readonly lookbackHours: number;\n  readonly maxTweetsPerProfile: number;\n  readonly maxHotTopics: number;\n  readonly searchMaxResults: number;\n  readonly searchMode: \"turbo\" | \"basic\" | \"advanced\";\n  readonly digest: {\n    readonly from?: string;\n    readonly to: readonly string[];\n    readonly subject: string;\n  };\n};\n\nconst DEFAULT_MAX_TWEETS_PER_PROFILE = 20;\nconst DEFAULT_MAX_HOT_TOPICS = 5;\nconst DEFAULT_SEARCH_MAX_RESULTS = 5;\nconst DEFAULT_SEARCH_MODE = \"basic\";\nconst DEFAULT_DAILY_CRON = \"0 8 * * *\";\nconst DEFAULT_LOOKBACK_HOURS = 24;\nconst DEFAULT_SUBJECT = \"X Hot Topic Digest\";\n\nconst compactCsv = (value: string | undefined): string[] =>\n  (value ?? \"\")\n    .split(\",\")\n    .map((item) => item.trim())\n    .filter(Boolean);\n\nconst optional = (value: string | undefined): string | undefined => {\n  const trimmed = value?.trim();\n  return trimmed ? trimmed : undefined;\n};\n\nconst parsePositiveInteger = (value: string | undefined, fallback: number): number => {\n  const parsed = Number.parseInt(value ?? \"\", 10);\n  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;\n};\n\nconst parseSearchMode = (value: string | undefined): \"turbo\" | \"basic\" | \"advanced\" => {\n  const trimmed = value?.trim().toLowerCase();\n  if (trimmed === \"turbo\" || trimmed === \"basic\" || trimmed === \"advanced\") {\n    return trimmed;\n  }\n  return DEFAULT_SEARCH_MODE;\n};\n\nconst parseEmailList = (value: string | undefined): string[] => compactCsv(value);\n\nconst toRfc3339Utc = (date: Date): string =>\n  date.toISOString().replace(/\\.\\d{3}Z$/, \"Z\");\n\nexport const getLookbackStartTime = (now: Date = new Date()): string =>\n  toRfc3339Utc(new Date(now.getTime() - hotTopicConfig.lookbackHours * 60 * 60 * 1000));\n\nexport const hotTopicConfig = {\n  handles: compactCsv(process.env.X_HOT_TOPIC_HANDLES),\n  dailyCron: optional(process.env.X_HOT_TOPIC_DAILY_CRON) ?? DEFAULT_DAILY_CRON,\n  lookbackHours: parsePositiveInteger(\n    process.env.X_HOT_TOPIC_LOOKBACK_HOURS,\n    DEFAULT_LOOKBACK_HOURS,\n  ),\n  maxTweetsPerProfile: parsePositiveInteger(\n    process.env.X_HOT_TOPIC_MAX_TWEETS_PER_PROFILE,\n    DEFAULT_MAX_TWEETS_PER_PROFILE,\n  ),\n  maxHotTopics: parsePositiveInteger(\n    process.env.X_HOT_TOPIC_MAX_TOPICS,\n    DEFAULT_MAX_HOT_TOPICS,\n  ),\n  searchMaxResults: parsePositiveInteger(\n    process.env.X_HOT_TOPIC_SEARCH_MAX_RESULTS,\n    DEFAULT_SEARCH_MAX_RESULTS,\n  ),\n  searchMode: parseSearchMode(process.env.X_HOT_TOPIC_SEARCH_MODE),\n  digest: {\n    from: optional(process.env.X_HOT_TOPIC_DIGEST_FROM),\n    to: parseEmailList(process.env.X_HOT_TOPIC_DIGEST_TO),\n    subject: optional(process.env.X_HOT_TOPIC_DIGEST_SUBJECT) ?? DEFAULT_SUBJECT,\n  },\n} satisfies HotTopicConfig;\n"
      },
      {
        "path": "agent/schedules/daily-hot-topic-digest.ts",
        "type": "registry:file",
        "target": "~/agent/schedules/daily-hot-topic-digest.ts",
        "content": "import { defineSchedule } from \"eve/schedules\";\n\nimport { hotTopicConfig } from \"../lib/hot-topic-config.js\";\n\nexport default defineSchedule({\n  cron: hotTopicConfig.dailyCron,\n  markdown: `Run the daily X hot topic digest.\n\n1. Use scan_x_profiles to scan every handle configured in X_HOT_TOPIC_HANDLES, scoped to the last ${hotTopicConfig.lookbackHours} hours (X_HOT_TOPIC_LOOKBACK_HOURS). Only treat posts inside the lookback window as hot-topic candidates.\n2. Surface up to ${hotTopicConfig.maxHotTopics} hot topics from those posts.\n3. For each topic, call research_hot_topics with focused keyword queries.\n4. Compose an HTML digest and call preview_digest_email to review the exact recipients, sender, subject, and HTML.\n5. To send for real, call send_digest_email with confirmSend=true and a stable idempotencyKey derived from today's date (for example x-hot-topic-digest-YYYY-MM-DD). Reuse the same idempotencyKey if the step is retried so a replayed send never duplicates the email.\n\nIf any required environment variable is missing (X_BEARER_TOKEN, PARALLEL_API_KEY, RESEND_API_KEY, X_HOT_TOPIC_DIGEST_FROM, X_HOT_TOPIC_DIGEST_TO), stop and report the missing configuration. Do not invent handles, topics, sources, or recipients. Never call send_digest_email without confirmSend=true and an idempotencyKey.`,\n});\n"
      },
      {
        "path": "agent/skills/email-best-practices/SKILL.md",
        "type": "registry:file",
        "target": "~/agent/skills/email-best-practices/SKILL.md",
        "content": "---\ndescription: Use when composing or sending transactional email through Resend \u2014 idempotent sends, deliverability, and accessible HTML.\n---\n\nGuidance for building deliverable, accessible, exactly-once transactional emails sent\nthrough an email API such as Resend. Apply the rules below whenever an email is being\ndrafted or sent.\n\n## Sending exactly once\n\nNetwork issues, timeouts, and server errors can leave a send's outcome uncertain.\nRetrying without protection duplicates the email. Use an idempotency key: a stable value\nderived from the business event, sent with the request, so a retried send with the same\nkey returns the original outcome instead of issuing a second email.\n\n- Derive the key from the event, not from `Date.now()` or a fresh random value per\n  attempt. The same logical send must produce the same key.\n- Keys are typically cached by the provider for ~24 hours; complete retries well within\n  that window.\n- Email APIs (including Resend) often resolve with `{ data, error }` rather than\n  throwing on failure. Check `error` before treating a send as delivered: an unverified\n  sender, invalid recipient, rate limit, or validation error comes back as an error\n  result, not a thrown exception.\n- A failed send should not be cached as a success. Only successful sends are safe to\n  short-circuit on replay; failures need to be retried with the same key.\n\nSee [sending-reliability](./references/sending-reliability.md) for the idempotency and\nretry model in detail.\n\n## Deliverability\n\nThe sender domain must be authenticated (SPF/DKIM/DMARC) and the sender address verified\nby the provider. Unverified senders are the most common cause of bounces and spam\nfiltering \u2014 Gmail and Yahoo reject unauthenticated email outright.\n\n## Composing accessible HTML\n\nEmail must be readable by screen readers, dark-mode clients, translation tools, and AI\nclients, not just sighted readers on a default inbox.\n\n- Set `lang` and `dir` on `<html>` and on `<body>`'s direct children (some clients strip\n  them from `<html>`).\n- Include a `<title>` that names the specific email, not just the brand.\n- Use one `<h1>` and nest `<h2>`/`<h3>` in order. Never skip levels or fake headings with\n  bold text.\n- Layout tables must carry `role=\"presentation\"`.\n- Every link must have discernible text that describes its destination \u2014 never \"click\n  here\", bare URLs, or linked images with empty alt.\n- Meaningful images need descriptive `alt`; decorative images need an explicit `alt=\"\"`.\n- Body text must pass 4.5:1 contrast and stay readable in dark mode.\n- Send a plain-text alternative alongside the HTML.\n\nSee [accessibility](./references/accessibility.md) for the full checklist and priority\norder.\n"
      },
      {
        "path": "agent/skills/email-best-practices/references/accessibility.md",
        "type": "registry:file",
        "target": "~/agent/skills/email-best-practices/references/accessibility.md",
        "content": "# Accessibility\n\nThe digest must be readable by screen readers, dark-mode clients, translation tools, and\nAI clients \u2014 not just sighted readers on a default inbox. Apply these rules every time\nthe digest HTML is composed.\n\n## Rules\n\n### Set `lang` and `dir` on `<html>` and on `<body>`'s direct children\n\nSeveral email clients strip these attributes from `<html>`, so duplicate them on the\nbody's direct children.\n\n```html\n<html lang=\"en\" dir=\"ltr\">\n  <head>\n    <title>X Hot Topic Digest \u2014 2026-06-26</title>\n  </head>\n  <body>\n    <div lang=\"en\" dir=\"ltr\">\n      <!-- digest content -->\n    </div>\n  </body>\n</html>\n```\n\n- `lang`: a BCP 47 language tag (`en`, `it`, `ja`, `ar`).\n- `dir`: `ltr`, `rtl`, or `auto`.\n\nFor multi-locale digests, pass the locale through; do not hardcode `en`.\n\n### Mark layout tables as presentational\n\nAny `<table>` used for layout must have `role=\"presentation\"` (or `role=\"none\"`).\nOtherwise screen readers announce \"table, row 1 of N\" for every layout row.\n\n```html\n<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n  <tr>\n    <td>...</td>\n  </tr>\n</table>\n```\n\n### Use a single `<h1>` and nest headings in order\n\nOne `<h1>` names the digest (\"X Hot Topic Digest \u2014 2026-06-26\"). Each hot topic is an\n`<h2>`; sub-sections (origin posts, research sources) are `<h3>`. Never skip levels or\nfake a heading with bold `<p>`.\n\n```html\n<h1>X Hot Topic Digest \u2014 2026-06-26</h1>\n  <h2>AI SDK 5 ships with agent loops</h2>\n    <h3>Origin posts</h3>\n    <h3>Research sources</h3>\n```\n\n### Every link must have discernible text\n\nEvery `<a>` must contain text a screen reader can announce. X post links should use the\nhandle and a short snippet; Parallel source links should use the source title.\n\n```html\n<!-- Wrong -->\n<a href=\"https://x.com/vercel/status/1700000000000000001\">click here</a>\n<a href=\"https://x.com/vercel/status/1700000000000000001\">\n  https://x.com/vercel/status/1700000000000000001\n</a>\n\n<!-- Right -->\n<a href=\"https://x.com/vercel/status/1700000000000000001\">\n  vercel on X: We just shipped AI SDK 5 with native agent loops\n</a>\n```\n\nNever use \"click here\", \"learn more\", bare URLs, or a linked image with empty alt.\n\n### Meaningful alt text, and `alt=\"\"` for decorative images\n\n- Meaningful images (charts, screenshots): describe purpose and key details in context.\n- Decorative images (spacers, dividers): use an explicit `alt=\"\"` so screen readers skip\n  them. Never omit the attribute entirely.\n- A linked image is never decorative \u2014 its `alt` must describe the action.\n\n### Include a `<title>` tag\n\nMany clients and assistive technologies read `<title>` before anything else. Treat it\nlike the subject line, not the brand name:\n\n```html\n<title>X Hot Topic Digest \u2014 2026-06-26</title>\n```\n\n### Color contrast and dark mode\n\n- Body text and links: 4.5:1 minimum against the background (WCAG AA).\n- Large text (\u226518pt, or \u226514pt bold): 3:1 minimum.\n- Never rely on color alone to convey meaning.\n- Outlook and Apple Mail force dark mode; preview the digest in dark mode before sending.\n\n## Priority order\n\nWhen you cannot fix everything, fix in this order:\n\n1. Missing or misused `alt` on images.\n2. `lang`/`dir` on `<html>` and body children, `role=\"presentation\"` on layout tables,\n   links without discernible text, missing `<title>`, color contrast.\n3. Non-descriptive link text (\"click here\").\n4. Missing `<h1>`.\n\n## Authoring checklist\n\n- [ ] `<html>` has `lang` and `dir`; direct children of `<body>` also have `lang` and `dir`\n- [ ] `<title>` is set and specific to this digest\n- [ ] Layout `<table>` elements have `role=\"presentation\"`\n- [ ] One `<h1>`; `<h2>`/`<h3>` nested in order\n- [ ] Every `<a>` has discernible text that describes its destination\n- [ ] No \"click here\", bare URLs, or linked images with empty alt\n- [ ] Meaningful images have descriptive `alt`; decorative images have explicit `alt=\"\"`\n- [ ] Body text passes 4.5:1 contrast and stays readable in dark mode\n- [ ] A plain-text alternative is sent alongside the HTML\n\n## Related\n\n- [Sending Reliability](./sending-reliability.md) \u2014 idempotent sends and error handling\n"
      },
      {
        "path": "agent/skills/email-best-practices/references/sending-reliability.md",
        "type": "registry:file",
        "target": "~/agent/skills/email-best-practices/references/sending-reliability.md",
        "content": "# Sending Reliability\n\nEnsuring an email is sent exactly once and that failures are handled gracefully.\n\n## Idempotency\n\nPrevent duplicate emails when retrying failed requests.\n\n### The problem\n\nNetwork issues, timeouts, or server errors can leave you uncertain whether an email was\nsent. Retrying without idempotency risks sending duplicates.\n\n### Solution: idempotency keys\n\nSend a unique key with each request. If the same key is sent again, the provider returns\nthe original response instead of sending another email. Resend accepts this as the\n`Idempotency-Key` header.\n\n```typescript\n// Deterministic key based on the business event\nconst idempotencyKey = `password-reset-${userId}-${resetRequestId}`;\n\nawait resend.emails.send(\n  {\n    from: 'noreply@example.com',\n    to: user.email,\n    subject: 'Reset your password',\n    html: emailHtml,\n  },\n  { idempotencyKey },\n);\n```\n\n### Key generation strategies\n\n| Strategy | Example | Use when |\n|----------|---------|----------|\n| Event-based (recommended) | `order-confirm-${orderId}` | One email per event |\n| Request-scoped | `reset-${userId}-${resetRequestId}` | Retries within same request |\n| UUID | `crypto.randomUUID()` | No natural key (generate once, reuse on retry) |\n\n**Best practice:** use deterministic keys based on the business event. If you retry the\nsame logical send, the same key must be regenerated. Avoid `Date.now()` or random values\ngenerated fresh on each attempt.\n\n**Key expiration:** idempotency keys are typically cached for 24 hours. Retries within\nthis window return the original response. After expiration, the same key triggers a new\nsend \u2014 so complete retry logic well within 24 hours.\n\n## Result shape: check `error`, don't rely on throws\n\nEmail APIs such as Resend resolve `send` with `{ data, error }` rather than throwing on\nfailure. An unverified sender, invalid recipient, rate limit, or validation error comes\nback as an `error` result, not an exception.\n\n```typescript\nconst { data, error } = await resend.emails.send(emailPayload, { idempotencyKey });\n\nif (error) {\n  // Not delivered. Do not cache as success; the same key can be retried.\n  return { sent: false, error: { message: error.message, name: error.name } };\n}\n\n// Only successful sends are safe to short-circuit on replay.\nreturn { sent: true, messageId: data?.id };\n```\n\nA failed send must not be cached as a success. Only successful sends should be\nshort-circuited on replay; failures need to be retried with the same idempotency key.\n\n## Retry logic\n\nHandle transient failures with exponential backoff.\n\n| Error type | Retry? | Notes |\n|------------|--------|-------|\n| 5xx (server error) | Yes | Transient, likely to resolve |\n| 429 (rate limit) | Yes | Wait for the rate limit window |\n| 4xx (client error) | No | Fix the request first |\n| Network timeout | Yes | Transient |\n| DNS failure | Yes | May be transient |\n\n```typescript\nasync function sendWithRetry(emailData, maxRetries = 3) {\n  for (let attempt = 0; attempt < maxRetries; attempt++) {\n    const { data, error } = await resend.emails.send(emailData);\n    if (!error) return data;\n\n    if (isRetryable(error) || attempt < maxRetries - 1) {\n      const delay = Math.min(1000 * 2 ** attempt, 30000);\n      await sleep(delay + Math.random() * 1000); // jitter\n      continue;\n    }\n    throw error;\n  }\n}\n```\n\nBackoff schedule: 1s \u2192 2s \u2192 4s \u2192 8s, with jitter to prevent thundering herd.\n\n## Timeouts\n\nSet appropriate timeouts to avoid hanging requests. 10\u201330 seconds is reasonable for\nemail API calls.\n\n## Related\n\n- [Accessibility](./accessibility.md) \u2014 composing the HTML body\n"
      },
      {
        "path": "agent/tools/preview_digest_email.ts",
        "type": "registry:file",
        "target": "~/agent/tools/preview_digest_email.ts",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nimport { hotTopicConfig } from \"../lib/hot-topic-config.js\";\n\nexport default defineTool({\n  description:\n    \"Preview the X hot topic digest email without sending it. Resolves recipients and sender from configuration and returns the exact payload that send_digest_email would send. Recipients and sender come from configuration and cannot be overridden via input.\",\n  inputSchema: z.object({\n    subject: z.string().min(1).optional(),\n    html: z.string().min(1),\n  }),\n  async execute({ subject, html }) {\n    const resolvedFrom = hotTopicConfig.digest.from;\n    if (!resolvedFrom) {\n      return { notConfigured: true, missingEnv: \"X_HOT_TOPIC_DIGEST_FROM\" };\n    }\n\n    const resolvedTo = hotTopicConfig.digest.to;\n    if (resolvedTo.length === 0) {\n      return { notConfigured: true, missingEnv: \"X_HOT_TOPIC_DIGEST_TO\" };\n    }\n\n    return {\n      dryRun: true,\n      from: resolvedFrom,\n      to: resolvedTo,\n      subject: subject ?? hotTopicConfig.digest.subject,\n      htmlPreview: html.slice(0, 500),\n      htmlLength: html.length,\n    };\n  },\n});\n"
      },
      {
        "path": "agent/tools/research_hot_topics.ts",
        "type": "registry:file",
        "target": "~/agent/tools/research_hot_topics.ts",
        "content": "import Parallel from \"parallel-web\";\nimport { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nimport { hotTopicConfig } from \"../lib/hot-topic-config.js\";\n\nexport default defineTool({\n  description:\n    \"Research a hot topic with the Parallel web search API and return ranked excerpts with provenance.\",\n  inputSchema: z.object({\n    topic: z.string().min(1).describe(\"The hot topic to research, in natural language.\"),\n    searchQueries: z\n      .array(z.string().min(1))\n      .min(1)\n      .max(5)\n      .describe(\"2-3 concise keyword queries (3-6 words each) to focus the search.\"),\n    maxResults: z\n      .number()\n      .int()\n      .min(1)\n      .max(10)\n      .optional()\n      .describe(\"Upper bound on returned results. Defaults to the agent config.\"),\n  }),\n  async execute({ topic, searchQueries, maxResults }) {\n    const apiKey = process.env.PARALLEL_API_KEY;\n    if (!apiKey) {\n      return { authRequired: true, missingEnv: \"PARALLEL_API_KEY\", topic };\n    }\n\n    const client = new Parallel({ apiKey });\n    const { results } = await client.search({\n      objective: `Research the following hot topic surfaced from X: ${topic}`,\n      search_queries: searchQueries,\n      mode: hotTopicConfig.searchMode,\n      advanced_settings: {\n        max_results: maxResults ?? hotTopicConfig.searchMaxResults,\n      },\n    });\n\n    return {\n      topic,\n      resultCount: results.length,\n      results: results.map((entry) => ({\n        url: entry.url,\n        title: entry.title ?? null,\n        publishDate: entry.publish_date ?? null,\n        excerpts: entry.excerpts,\n      })),\n    };\n  },\n});\n"
      },
      {
        "path": "agent/tools/scan_x_profiles.ts",
        "type": "registry:file",
        "target": "~/agent/tools/scan_x_profiles.ts",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nimport { getLookbackStartTime, hotTopicConfig } from \"../lib/hot-topic-config.js\";\n\nconst X_API_BASE = \"https://api.x.com/2\";\nconst TWEET_FIELDS = \"created_at,public_metrics,entities,lang\";\nconst EXCLUDE = \"retweets\";\nconst MIN_MAX_RESULTS = 5;\n\ntype XPublicMetrics = {\n  readonly impression_count?: number;\n  readonly like_count?: number;\n  readonly reply_count?: number;\n  readonly retweet_count?: number;\n  readonly quote_count?: number;\n  readonly bookmark_count?: number;\n};\n\ntype XTweet = {\n  readonly id: string;\n  readonly text: string;\n  readonly created_at?: string;\n  readonly lang?: string;\n  readonly public_metrics?: XPublicMetrics;\n};\n\ntype XUserLookupResponse = {\n  readonly data?: { readonly id: string; readonly name: string; readonly username: string };\n};\n\ntype XTweetsResponse = {\n  readonly data?: readonly XTweet[];\n  readonly meta?: { readonly result_count?: number; readonly newest_id?: string };\n};\n\nconst userIdCache = new Map<string, string>();\n\nasync function xFetch<T>(path: string, searchParams?: URLSearchParams): Promise<T> {\n  const bearer = process.env.X_BEARER_TOKEN;\n  if (!bearer) {\n    throw new Error(\"Missing X_BEARER_TOKEN environment variable.\");\n  }\n\n  const url = searchParams ? `${path}?${searchParams.toString()}` : path;\n  const response = await fetch(`${X_API_BASE}${url}`, {\n    headers: { Authorization: `Bearer ${bearer}` },\n  });\n\n  if (!response.ok) {\n    const body = await response.text();\n    throw new Error(`X API ${response.status} for ${path}: ${body.slice(0, 500)}`);\n  }\n\n  return (await response.json()) as T;\n}\n\nasync function resolveUserId(handle: string): Promise<string> {\n  const normalized = handle.replace(/^@/, \"\");\n  const cached = userIdCache.get(normalized);\n  if (cached) return cached;\n\n  const lookup = await xFetch<XUserLookupResponse>(\n    `/users/by/username/${encodeURIComponent(normalized)}`,\n  );\n  if (!lookup.data?.id) {\n    throw new Error(`Could not resolve X user id for @${normalized}.`);\n  }\n\n  userIdCache.set(normalized, lookup.data.id);\n  return lookup.data.id;\n}\n\nasync function fetchUserTweets(handle: string, startTime: string): Promise<readonly XTweet[]> {\n  const userId = await resolveUserId(handle);\n  const maxResults = Math.max(hotTopicConfig.maxTweetsPerProfile, MIN_MAX_RESULTS);\n  const params = new URLSearchParams({\n    max_results: maxResults.toString(),\n    \"tweet.fields\": TWEET_FIELDS,\n    exclude: EXCLUDE,\n    start_time: startTime,\n  });\n\n  const payload = await xFetch<XTweetsResponse>(`/users/${userId}/tweets`, params);\n  return payload.data ?? [];\n}\n\nfunction withinLookback(tweet: XTweet, startTimeMs: number): boolean {\n  if (!tweet.created_at) return false;\n  const createdAt = Date.parse(tweet.created_at);\n  return Number.isFinite(createdAt) && createdAt >= startTimeMs;\n}\n\nfunction summarizeTweet(tweet: XTweet) {\n  return {\n    id: tweet.id,\n    text: tweet.text,\n    createdAt: tweet.created_at,\n    lang: tweet.lang,\n    likes: tweet.public_metrics?.like_count ?? 0,\n    replies: tweet.public_metrics?.reply_count ?? 0,\n    reposts: tweet.public_metrics?.retweet_count ?? 0,\n    quotes: tweet.public_metrics?.quote_count ?? 0,\n    impressions: tweet.public_metrics?.impression_count ?? 0,\n  };\n}\n\nexport default defineTool({\n  description:\n    \"Scan configured X (Twitter) profiles for recent posts to surface hot topics. Uses X API v2 app-only bearer auth.\",\n  inputSchema: z.object({\n    handles: z\n      .array(z.string().min(1))\n      .optional()\n      .describe(\n        \"X handles to scan. Defaults to the X_HOT_TOPIC_HANDLES environment variable.\",\n      ),\n  }),\n  async execute({ handles }) {\n    const bearer = process.env.X_BEARER_TOKEN;\n    if (!bearer) {\n      return { authRequired: true, missingEnv: \"X_BEARER_TOKEN\" };\n    }\n\n    const targetHandles = handles?.length ? handles : hotTopicConfig.handles;\n    if (targetHandles.length === 0) {\n      return {\n        scannedProfiles: 0,\n        profiles: [],\n        note: \"No handles configured. Set X_HOT_TOPIC_HANDLES or pass handles explicitly.\",\n      };\n    }\n\n    const startTime = getLookbackStartTime();\n    const startTimeMs = Date.parse(startTime);\n\n    const profiles = [];\n    for (const handle of targetHandles) {\n      try {\n        const tweets = (await fetchUserTweets(handle, startTime)).filter((tweet) =>\n          withinLookback(tweet, startTimeMs),\n        );\n        profiles.push({\n          handle,\n          ok: true,\n          tweetCount: tweets.length,\n          tweets: tweets.map(summarizeTweet),\n        });\n      } catch (error) {\n        profiles.push({\n          handle,\n          ok: false,\n          error: error instanceof Error ? error.message : String(error),\n        });\n      }\n    }\n\n    const totalTweets = profiles.reduce(\n      (sum, profile) => sum + (profile.ok ? (profile.tweetCount ?? 0) : 0),\n      0,\n    );\n\n    return {\n      scannedProfiles: profiles.length,\n      totalTweets,\n      lookbackHours: hotTopicConfig.lookbackHours,\n      windowStart: startTime,\n      profiles,\n    };\n  },\n});\n"
      },
      {
        "path": "agent/tools/send_digest_email.ts",
        "type": "registry:file",
        "target": "~/agent/tools/send_digest_email.ts",
        "content": "import { Resend } from \"resend\";\nimport { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nimport { hotTopicConfig } from \"../lib/hot-topic-config.js\";\n\n// Successful sends are cached so a replayed Eve step returns the recorded\n// result instead of issuing a second send. Failures are not cached so they\n// can be retried with the same idempotency key.\nconst sentKeys = new Map<\n  string,\n  { readonly to: readonly string[]; readonly messageId: string }\n>();\n\nconst payloadSchema = z.object({\n  subject: z.string().min(1).optional(),\n  html: z.string().min(1),\n  confirmSend: z\n    .boolean()\n    .describe(\n      \"Must be true to send. Acts as an explicit guard against accidental sends.\",\n    ),\n  idempotencyKey: z\n    .string()\n    .min(1)\n    .max(255)\n    .describe(\n      \"Stable unique key for this digest. Reused across retries of the same step so a replayed send does not duplicate the email.\",\n    ),\n});\n\nexport default defineTool({\n  description:\n    \"Send the X hot topic digest email through Resend to the configured recipients. Requires an explicit confirmSend flag and a stable idempotencyKey so a replayed step never duplicates the email. Recipients and sender come from configuration and cannot be overridden via input. Always call preview_digest_email first.\",\n  inputSchema: payloadSchema,\n  async execute({ subject, html, confirmSend, idempotencyKey }) {\n    const apiKey = process.env.RESEND_API_KEY;\n    if (!apiKey) {\n      return { authRequired: true, missingEnv: \"RESEND_API_KEY\" };\n    }\n\n    if (!confirmSend) {\n      return {\n        notConfirmed: true,\n        note: \"confirmSend must be true to send. Call preview_digest_email to review the email first.\",\n      };\n    }\n\n    const resolvedFrom = hotTopicConfig.digest.from;\n    if (!resolvedFrom) {\n      return { notConfigured: true, missingEnv: \"X_HOT_TOPIC_DIGEST_FROM\" };\n    }\n\n    const resolvedTo = hotTopicConfig.digest.to;\n    if (resolvedTo.length === 0) {\n      return { notConfigured: true, missingEnv: \"X_HOT_TOPIC_DIGEST_TO\" };\n    }\n\n    const cached = sentKeys.get(idempotencyKey);\n    if (cached) {\n      return { replayed: true, idempotencyKey, to: cached.to, messageId: cached.messageId };\n    }\n\n    const resend = new Resend(apiKey);\n    const { data, error } = await resend.emails.send(\n      {\n        from: resolvedFrom,\n        to: resolvedTo,\n        subject: subject ?? hotTopicConfig.digest.subject,\n        html,\n      },\n      { idempotencyKey },\n    );\n\n    if (error) {\n      return {\n        sent: false,\n        idempotencyKey,\n        to: resolvedTo,\n        error: { message: error.message, name: error.name },\n      };\n    }\n\n    const messageId = data.id;\n    sentKeys.set(idempotencyKey, { to: resolvedTo, messageId });\n    return { sent: true, idempotencyKey, to: resolvedTo, messageId };\n  },\n});\n"
      },
      {
        "path": "evals/evals.config.ts",
        "type": "registry:file",
        "target": "~/evals/evals.config.ts",
        "content": "import { defineEvalConfig } from \"eve/evals\";\n\nexport default defineEvalConfig({\n  timeoutMs: 120_000,\n});\n"
      },
      {
        "path": "evals/hot-topic-digest.eval.ts",
        "type": "registry:file",
        "target": "~/evals/hot-topic-digest.eval.ts",
        "content": "import { defineEval } from \"eve/evals\";\nimport { includes } from \"eve/evals/expect\";\n\nexport default defineEval({\n  description:\n    \"Scans a sample of X posts, researches hot topics with Parallel, and previews the digest email without sending.\",\n  async test(t) {\n    await t.send(`\nRun the daily X hot topic digest for the following sample posts.\n\nWatched handles: vercel, parallel_ai\n\nSample scan_x_profiles output:\n{\n  \"scannedProfiles\": 2,\n  \"totalTweets\": 2,\n  \"lookbackHours\": 24,\n  \"windowStart\": \"2026-06-25T08:00:00Z\",\n  \"profiles\": [\n    {\n      \"handle\": \"vercel\",\n      \"ok\": true,\n      \"tweetCount\": 1,\n      \"tweets\": [\n        {\n          \"id\": \"1700000000000000001\",\n          \"text\": \"We just shipped AI SDK 5 with native agent loops and durable execution.\",\n          \"createdAt\": \"2026-06-26T07:00:00.000Z\",\n          \"likes\": 320,\n          \"replies\": 22,\n          \"reposts\": 45,\n          \"quotes\": 8,\n          \"impressions\": 12000\n        }\n      ]\n    },\n    {\n      \"handle\": \"parallel_ai\",\n      \"ok\": true,\n      \"tweetCount\": 1,\n      \"tweets\": [\n        {\n          \"id\": \"1700000000000000002\",\n          \"text\": \"Parallel Monitor API is now GA: web change events streamed to proactive agents.\",\n          \"createdAt\": \"2026-06-26T07:30:00.000Z\",\n          \"likes\": 210,\n          \"replies\": 14,\n          \"reposts\": 33,\n          \"quotes\": 5,\n          \"impressions\": 9000\n        }\n      ]\n    }\n  ]\n}\n\nSurface up to 2 hot topics, research each with research_hot_topics, then preview the digest with preview_digest_email. Do not call send_digest_email in this run.\n`);\n\n    t.succeeded();\n    t.noFailedActions();\n    t.calledTool(\"research_hot_topics\").gate();\n    t.calledTool(\"preview_digest_email\").gate();\n    t.notCalledTool(\"send_digest_email\").gate();\n    t.check(t.reply, includes(\"dryRun\").soft());\n  },\n});\n"
      },
      {
        "path": "evals/missing-config-does-not-send.eval.ts",
        "type": "registry:file",
        "target": "~/evals/missing-config-does-not-send.eval.ts",
        "content": "import { defineEval } from \"eve/evals\";\nimport { includes } from \"eve/evals/expect\";\n\nexport default defineEval({\n  description:\n    \"When required configuration is missing, the agent stops and reports it instead of sending the digest.\",\n  async test(t) {\n    await t.send(`\nRun the daily X hot topic digest.\n\nThe scan_x_profiles tool returned:\n\n{\n  \"authRequired\": true,\n  \"missingEnv\": \"X_BEARER_TOKEN\"\n}\n\nNo handles could be scanned because the X bearer token is not configured. Proceed according to the instructions: do not invent handles, topics, sources, or recipients, and do not call send_digest_email. Report the missing configuration clearly.\n`);\n\n    t.succeeded();\n    t.noFailedActions();\n    t.notCalledTool(\"send_digest_email\").gate();\n    t.notCalledTool(\"preview_digest_email\").gate();\n    t.check(t.reply, includes(\"X_BEARER_TOKEN\").gate());\n  },\n});\n"
      },
      {
        "path": "evals/send-confirmation.eval.ts",
        "type": "registry:file",
        "target": "~/evals/send-confirmation.eval.ts",
        "content": "import { defineEval } from \"eve/evals\";\nimport { equals, includes } from \"eve/evals/expect\";\n\nexport default defineEval({\n  description:\n    \"Confirms the send path requires confirmSend=true and a stable idempotencyKey, and does not send when the flag is omitted.\",\n  async test(t) {\n    const turn = await t.send(`\nThe digest has been previewed with preview_digest_email and the user has approved sending it for today (2026-06-26).\n\nNow send the digest with send_digest_email. Use today's date to build a stable idempotencyKey such as x-hot-topic-digest-2026-06-26, and set confirmSend=true. If you would otherwise send without confirmSend=true, do not send and report that confirmation is required instead.\n`);\n\n    const call = turn.requireToolCall(\"send_digest_email\");\n    t.check(call.input.confirmSend, equals(true).gate());\n    t.check(\n      typeof call.input.idempotencyKey === \"string\" && call.input.idempotencyKey.length > 0,\n      equals(true).gate(),\n    );\n    t.check(call.input.to === undefined, equals(true).gate());\n    t.check(call.input.from === undefined, equals(true).gate());\n    t.check(t.reply, includes(\"x-hot-topic-digest-2026-06-26\").soft());\n  },\n});\n"
      },
      {
        "path": "README.md",
        "type": "registry:file",
        "target": "~/agent/README.md",
        "content": "# X Hot Topic Digest\n\nA scheduled Eve agent that scans a configured set of X (Twitter) profiles every day, surfaces hot topics from their recent posts, researches each topic with the [Parallel](https://parallel.ai/) web search API, and delivers an HTML digest by email through [Resend](https://resend.com).\n\nIt runs on a cron schedule, reads only public posts via the X API v2, and previews every email in dry-run mode before sending anything for real.\n\n## What it does\n\n1. **Scan X profiles** \u2014 pulls recent posts (excluding retweets) from each handle in `X_HOT_TOPIC_HANDLES` using X API v2 app-only bearer auth.\n2. **Surface hot topics** \u2014 clusters the posts into up to `X_HOT_TOPIC_MAX_TOPICS` themes based on recurrence and engagement.\n3. **Research with Parallel** \u2014 for each topic, calls the Parallel Search API with focused keyword queries and returns ranked web sources with provenance.\n4. **Send a digest email** \u2014 composes a single HTML email with origin posts and research sources, previews it with `preview_digest_email`, then sends it through Resend only when `send_digest_email` is called with `confirmSend: true` and a stable `idempotencyKey` (so a replayed step never duplicates the email).\n\n## Installation\n\n```bash\nnpx shadcn@latest add https://evex.sh/r/x-hot-topic-digest\n```\n\n## Configuration\n\nCopy `.env.example` into your Eve app environment and fill in the values.\n\n### X credentials\n\n- `X_BEARER_TOKEN` \u2014 app-only bearer token from the X Developer Console. Required to read public posts.\n\n### Watched profiles and schedule\n\n- `X_HOT_TOPIC_HANDLES` \u2014 comma-separated X handles to scan (with or without `@`). Example: `vercel,parallel_ai,anthropicai`.\n- `X_HOT_TOPIC_DAILY_CRON` \u2014 5-field cron expression (UTC on Vercel). Defaults to `0 8 * * *` (daily at 08:00 UTC).\n- `X_HOT_TOPIC_LOOKBACK_HOURS` \u2014 lookback window in hours for posts to scan. Defaults to `24`, so each daily digest only sees posts from the last 24 hours and does not repeat the same topics day over day. Set it lower for more frequent runs or higher for low-volume handles.\n- `X_HOT_TOPIC_MAX_TWEETS_PER_PROFILE` \u2014 max posts fetched per profile. Defaults to `20`.\n- `X_HOT_TOPIC_MAX_TOPICS` \u2014 max hot topics surfaced per run. Defaults to `5`.\n- `X_HOT_TOPIC_SEARCH_MAX_RESULTS` \u2014 max Parallel search results per topic. Defaults to `5`.\n- `X_HOT_TOPIC_SEARCH_MODE` \u2014 Parallel search mode: `turbo`, `basic`, or `advanced`. Defaults to `basic`.\n\n### Digest delivery (Resend)\n\n- `RESEND_API_KEY` \u2014 Resend API key.\n- `X_HOT_TOPIC_DIGEST_FROM` \u2014 sender email address verified in Resend.\n- `X_HOT_TOPIC_DIGEST_TO` \u2014 comma-separated recipient email addresses.\n- `X_HOT_TOPIC_DIGEST_SUBJECT` \u2014 email subject. Defaults to `X Hot Topic Digest`.\n\nSending is a two-step, non-idempotent-safe operation by design: the agent calls `preview_digest_email` first, then `send_digest_email` with `confirmSend: true` and a stable `idempotencyKey`. The idempotency key is forwarded to Resend as the `Idempotency-Key` header and reused if Eve replays the step, so a retried send never produces a duplicate email.\n\n### Parallel credentials\n\n- `PARALLEL_API_KEY` \u2014 Parallel API key from [platform.parallel.ai](https://platform.parallel.ai).\n\n## Smoke test\n\n1. Set `X_BEARER_TOKEN`, `PARALLEL_API_KEY`, `RESEND_API_KEY`, `X_HOT_TOPIC_DIGEST_FROM`, `X_HOT_TOPIC_DIGEST_TO`, and at least one handle in `X_HOT_TOPIC_HANDLES`.\n2. Trigger the schedule while iterating in dev:\n\n   ```bash\n   curl -X POST http://localhost:3000/eve/v1/dev/schedules/daily-hot-topic-digest\n   ```\n\n3. The agent should call `preview_digest_email` to review the digest. Sending is gated on `send_digest_email` being called with `confirmSend: true` and an `idempotencyKey`, so a preview-only run sends nothing.\n\n## Troubleshooting\n\n- **`authRequired: missingEnv X_BEARER_TOKEN`** \u2014 the X bearer token is missing or empty.\n- **`Could not resolve X user id`** \u2014 a handle is wrong, suspended, or the app does not have access to user lookup.\n- **`authRequired: missingEnv PARALLEL_API_KEY`** \u2014 the Parallel API key is missing.\n- **`notConfigured: missingEnv X_HOT_TOPIC_DIGEST_TO`** \u2014 no recipients configured. Add at least one email to `X_HOT_TOPIC_DIGEST_TO`.\n- **`notConfirmed: true`** \u2014 `send_digest_email` was called without `confirmSend: true`. Review the preview first, then call it with the flag set.\n- **No email arrives** \u2014 the agent only sends when `send_digest_email` is called with `confirmSend: true` and an `idempotencyKey`. Confirm `X_HOT_TOPIC_DIGEST_FROM` is a verified Resend sender.\n\n## Development\n\n```bash\npnpm install\npnpm dev\n```\n\nRun `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.\n"
      },
      {
        "path": ".env.example",
        "type": "registry:file",
        "target": "~/.env.example",
        "content": "X_BEARER_TOKEN=\n\nX_HOT_TOPIC_HANDLES=\n\nX_HOT_TOPIC_DAILY_CRON=\"0 8 * * *\"\nX_HOT_TOPIC_LOOKBACK_HOURS=24\nX_HOT_TOPIC_MAX_TWEETS_PER_PROFILE=20\nX_HOT_TOPIC_MAX_TOPICS=5\nX_HOT_TOPIC_SEARCH_MAX_RESULTS=5\nX_HOT_TOPIC_SEARCH_MODE=basic\n\nX_HOT_TOPIC_DIGEST_FROM=\nX_HOT_TOPIC_DIGEST_TO=\nX_HOT_TOPIC_DIGEST_SUBJECT=\"X Hot Topic Digest\"\n\nPARALLEL_API_KEY=\nRESEND_API_KEY=\n"
      }
    ]
  }
} as const satisfies Record<string, RegistryItem>
