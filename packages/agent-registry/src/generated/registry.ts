import type { RegistryCatalog, RegistryItem } from '../types'

export const generatedRegistry = {
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "evex-new",
  "homepage": "https://evex-new.sh",
  "items": [
    {
      "name": "code-reviewer",
      "type": "registry:item",
      "title": "Code Reviewer",
      "description": "A reviewer tuned for changed behavior rather than style. It ranks hotspots first, then writes terse findings with impact, evidence, and the next thing to verify before merge.",
      "author": "evex-new",
      "categories": [
        "coding"
      ],
      "meta": {
        "slug": "code-reviewer",
        "category": "coding",
        "author": {
          "id": "evex-new",
          "name": "evex-new",
          "url": "https://evex-new.sh"
        },
        "createdAt": "2026-06-20T00:00:00.000Z",
        "updatedAt": "2026-06-20T00:00:00.000Z"
      },
      "dependencies": [
        "eve@^0.11.4",
        "zod@4.3.6"
      ],
      "files": [
        {
          "path": "agent/agent.ts",
          "target": "~/agent/agent.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/instructions.md",
          "target": "~/agent/instructions.md",
          "type": "registry:file"
        },
        {
          "path": "agent/skills/review-calibration/references/review-checklist.md",
          "target": "~/agent/skills/review-calibration/references/review-checklist.md",
          "type": "registry:file"
        },
        {
          "path": "agent/skills/review-calibration/references/severity-scale.md",
          "target": "~/agent/skills/review-calibration/references/severity-scale.md",
          "type": "registry:file"
        },
        {
          "path": "agent/skills/review-calibration/SKILL.md",
          "target": "~/agent/skills/review-calibration/SKILL.md",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/risk_triager/agent.ts",
          "target": "~/agent/subagents/risk_triager/agent.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/risk_triager/instructions.md",
          "target": "~/agent/subagents/risk_triager/instructions.md",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/risk_triager/tools/prioritize_files.ts",
          "target": "~/agent/subagents/risk_triager/tools/prioritize_files.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/security_reviewer/agent.ts",
          "target": "~/agent/subagents/security_reviewer/agent.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/security_reviewer/instructions.md",
          "target": "~/agent/subagents/security_reviewer/instructions.md",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/security_reviewer/skills/boundary-checks.md",
          "target": "~/agent/subagents/security_reviewer/skills/boundary-checks.md",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/security_reviewer/tools/check_boundary.ts",
          "target": "~/agent/subagents/security_reviewer/tools/check_boundary.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/test_designer/agent.ts",
          "target": "~/agent/subagents/test_designer/agent.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/test_designer/instructions.md",
          "target": "~/agent/subagents/test_designer/instructions.md",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/test_designer/tools/propose_tests.ts",
          "target": "~/agent/subagents/test_designer/tools/propose_tests.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/tools/score_risk.ts",
          "target": "~/agent/tools/score_risk.ts",
          "type": "registry:file"
        },
        {
          "path": "README.md",
          "target": "~/agent/README.md",
          "type": "registry:file"
        }
      ]
    },
    {
      "name": "github-release-scout",
      "type": "registry:item",
      "title": "GitHub Release Scout",
      "description": "Connects to GitHub, gathers recently merged pull requests, and prepares release notes that preserve traceability to PR numbers, labels, and rollout risk.",
      "author": "evex-new",
      "categories": [
        "devops"
      ],
      "meta": {
        "slug": "github-release-scout",
        "category": "devops",
        "author": {
          "id": "evex-new",
          "name": "evex-new",
          "url": "https://evex-new.sh"
        },
        "createdAt": "2026-06-20T00:00:00.000Z",
        "updatedAt": "2026-06-20T00:00:00.000Z"
      },
      "dependencies": [
        "eve@^0.11.4",
        "@octokit/rest@^22.0.1",
        "zod@4.3.6"
      ],
      "files": [
        {
          "path": "agent/agent.ts",
          "target": "~/agent/agent.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/instructions.md",
          "target": "~/agent/instructions.md",
          "type": "registry:file"
        },
        {
          "path": "agent/tools/collect_merged_prs.ts",
          "target": "~/agent/tools/collect_merged_prs.ts",
          "type": "registry:file"
        },
        {
          "path": "README.md",
          "target": "~/agent/README.md",
          "type": "registry:file"
        }
      ]
    },
    {
      "name": "incident-commander",
      "type": "registry:item",
      "title": "Incident Commander",
      "description": "Designed for the first thirty minutes of an outage. It builds a factual timeline, tracks action items, and drafts stakeholder updates without blurring facts and assumptions.",
      "author": "evex-new",
      "categories": [
        "devops"
      ],
      "meta": {
        "slug": "incident-commander",
        "category": "devops",
        "author": {
          "id": "evex-new",
          "name": "evex-new",
          "url": "https://evex-new.sh"
        },
        "createdAt": "2026-06-20T00:00:00.000Z",
        "updatedAt": "2026-06-20T00:00:00.000Z"
      },
      "dependencies": [
        "eve@^0.11.4",
        "date-fns@^4.4.0",
        "zod@4.3.6"
      ],
      "files": [
        {
          "path": "agent/agent.ts",
          "target": "~/agent/agent.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/instructions.md",
          "target": "~/agent/instructions.md",
          "type": "registry:file"
        },
        {
          "path": "agent/skills/incident-comms/references/severity-matrix.md",
          "target": "~/agent/skills/incident-comms/references/severity-matrix.md",
          "type": "registry:file"
        },
        {
          "path": "agent/skills/incident-comms/references/update-style.md",
          "target": "~/agent/skills/incident-comms/references/update-style.md",
          "type": "registry:file"
        },
        {
          "path": "agent/skills/incident-comms/SKILL.md",
          "target": "~/agent/skills/incident-comms/SKILL.md",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/mitigation_coordinator/agent.ts",
          "target": "~/agent/subagents/mitigation_coordinator/agent.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/mitigation_coordinator/instructions.md",
          "target": "~/agent/subagents/mitigation_coordinator/instructions.md",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/mitigation_coordinator/tools/triage_actions.ts",
          "target": "~/agent/subagents/mitigation_coordinator/tools/triage_actions.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/status_writer/agent.ts",
          "target": "~/agent/subagents/status_writer/agent.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/status_writer/instructions.md",
          "target": "~/agent/subagents/status_writer/instructions.md",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/status_writer/tools/format_update.ts",
          "target": "~/agent/subagents/status_writer/tools/format_update.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/timeline_builder/agent.ts",
          "target": "~/agent/subagents/timeline_builder/agent.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/timeline_builder/instructions.md",
          "target": "~/agent/subagents/timeline_builder/instructions.md",
          "type": "registry:file"
        },
        {
          "path": "agent/subagents/timeline_builder/tools/find_gaps.ts",
          "target": "~/agent/subagents/timeline_builder/tools/find_gaps.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/tools/build_timeline.ts",
          "target": "~/agent/tools/build_timeline.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/tools/track_actions.ts",
          "target": "~/agent/tools/track_actions.ts",
          "type": "registry:file"
        },
        {
          "path": "README.md",
          "target": "~/agent/README.md",
          "type": "registry:file"
        }
      ]
    },
    {
      "name": "linear-sprint-triage",
      "type": "registry:item",
      "title": "Linear Sprint Triage",
      "description": "Fetches Linear team issues, highlights unassigned or high-priority work, and separates delivery risk from simple backlog hygiene.",
      "author": "evex-new",
      "categories": [
        "productivity"
      ],
      "meta": {
        "slug": "linear-sprint-triage",
        "category": "productivity",
        "author": {
          "id": "evex-new",
          "name": "evex-new",
          "url": "https://evex-new.sh"
        },
        "createdAt": "2026-06-20T00:00:00.000Z",
        "updatedAt": "2026-06-20T00:00:00.000Z"
      },
      "dependencies": [
        "eve@^0.11.4",
        "@linear/sdk@^86.0.0",
        "zod@4.3.6"
      ],
      "files": [
        {
          "path": "agent/agent.ts",
          "target": "~/agent/agent.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/instructions.md",
          "target": "~/agent/instructions.md",
          "type": "registry:file"
        },
        {
          "path": "agent/tools/fetch_team_issues.ts",
          "target": "~/agent/tools/fetch_team_issues.ts",
          "type": "registry:file"
        },
        {
          "path": "README.md",
          "target": "~/agent/README.md",
          "type": "registry:file"
        }
      ]
    },
    {
      "name": "resend-lifecycle-mailer",
      "type": "registry:item",
      "title": "Resend Lifecycle Mailer",
      "description": "Builds event-driven lifecycle emails, previews exact recipients and HTML, and only sends through Resend when dry-run mode is disabled.",
      "author": "evex-new",
      "categories": [
        "support"
      ],
      "meta": {
        "slug": "resend-lifecycle-mailer",
        "category": "support",
        "author": {
          "id": "evex-new",
          "name": "evex-new",
          "url": "https://evex-new.sh"
        },
        "createdAt": "2026-06-20T00:00:00.000Z",
        "updatedAt": "2026-06-20T00:00:00.000Z"
      },
      "dependencies": [
        "eve@^0.11.4",
        "resend@^6.14.0",
        "zod@4.3.6"
      ],
      "files": [
        {
          "path": "agent/agent.ts",
          "target": "~/agent/agent.ts",
          "type": "registry:file"
        },
        {
          "path": "agent/instructions.md",
          "target": "~/agent/instructions.md",
          "type": "registry:file"
        },
        {
          "path": "agent/tools/send_lifecycle_email.ts",
          "target": "~/agent/tools/send_lifecycle_email.ts",
          "type": "registry:file"
        },
        {
          "path": "README.md",
          "target": "~/agent/README.md",
          "type": "registry:file"
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
    "description": "A reviewer tuned for changed behavior rather than style. It ranks hotspots first, then writes terse findings with impact, evidence, and the next thing to verify before merge.",
    "author": "evex-new",
    "categories": [
      "coding"
    ],
    "meta": {
      "slug": "code-reviewer",
      "category": "coding",
      "author": {
        "id": "evex-new",
        "name": "evex-new",
        "url": "https://evex-new.sh"
      },
      "createdAt": "2026-06-20T00:00:00.000Z",
      "updatedAt": "2026-06-20T00:00:00.000Z"
    },
    "dependencies": [
      "eve@^0.11.4",
      "zod@4.3.6"
    ],
    "files": [
      {
        "path": "agent/agent.ts",
        "target": "~/agent/agent.ts",
        "type": "registry:file",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  model: \"anthropic/claude-sonnet-4.6\",\n});\n"
      },
      {
        "path": "agent/instructions.md",
        "target": "~/agent/instructions.md",
        "type": "registry:file",
        "content": "# Mission\nYou review code to find bugs, regressions, missing tests, and rollout risk.\n\n# Default stance\nPrefer changed behavior over style commentary. Do not spend time on naming nits,\nformatting, or speculative rewrites unless they hide a concrete failure mode.\n\n# Workflow\n1. Use score_risk first to rank hotspots in the diff.\n2. Delegate to risk_triager when the patch is broad and you need a reading order.\n3. Delegate to security_reviewer when auth, secrets, permissions, PII, or side effects are involved.\n4. Delegate to test_designer when the main uncertainty is coverage or regression prevention.\n5. Load the review-calibration skill when severity is ambiguous or multiple issues compete.\n6. Treat missing validation and broken recovery paths as first-class risks.\n7. When the result depends on runtime context, state the assumption instead of guessing.\n8. Mention missing tests only when they materially reduce confidence.\n\n# Delegation rules\n- Use declared subagents for specialist passes with a distinct role.\n- Use the built-in agent tool only for same-surface parallel inspection, such as reading multiple files at once.\n\n# Output contract\nStart with findings ordered by severity. Each finding must include:\n- the user or system impact\n- what triggers the issue\n- the smallest evidence needed to justify it\n\nIf you find no issues, say that clearly and note any residual risk that still\ndeserves manual verification before merge.\n"
      },
      {
        "path": "agent/skills/review-calibration/references/review-checklist.md",
        "target": "~/agent/skills/review-calibration/references/review-checklist.md",
        "type": "registry:file",
        "content": "# Review lenses\n- Can a valid request now fail because of ordering, retries, or stale cache state?\n- Does any new branch bypass authz, rate limiting, or ownership checks?\n- Can the new code create partial writes or inconsistent state on failure?\n- Does the patch need a migration, rollback, or a feature flag to be safe?\n- What is the smallest test that would catch the highest-risk regression?\n"
      },
      {
        "path": "agent/skills/review-calibration/references/severity-scale.md",
        "target": "~/agent/skills/review-calibration/references/severity-scale.md",
        "type": "registry:file",
        "content": "# Severity lenses\n- Critical: data loss, privilege bypass, or high-probability incident trigger\n- High: user-facing regression without an easy workaround\n- Medium: correctness issue with limited blast radius\n- Low: edge case, weak ergonomics, or documentation mismatch\n"
      },
      {
        "path": "agent/skills/review-calibration/SKILL.md",
        "target": "~/agent/skills/review-calibration/SKILL.md",
        "type": "registry:file",
        "content": "---\ndescription: Use when severity is ambiguous and the review needs a consistent impact bar.\n---\n\nCalibrate findings against user harm, exploitability, reversibility, and detection speed.\nEscalate issues that can corrupt state, leak data, bypass authorization, or silently ship\nbroken behavior. De-escalate issues that are recoverable, obvious, and tightly scoped.\n"
      },
      {
        "path": "agent/subagents/risk_triager/agent.ts",
        "target": "~/agent/subagents/risk_triager/agent.ts",
        "type": "registry:file",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  description: \"Rank changed files by review risk and propose the best reading order before the parent writes findings.\",\n  model: \"anthropic/claude-sonnet-4.6\",\n});\n"
      },
      {
        "path": "agent/subagents/risk_triager/instructions.md",
        "target": "~/agent/subagents/risk_triager/instructions.md",
        "type": "registry:file",
        "content": "You are the triage specialist for a code review agent.\n\nBuild the shortest possible review plan that helps the parent read the risky parts first.\nFocus on blast radius, state transitions, auth paths, migrations, and cache invalidation.\nReturn a prioritized checklist, not the final review verdict.\n"
      },
      {
        "path": "agent/subagents/risk_triager/tools/prioritize_files.ts",
        "target": "~/agent/subagents/risk_triager/tools/prioritize_files.ts",
        "type": "registry:file",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nconst fileRisk = z.object({\n  path: z.string().min(1),\n  churn: z.number().int().min(0),\n  criticality: z.number().int().min(0).max(5),\n  uncertainty: z.number().int().min(0).max(5),\n  tags: z.array(z.string()).default([]),\n});\n\nexport default defineTool({\n  description: \"Sort changed files into a review order with short rationale.\",\n  inputSchema: z.object({\n    files: z.array(fileRisk).min(1),\n  }),\n  async execute({ files }) {\n    return {\n      plan: files\n        .map((file) => ({\n          ...file,\n          score: file.churn * 0.03 + file.criticality * 2 + file.uncertainty * 1.5,\n        }))\n        .sort((left, right) => right.score - left.score)\n        .map((file, index) => ({\n          order: index + 1,\n          path: file.path,\n          score: Number(file.score.toFixed(2)),\n          rationale:\n            file.tags.length > 0\n              ? \"Prioritize because it touches \" + file.tags.join(\", \")\n              : \"Prioritize because it has high churn or uncertainty\",\n        })),\n    };\n  },\n});\n"
      },
      {
        "path": "agent/subagents/security_reviewer/agent.ts",
        "target": "~/agent/subagents/security_reviewer/agent.ts",
        "type": "registry:file",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  description: \"Inspect diffs for auth, secret-handling, data exposure, and unsafe side effects before the parent finalizes findings.\",\n  model: \"anthropic/claude-sonnet-4.6\",\n});\n"
      },
      {
        "path": "agent/subagents/security_reviewer/instructions.md",
        "target": "~/agent/subagents/security_reviewer/instructions.md",
        "type": "registry:file",
        "content": "You are the security-focused child reviewer.\n\nLook for access control bypasses, missing ownership checks, accidental secret exposure,\nunsafe defaults, SSRF-like fetch behavior, and destructive actions without safeguards.\nReport only concrete risks or meaningful residual uncertainty.\n"
      },
      {
        "path": "agent/subagents/security_reviewer/skills/boundary-checks.md",
        "target": "~/agent/subagents/security_reviewer/skills/boundary-checks.md",
        "type": "registry:file",
        "content": "Use when the diff touches auth, secrets, user data, integrations, or external side effects.\n\nWalk every trust boundary:\n- who can trigger the code path\n- what data crosses the boundary\n- what authorization gate exists\n- what side effect can happen if the guard fails\n"
      },
      {
        "path": "agent/subagents/security_reviewer/tools/check_boundary.ts",
        "target": "~/agent/subagents/security_reviewer/tools/check_boundary.ts",
        "type": "registry:file",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nconst boundary = z.object({\n  name: z.string().min(1),\n  actor: z.string().min(1),\n  sideEffect: z.string().min(1),\n  authorization: z.string().min(1),\n  handlesSensitiveData: z.boolean().default(false),\n});\n\nexport default defineTool({\n  description: \"Score the risk of a trust boundary or external side effect.\",\n  inputSchema: z.object({\n    boundaries: z.array(boundary).min(1),\n  }),\n  async execute({ boundaries }) {\n    return {\n      review: boundaries.map((boundary) => {\n        const missingAuthorization = /none|unknown|missing/i.test(boundary.authorization);\n        const riskScore =\n          (boundary.handlesSensitiveData ? 4 : 0) +\n          (missingAuthorization ? 5 : 0) +\n          (/delete|write|charge|publish/i.test(boundary.sideEffect) ? 3 : 0);\n\n        return {\n          name: boundary.name,\n          actor: boundary.actor,\n          riskScore,\n          needsAttention: riskScore >= 5,\n        };\n      }),\n    };\n  },\n});\n"
      },
      {
        "path": "agent/subagents/test_designer/agent.ts",
        "target": "~/agent/subagents/test_designer/agent.ts",
        "type": "registry:file",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  description: \"Design the smallest high-value regression tests that would validate or falsify the parent reviewer\u2019s concerns.\",\n  model: \"anthropic/claude-sonnet-4.6\",\n});\n"
      },
      {
        "path": "agent/subagents/test_designer/instructions.md",
        "target": "~/agent/subagents/test_designer/instructions.md",
        "type": "registry:file",
        "content": "You are the test-design specialist for a code review workflow.\n\nTurn risky code paths into the fewest possible tests that would catch the most expensive\nregression. Prefer precise integration tests when multiple units interact.\n"
      },
      {
        "path": "agent/subagents/test_designer/tools/propose_tests.ts",
        "target": "~/agent/subagents/test_designer/tools/propose_tests.ts",
        "type": "registry:file",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nconst concern = z.object({\n  title: z.string().min(1),\n  failureMode: z.string().min(1),\n  setupCost: z.enum([\"small\", \"medium\", \"large\"]),\n});\n\nexport default defineTool({\n  description: \"Turn review concerns into a short prioritized regression test plan.\",\n  inputSchema: z.object({\n    concerns: z.array(concern).min(1),\n  }),\n  async execute({ concerns }) {\n    const setupRank = { small: 3, medium: 2, large: 1 };\n\n    return {\n      tests: concerns\n        .map((concern) => ({\n          concern: concern.title,\n          testIdea: \"Verify that \" + concern.failureMode.toLowerCase(),\n          priority: setupRank[concern.setupCost],\n        }))\n        .sort((left, right) => right.priority - left.priority),\n    };\n  },\n});\n"
      },
      {
        "path": "agent/tools/score_risk.ts",
        "target": "~/agent/tools/score_risk.ts",
        "type": "registry:file",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nconst changedFile = z.object({\n  path: z.string().min(1),\n  kind: z.enum([\"added\", \"modified\", \"deleted\", \"renamed\"]),\n  additions: z.number().int().min(0).default(0),\n  deletions: z.number().int().min(0).default(0),\n  touchesCriticalPath: z.boolean().default(false),\n});\n\nexport default defineTool({\n  description: \"Estimate patch risk and spotlight the files worth reading first.\",\n  inputSchema: z.object({\n    files: z.array(changedFile).min(1),\n    hasMigration: z.boolean().default(false),\n    hasAuthChange: z.boolean().default(false),\n    hasCachingChange: z.boolean().default(false),\n  }),\n  async execute({ files, hasMigration, hasAuthChange, hasCachingChange }) {\n    let score = 8;\n    const reasons = [];\n    const hotspots = [];\n\n    for (const file of files) {\n      const churn = file.additions + file.deletions;\n      if (file.touchesCriticalPath) {\n        score += 8;\n        reasons.push(\"Touches a critical path: \" + file.path);\n        hotspots.push(file.path);\n      }\n      if (churn >= 200) {\n        score += 6;\n        reasons.push(\"Large patch size in \" + file.path);\n        hotspots.push(file.path);\n      }\n      if (file.kind === \"deleted\" || file.kind === \"renamed\") {\n        score += 4;\n        reasons.push(\"Structural file change in \" + file.path);\n      }\n      if (/schema|auth|cache|queue|worker|payment/i.test(file.path)) {\n        score += 3;\n        reasons.push(\"High leverage surface area in \" + file.path);\n      }\n    }\n\n    if (hasMigration) {\n      score += 7;\n      reasons.push(\"Includes a migration or data-shape change\");\n    }\n    if (hasAuthChange) {\n      score += 6;\n      reasons.push(\"Touches authentication or authorization logic\");\n    }\n    if (hasCachingChange) {\n      score += 4;\n      reasons.push(\"Changes caching or invalidation behavior\");\n    }\n\n    const band = score >= 35 ? \"high\" : score >= 20 ? \"medium\" : \"low\";\n\n    return {\n      score,\n      band,\n      hotspotCount: new Set(hotspots).size,\n      hotspots: Array.from(new Set(hotspots)),\n      reasons,\n    };\n  },\n});\n"
      },
      {
        "path": "README.md",
        "target": "~/agent/README.md",
        "type": "registry:file",
        "content": "# Code Reviewer\n\nA reviewer tuned for changed behavior rather than style. It ranks hotspots first, then writes terse findings with impact, evidence, and the next thing to verify before merge.\n\n## Development\n\n```bash\npnpm install\npnpm dev\n```\n\nRun `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.\n"
      }
    ]
  },
  "github-release-scout": {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "github-release-scout",
    "type": "registry:item",
    "title": "GitHub Release Scout",
    "description": "Connects to GitHub, gathers recently merged pull requests, and prepares release notes that preserve traceability to PR numbers, labels, and rollout risk.",
    "author": "evex-new",
    "categories": [
      "devops"
    ],
    "meta": {
      "slug": "github-release-scout",
      "category": "devops",
      "author": {
        "id": "evex-new",
        "name": "evex-new",
        "url": "https://evex-new.sh"
      },
      "createdAt": "2026-06-20T00:00:00.000Z",
      "updatedAt": "2026-06-20T00:00:00.000Z"
    },
    "dependencies": [
      "eve@^0.11.4",
      "@octokit/rest@^22.0.1",
      "zod@4.3.6"
    ],
    "files": [
      {
        "path": "agent/agent.ts",
        "target": "~/agent/agent.ts",
        "type": "registry:file",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  model: \"anthropic/claude-sonnet-4.6\",\n});\n"
      },
      {
        "path": "agent/instructions.md",
        "target": "~/agent/instructions.md",
        "type": "registry:file",
        "content": "# Mission\nInspect GitHub pull requests and releases to prepare release-risk notes.\n\n# Workflow\n1. Use collect_merged_prs to gather recently merged pull requests.\n2. Identify migrations, auth changes, dependency changes, and customer-visible work.\n3. Group risky changes separately from routine maintenance.\n4. Draft release notes that preserve traceability to pull request numbers.\n\n# Output contract\nProvide release themes, high-risk changes, missing validation, and rollout callouts.\n"
      },
      {
        "path": "agent/tools/collect_merged_prs.ts",
        "target": "~/agent/tools/collect_merged_prs.ts",
        "type": "registry:file",
        "content": "import { Octokit } from \"@octokit/rest\";\nimport { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nexport default defineTool({\n  description: \"Fetch recently merged GitHub pull requests for release analysis.\",\n  inputSchema: z.object({\n    owner: z.string().min(1),\n    repo: z.string().min(1),\n    limit: z.number().int().min(1).max(100).default(30),\n    since: z.string().optional(),\n  }),\n  async execute({ owner, repo, limit, since }) {\n    const auth = process.env.GITHUB_TOKEN;\n    if (!auth) {\n      return { authRequired: true, missingEnv: \"GITHUB_TOKEN\", owner, repo };\n    }\n\n    const octokit = new Octokit({ auth });\n    const response = await octokit.pulls.list({\n      owner,\n      repo,\n      state: \"closed\",\n      sort: \"updated\",\n      direction: \"desc\",\n      per_page: limit,\n    });\n\n    const sinceTime = since ? new Date(since).getTime() : 0;\n    const merged = response.data\n      .filter((pull) => pull.merged_at)\n      .filter((pull) => !sinceTime || new Date(pull.merged_at || 0).getTime() >= sinceTime)\n      .map((pull) => ({\n        number: pull.number,\n        title: pull.title,\n        author: pull.user?.login,\n        mergedAt: pull.merged_at,\n        url: pull.html_url,\n        labels: pull.labels.map((label) => label.name),\n      }));\n\n    return { owner, repo, mergedCount: merged.length, merged };\n  },\n});\n"
      },
      {
        "path": "README.md",
        "target": "~/agent/README.md",
        "type": "registry:file",
        "content": "# GitHub Release Scout\n\nConnects to GitHub, gathers recently merged pull requests, and prepares release notes that preserve traceability to PR numbers, labels, and rollout risk.\n\n## Development\n\n```bash\npnpm install\npnpm dev\n```\n\nRun `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.\n"
      }
    ]
  },
  "incident-commander": {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "incident-commander",
    "type": "registry:item",
    "title": "Incident Commander",
    "description": "Designed for the first thirty minutes of an outage. It builds a factual timeline, tracks action items, and drafts stakeholder updates without blurring facts and assumptions.",
    "author": "evex-new",
    "categories": [
      "devops"
    ],
    "meta": {
      "slug": "incident-commander",
      "category": "devops",
      "author": {
        "id": "evex-new",
        "name": "evex-new",
        "url": "https://evex-new.sh"
      },
      "createdAt": "2026-06-20T00:00:00.000Z",
      "updatedAt": "2026-06-20T00:00:00.000Z"
    },
    "dependencies": [
      "eve@^0.11.4",
      "date-fns@^4.4.0",
      "zod@4.3.6"
    ],
    "files": [
      {
        "path": "agent/agent.ts",
        "target": "~/agent/agent.ts",
        "type": "registry:file",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  model: \"openai/gpt-5.4\",\n});\n"
      },
      {
        "path": "agent/instructions.md",
        "target": "~/agent/instructions.md",
        "type": "registry:file",
        "content": "# Mission\nYou are the first operator in the room during a production incident.\n\n# Priorities\n1. Stabilize customer impact.\n2. Build a trustworthy timeline.\n3. Assign clear next actions with owners and deadlines.\n4. Separate facts from assumptions in every update.\n\n# Workflow\n- Use build_timeline to order raw signals before drawing conclusions.\n- Use track_actions whenever there are more than three workstreams.\n- Delegate to timeline_builder when the event sequence is messy or incomplete.\n- Delegate to status_writer when stakeholders need a clean update drafted quickly.\n- Delegate to mitigation_coordinator when the action list is broad and needs tighter ownership.\n- Load the incident-comms skill before drafting an executive or customer-facing update.\n- Name the blast radius, likely failure domain, and safest containment option.\n- Escalate uncertainty early when data is missing or contradictory.\n\n# Output contract\nProvide:\n- current severity and confidence\n- impact summary in customer terms\n- a timeline of confirmed events\n- the next three actions with owners\n- the message you would send to stakeholders right now\n"
      },
      {
        "path": "agent/skills/incident-comms/references/severity-matrix.md",
        "target": "~/agent/skills/incident-comms/references/severity-matrix.md",
        "type": "registry:file",
        "content": "# Severity guide\n- SEV1: widespread outage, data corruption, or security event in progress\n- SEV2: critical workflow degraded for a meaningful customer segment\n- SEV3: isolated or recoverable issue with a workaround\n\n# Upgrade the severity when\n- impact is spreading faster than mitigation\n- ownership is unclear\n- there is any chance of irreversible data loss\n\n# Downgrade only after\n- impact has stopped growing\n- mitigation is holding\n- follow-up owners are assigned\n"
      },
      {
        "path": "agent/skills/incident-comms/references/update-style.md",
        "target": "~/agent/skills/incident-comms/references/update-style.md",
        "type": "registry:file",
        "content": "# Update style\n- lead with customer impact\n- be explicit about uncertainty\n- avoid implementation trivia unless it affects decisions\n- always include the next checkpoint\n"
      },
      {
        "path": "agent/skills/incident-comms/SKILL.md",
        "target": "~/agent/skills/incident-comms/SKILL.md",
        "type": "registry:file",
        "content": "---\ndescription: Use when the incident needs a concise stakeholder or executive update.\n---\n\nWrite updates in four blocks:\n- current impact\n- what is confirmed\n- what is being done now\n- when the next update will arrive\n\nAvoid root-cause claims that are still speculative.\n"
      },
      {
        "path": "agent/subagents/mitigation_coordinator/agent.ts",
        "target": "~/agent/subagents/mitigation_coordinator/agent.ts",
        "type": "registry:file",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  description: \"Turn incident workstreams into an ordered mitigation plan with clear owners, blockers, and escalation points.\",\n  model: \"openai/gpt-5.4\",\n});\n"
      },
      {
        "path": "agent/subagents/mitigation_coordinator/instructions.md",
        "target": "~/agent/subagents/mitigation_coordinator/instructions.md",
        "type": "registry:file",
        "content": "You are the workstream coordination specialist.\n\nNormalize parallel mitigation tasks into an execution plan. Make blockers visible, identify\noverloaded owners, and tell the parent what should be escalated immediately.\n"
      },
      {
        "path": "agent/subagents/mitigation_coordinator/tools/triage_actions.ts",
        "target": "~/agent/subagents/mitigation_coordinator/tools/triage_actions.ts",
        "type": "registry:file",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nconst action = z.object({\n  summary: z.string().min(1),\n  owner: z.string().min(1),\n  blocked: z.boolean().default(false),\n  impact: z.enum([\"low\", \"medium\", \"high\"]),\n});\n\nexport default defineTool({\n  description: \"Order mitigation actions by impact and blocker state.\",\n  inputSchema: z.object({\n    actions: z.array(action).min(1),\n  }),\n  async execute({ actions }) {\n    const impactRank = { high: 3, medium: 2, low: 1 };\n\n    return {\n      prioritized: actions\n        .map((action) => ({\n          ...action,\n          score: impactRank[action.impact] * 2 - (action.blocked ? 2 : 0),\n        }))\n        .sort((left, right) => right.score - left.score),\n    };\n  },\n});\n"
      },
      {
        "path": "agent/subagents/status_writer/agent.ts",
        "target": "~/agent/subagents/status_writer/agent.ts",
        "type": "registry:file",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  description: \"Draft high-clarity incident updates for stakeholders, executives, or customers without changing the underlying facts.\",\n  model: \"openai/gpt-5.4\",\n});\n"
      },
      {
        "path": "agent/subagents/status_writer/instructions.md",
        "target": "~/agent/subagents/status_writer/instructions.md",
        "type": "registry:file",
        "content": "You are the communications specialist during incidents.\n\nRewrite facts into calm, direct status updates. Keep the message safe for broad distribution,\navoid blame, and never imply the incident is resolved unless containment is confirmed.\n"
      },
      {
        "path": "agent/subagents/status_writer/tools/format_update.ts",
        "target": "~/agent/subagents/status_writer/tools/format_update.ts",
        "type": "registry:file",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nexport default defineTool({\n  description: \"Structure a stakeholder-safe incident update.\",\n  inputSchema: z.object({\n    impact: z.string().min(1),\n    confirmed: z.array(z.string()).min(1),\n    inFlight: z.array(z.string()).min(1),\n    nextUpdateAt: z.string().min(1),\n  }),\n  async execute({ impact, confirmed, inFlight, nextUpdateAt }) {\n    return {\n      update: [\n        \"Impact: \" + impact,\n        \"Confirmed: \" + confirmed.join(\"; \"),\n        \"In progress: \" + inFlight.join(\"; \"),\n        \"Next update: \" + nextUpdateAt,\n      ].join(\"\\n\"),\n    };\n  },\n});\n"
      },
      {
        "path": "agent/subagents/timeline_builder/agent.ts",
        "target": "~/agent/subagents/timeline_builder/agent.ts",
        "type": "registry:file",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  description: \"Reconstruct an incident timeline, highlight evidence gaps, and return only the factual sequence needed by the parent.\",\n  model: \"openai/gpt-5.4\",\n});\n"
      },
      {
        "path": "agent/subagents/timeline_builder/instructions.md",
        "target": "~/agent/subagents/timeline_builder/instructions.md",
        "type": "registry:file",
        "content": "You are the timeline reconstruction specialist.\n\nSeparate confirmed events from inference. Call out missing telemetry windows, contradictory\ntimestamps, and moments where the team likely lost observability.\n"
      },
      {
        "path": "agent/subagents/timeline_builder/tools/find_gaps.ts",
        "target": "~/agent/subagents/timeline_builder/tools/find_gaps.ts",
        "type": "registry:file",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nconst eventWindow = z.object({\n  source: z.string().min(1),\n  startedAt: z.string().min(1),\n  endedAt: z.string().min(1),\n  confidence: z.enum([\"low\", \"medium\", \"high\"]).default(\"medium\"),\n});\n\nexport default defineTool({\n  description: \"Highlight weak evidence windows inside an incident timeline.\",\n  inputSchema: z.object({\n    windows: z.array(eventWindow).min(1),\n  }),\n  async execute({ windows }) {\n    return {\n      weakWindows: windows.filter((window) => window.confidence !== \"high\"),\n      sourceCount: new Set(windows.map((window) => window.source)).size,\n    };\n  },\n});\n"
      },
      {
        "path": "agent/tools/build_timeline.ts",
        "target": "~/agent/tools/build_timeline.ts",
        "type": "registry:file",
        "content": "import { defineTool } from \"eve/tools\";\nimport { differenceInMinutes, parseISO } from \"date-fns\";\nimport { z } from \"zod\";\n\nconst incidentEvent = z.object({\n  at: z.string().min(1),\n  source: z.string().min(1),\n  summary: z.string().min(1),\n  evidence: z.string().optional(),\n});\n\nexport default defineTool({\n  description: \"Sort incident signals into a timeline and highlight suspicious gaps.\",\n  inputSchema: z.object({\n    events: z.array(incidentEvent).min(1),\n  }),\n  async execute({ events }) {\n    const ordered = [...events].sort((left, right) => {\n      return parseISO(left.at).getTime() - parseISO(right.at).getTime();\n    });\n\n    const gaps = [];\n    for (let index = 1; index < ordered.length; index += 1) {\n      const previous = ordered[index - 1];\n      const current = ordered[index];\n      const gapMinutes = differenceInMinutes(\n        parseISO(current.at),\n        parseISO(previous.at),\n      );\n\n      if (gapMinutes >= 20) {\n        gaps.push({\n          after: previous.at,\n          before: current.at,\n          gapMinutes,\n        });\n      }\n    }\n\n    return {\n      sources: Array.from(new Set(ordered.map((event) => event.source))),\n      gaps,\n      timeline: ordered.map((event, index) => ({\n        index: index + 1,\n        ...event,\n      })),\n    };\n  },\n});\n"
      },
      {
        "path": "agent/tools/track_actions.ts",
        "target": "~/agent/tools/track_actions.ts",
        "type": "registry:file",
        "content": "import { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nconst actionItem = z.object({\n  summary: z.string().min(1),\n  owner: z.string().default(\"unassigned\"),\n  status: z.enum([\"planned\", \"in_progress\", \"blocked\", \"done\"]),\n  dueAt: z.string().optional(),\n  blockers: z.array(z.string()).default([]),\n});\n\nexport default defineTool({\n  description: \"Summarize operational action items and reveal owner or blocker gaps.\",\n  inputSchema: z.object({\n    actions: z.array(actionItem).min(1),\n  }),\n  async execute({ actions }) {\n    const byOwner: Record<string, number> = {};\n    const blocked: string[] = [];\n    const unassigned: string[] = [];\n\n    for (const action of actions) {\n      byOwner[action.owner] = (byOwner[action.owner] ?? 0) + 1;\n      if (action.status === \"blocked\") blocked.push(action.summary);\n      if (action.owner === \"unassigned\") unassigned.push(action.summary);\n    }\n\n    return {\n      total: actions.length,\n      blocked,\n      unassigned,\n      byOwner,\n      open: actions.filter((action) => action.status !== \"done\").length,\n    };\n  },\n});\n"
      },
      {
        "path": "README.md",
        "target": "~/agent/README.md",
        "type": "registry:file",
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
    "author": "evex-new",
    "categories": [
      "productivity"
    ],
    "meta": {
      "slug": "linear-sprint-triage",
      "category": "productivity",
      "author": {
        "id": "evex-new",
        "name": "evex-new",
        "url": "https://evex-new.sh"
      },
      "createdAt": "2026-06-20T00:00:00.000Z",
      "updatedAt": "2026-06-20T00:00:00.000Z"
    },
    "dependencies": [
      "eve@^0.11.4",
      "@linear/sdk@^86.0.0",
      "zod@4.3.6"
    ],
    "files": [
      {
        "path": "agent/agent.ts",
        "target": "~/agent/agent.ts",
        "type": "registry:file",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  model: \"openai/gpt-5.4-mini\",\n});\n"
      },
      {
        "path": "agent/instructions.md",
        "target": "~/agent/instructions.md",
        "type": "registry:file",
        "content": "# Mission\nInspect Linear issues and turn sprint risk into a focused engineering triage.\n\n# Workflow\n1. Use fetch_team_issues to pull active work for a Linear team.\n2. Highlight blocked, overdue, unassigned, and high-priority issues.\n3. Separate delivery risk from scope ambiguity.\n4. Recommend which issues need owner clarification or scope cuts.\n\n# Output contract\nReturn sprint risks, owner gaps, and a short standup-ready update.\n"
      },
      {
        "path": "agent/tools/fetch_team_issues.ts",
        "target": "~/agent/tools/fetch_team_issues.ts",
        "type": "registry:file",
        "content": "import { LinearClient } from \"@linear/sdk\";\nimport { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nexport default defineTool({\n  description: \"Fetch Linear issues for a team and identify delivery-risk signals.\",\n  inputSchema: z.object({\n    teamKey: z.string().min(1),\n    limit: z.number().int().min(1).max(100).default(40),\n  }),\n  async execute({ teamKey, limit }) {\n    const apiKey = process.env.LINEAR_API_KEY;\n    if (!apiKey) {\n      return { authRequired: true, missingEnv: \"LINEAR_API_KEY\", teamKey };\n    }\n\n    const linear = new LinearClient({ apiKey });\n    const issues = await linear.issues({\n      first: limit,\n      filter: { team: { key: { eq: teamKey } } },\n    });\n\n    const nodes = await Promise.all(\n      issues.nodes.map(async (issue) => {\n        const [assignee, state] = await Promise.all([\n          issue.assignee,\n          issue.state,\n        ]);\n\n        return {\n          identifier: issue.identifier,\n          title: issue.title,\n          priority: issue.priority,\n          estimate: issue.estimate,\n          assignee: assignee ? assignee.name : null,\n          state: state ? state.name : null,\n          url: issue.url,\n        };\n      }),\n    );\n\n    return {\n      teamKey,\n      issueCount: nodes.length,\n      unassigned: nodes.filter((issue) => !issue.assignee),\n      highPriority: nodes.filter(\n        (issue) => issue.priority > 0 && issue.priority <= 2,\n      ),\n      issues: nodes,\n    };\n  },\n});\n"
      },
      {
        "path": "README.md",
        "target": "~/agent/README.md",
        "type": "registry:file",
        "content": "# Linear Sprint Triage\n\nFetches Linear team issues, highlights unassigned or high-priority work, and separates delivery risk from simple backlog hygiene.\n\n## Development\n\n```bash\npnpm install\npnpm dev\n```\n\nRun `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.\n"
      }
    ]
  },
  "resend-lifecycle-mailer": {
    "$schema": "https://ui.shadcn.com/schema/registry.json",
    "name": "resend-lifecycle-mailer",
    "type": "registry:item",
    "title": "Resend Lifecycle Mailer",
    "description": "Builds event-driven lifecycle emails, previews exact recipients and HTML, and only sends through Resend when dry-run mode is disabled.",
    "author": "evex-new",
    "categories": [
      "support"
    ],
    "meta": {
      "slug": "resend-lifecycle-mailer",
      "category": "support",
      "author": {
        "id": "evex-new",
        "name": "evex-new",
        "url": "https://evex-new.sh"
      },
      "createdAt": "2026-06-20T00:00:00.000Z",
      "updatedAt": "2026-06-20T00:00:00.000Z"
    },
    "dependencies": [
      "eve@^0.11.4",
      "resend@^6.14.0",
      "zod@4.3.6"
    ],
    "files": [
      {
        "path": "agent/agent.ts",
        "target": "~/agent/agent.ts",
        "type": "registry:file",
        "content": "import { defineAgent } from \"eve\";\n\nexport default defineAgent({\n  model: \"openai/gpt-5.4-mini\",\n});\n"
      },
      {
        "path": "agent/instructions.md",
        "target": "~/agent/instructions.md",
        "type": "registry:file",
        "content": "# Mission\nDraft and optionally send lifecycle emails that are tied to clear product events.\n\n# Workflow\n1. Use send_lifecycle_email in dry-run mode to preview copy and recipients.\n2. Keep the subject concrete and the body tied to the user's actual state.\n3. Do not send unless a human has reviewed the exact recipients and copy.\n4. Report message IDs and failures when sending is enabled.\n\n# Output contract\nReturn the email preview, recipient count, and send status.\n"
      },
      {
        "path": "agent/tools/send_lifecycle_email.ts",
        "target": "~/agent/tools/send_lifecycle_email.ts",
        "type": "registry:file",
        "content": "import { Resend } from \"resend\";\nimport { defineTool } from \"eve/tools\";\nimport { z } from \"zod\";\n\nexport default defineTool({\n  description: \"Preview or send a lifecycle email through Resend.\",\n  inputSchema: z.object({\n    from: z.string().email(),\n    to: z.array(z.string().email()).min(1).max(50),\n    subject: z.string().min(1),\n    html: z.string().min(1),\n    dryRun: z.boolean().default(true),\n  }),\n  async execute({ from, to, subject, html, dryRun }) {\n    const apiKey = process.env.RESEND_API_KEY;\n    if (!apiKey) {\n      return { authRequired: true, missingEnv: \"RESEND_API_KEY\", recipients: to.length };\n    }\n\n    if (dryRun) {\n      return { dryRun: true, from, to, subject, htmlPreview: html.slice(0, 500) };\n    }\n\n    const resend = new Resend(apiKey);\n    const result = await resend.emails.send({ from, to, subject, html });\n    return { result };\n  },\n});\n"
      },
      {
        "path": "README.md",
        "target": "~/agent/README.md",
        "type": "registry:file",
        "content": "# Resend Lifecycle Mailer\n\nBuilds event-driven lifecycle emails, previews exact recipients and HTML, and only sends through Resend when dry-run mode is disabled.\n\n## Development\n\n```bash\npnpm install\npnpm dev\n```\n\nRun `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.\n"
      }
    ]
  }
} as const satisfies Record<string, RegistryItem>
