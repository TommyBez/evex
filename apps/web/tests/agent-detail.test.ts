import { describe, expect, it } from 'vitest'
import {
  compareRelatedAgents,
  countFilesByKind,
  getAgentDefinitionBlock,
  getAgentInstallSummaryDescription,
  getAgentJobIntentLede,
  getAgentMetaDescription,
  getAgentMetadataTitle,
  getAgentOgImageAlt,
  METADATA_DESCRIPTION_MAX_LENGTH,
  METADATA_TITLE_BUDGET,
  METADATA_TITLE_MAX_LENGTH,
  METADATA_TITLE_SUFFIX,
  pluralize,
  shouldRenderAgentDescriptionParagraph,
} from '@/lib/agent-detail'
import type { AgentRegistryFile, AgentWithAuthor } from '@/lib/agent-types'
import { listStaticAgents } from '@/lib/registry'
import { buildInstallCommand } from '@/lib/site-url'
import {
  createAgentListSchema,
  createAgentSoftwareSchema,
} from '@/lib/structured-data'

const RAW_MARKDOWN_MARKERS = /`|\*\*|\[rate limits\]\(/
const RAW_MARKDOWN_OR_CODE = /`|\*\*/
const RAW_MARKDOWN_ANY = /`|\*\*|\[.*?\]\(.*?\)/
const STRAY_PAREN_AROUND_NOTATION = /\)\s*notation|notation\s*\)/
const ENDS_WITH_OR_EXPLICIT = /or explicit\.?$/
const ENDS_WITH_COMMA = /,\s*$/

function makeFile(path: string): AgentRegistryFile {
  return { content: '', id: `x:${path}`, path, type: 'registry:file' }
}

function makeAgent(overrides: Partial<AgentWithAuthor>): AgentWithAuthor {
  return {
    author: { githubUsername: 'octocat', name: 'octocat' },
    authorAvatarUrl: null,
    authorName: 'octocat',
    authorUsername: 'octocat',
    category: 'general',
    createdAt: new Date('2026-01-01'),
    dependencies: '',
    description: 'desc',
    docs: null,
    id: 'agent-a',
    installCount: 0,
    name: 'Agent A',
    slug: 'agent-a',
    title: 'Agent A',
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  }
}

describe('countFilesByKind', () => {
  it('classifies subagents, skills, and tools', () => {
    const kinds = countFilesByKind([
      makeFile('agent/agent.ts'),
      makeFile('agent/subagents/researcher/agent.ts'),
      makeFile('agent/subagents/researcher/instructions.md'),
      makeFile('agent/subagents/writer/agent.ts'),
      makeFile('agent/skills/seo/SKILL.md'),
      makeFile('agent/tools/search.ts'),
    ])

    expect(kinds).toEqual({ skills: 1, subagents: 2, tools: 1 })
  })

  it('returns zeros for core-only agents', () => {
    expect(
      countFilesByKind([makeFile('agent/agent.ts'), makeFile('README.md')]),
    ).toEqual({ skills: 0, subagents: 0, tools: 0 })
  })
})

describe('getAgentInstallSummaryDescription', () => {
  it('falls back to baseline copy when nothing special ships', () => {
    const summary = getAgentInstallSummaryDescription({
      deps: [],
      fileKinds: { skills: 0, subagents: 0, tools: 0 },
    })
    expect(summary.installs).toBe('Core agent files only')
    expect(summary.requires).toBe('Runs on the eve baseline')
  })

  it('lists shipped kinds and dependencies', () => {
    const summary = getAgentInstallSummaryDescription({
      deps: ['eve@^0.31.3'],
      fileKinds: { skills: 2, subagents: 1, tools: 3 },
    })
    expect(summary.installs).toBe('1 subagent · 2 skill files · 3 tools')
    expect(summary.requires).toBe('eve@^0.31.3')
  })
})

// Locked job-intent metadata titles. Must not include ` · evex` — the layout
// template appends that once. Knowledge Base Gardener keeps its locked copy;
// the live catalog plays use the PMM-fitted strings below.
const JOB_INTENT_METADATA_TITLES: Readonly<Record<string, string>> = {
  'brand-visual-asset-generator': 'Eve brand SVG agent',
  'branded-seo-page-builder': 'Eve branded SEO page agent',
  'churn-renewal-risk': 'Eve churn and renewal risk - @evex/churn-renewal-risk',
  'code-reviewer': 'Eve PR review agent - install @evex/code-reviewer',
  'competitor-intel-monitor':
    'Eve competitor intel monitor - @evex/competitor-intel-monitor',
  'crm-hygiene-agent': 'Eve CRM hygiene agent - @evex/crm-hygiene-agent',
  'docs-knowledge-assistant':
    'Eve docs Q&A agent - install @evex/docs-knowledge-assistant',
  'email-triage-assistant':
    'Eve email triage assistant - @evex/email-triage-assistant',
  'eve-agent-builder': 'Eve agent builder - install @evex/eve-agent-builder',
  'github-ci-explainer':
    'Eve CI failure agent - install @evex/github-ci-explainer',
  'github-issue-maintainer':
    'Eve GitHub issue agent - install @evex/github-issue-maintainer',
  'inbound-lead-qualifier':
    'Eve inbound lead qualifier - @evex/inbound-lead-qualifier',
  'invoice-chase-drafter':
    'Eve invoice chase drafter - @evex/invoice-chase-drafter',
  'knowledge-base-gardener':
    'Eve knowledge base gardener - @evex/knowledge-base-gardener',
  'linear-operations-agent':
    'Eve Linear ops agent - @evex/linear-operations-agent',
  'meeting-action-extractor':
    'Meeting action extractor · @evex/meeting-action-extractor',
  'openui-assistant': 'Eve OpenUI agent - install @evex/openui-assistant',
  'rfp-response-drafter':
    'Eve RFP response drafter - @evex/rfp-response-drafter',
  'postgres-data-analyst':
    'Eve Postgres SQL agent - @evex/postgres-data-analyst',
  'programmatic-seo-agent': 'Eve programmatic SEO agent',
  'supabase-data-analyst':
    'Eve Supabase SQL agent - @evex/supabase-data-analyst',
  'support-reply-draft': 'Eve support reply agent - @evex/support-reply-draft',
  'x-draft-assistant': 'Eve X draft agent - install @evex/x-draft-assistant',
  'x-hot-topic-digest': 'Eve X digest agent - install @evex/x-hot-topic-digest',
}

const JOB_INTENT_LEDES: Readonly<Record<string, string>> = {
  'brand-visual-asset-generator':
    'Generates brand-aligned SVG packs from a site.',
  'branded-seo-page-builder': 'Builds an on-brand SEO page from a domain.',
  'churn-renewal-risk':
    'Weekly cron scores CRM accounts in a renewal window against Stripe payment health, posts a Slack digest of Healthy/Watch/At-risk movers, and drafts save plays as CRM notes behind approval without emailing the customer.',
  'code-reviewer': 'PR review agent for Eve.',
  'competitor-intel-monitor':
    'Watches competitor pages on a schedule and sends a scored Slack or email digest when something changes.',
  'crm-hygiene-agent':
    'On a schedule, scans HubSpot, Salesforce, or Pipedrive via Connect and proposes dedupe, normalize, and enrich work you approve before anything writes.',
  'docs-knowledge-assistant': 'Docs Q&A agent for Eve.',
  'email-triage-assistant':
    'Triages Gmail, Outlook, or IMAP threads and writes tone-matched draft replies you send yourself.',
  'eve-agent-builder': 'Scaffolds, checks, and deploys a new Eve agent.',
  'github-ci-explainer': 'Explains failed GitHub Actions checks from the log.',
  'github-issue-maintainer': 'GitHub issue agent for Eve.',
  'inbound-lead-qualifier':
    'Takes inbound leads from a signed webhook, CRM scan, or Typeform poll, enriches and scores ICP fit, then drafts a CRM note and Slack-pings only the hot ones.',
  'invoice-chase-drafter':
    'On a weekday schedule, pulls open AR from QuickBooks or Xero over Connect, ages it into buckets, and drafts reminder emails into Drafts while Slack gets the finance digest.',
  'knowledge-base-gardener':
    'Finds stale product docs and drafts updates with file cites.',
  'linear-operations-agent':
    'Triages Linear work and posts Slack cycle digests.',
  'meeting-action-extractor':
    'Extracts owners and deadlines from meeting transcripts, then drafts Linear follow-ups you approve.',
  'openui-assistant': 'Streams OpenUI generative UI in an Eve chat.',
  'rfp-response-drafter':
    'Pulls RFPs from Drive or the sandbox, grounds each answer in a knowledge pack with file citations, routes open questions to SMEs on Slack, and writes an approved draft Doc without submitting a portal response.',
  'postgres-data-analyst':
    'Answers Slack questions with read-only Postgres SQL.',
  'programmatic-seo-agent': 'Finds keywords and opens a PR of SEO pages.',
  'supabase-data-analyst':
    'Answers Slack questions with read-only Supabase SQL.',
  'support-reply-draft':
    'Drafts a customer reply from product docs and cites the file.',
  'x-draft-assistant': 'Drafts three X posts from accounts you follow.',
  'x-hot-topic-digest': 'Emails a daily digest of hot topics from X.',
}

describe('getAgentMetadataTitle', () => {
  it('prefers the full install title when it fits', () => {
    const agent = makeAgent({ name: 'Short', slug: 'short' })
    expect(getAgentMetadataTitle(agent)).toBe('Short - install @evex/short')
  })

  it('overrides the title for code-reviewer only', () => {
    const agent = makeAgent({
      name: 'Code Reviewer',
      slug: 'code-reviewer',
      title: 'Code Reviewer',
    })
    expect(getAgentMetadataTitle(agent)).toBe(
      'Eve PR review agent - install @evex/code-reviewer',
    )
    expect(getAgentMetadataTitle(agent).length).toBeLessThanOrEqual(
      METADATA_TITLE_BUDGET,
    )
  })

  it('overrides the title for github-issue-maintainer only', () => {
    const agent = makeAgent({
      name: 'GitHub Issue Maintainer',
      slug: 'github-issue-maintainer',
      title: 'GitHub Issue Maintainer',
    })
    const title = getAgentMetadataTitle(agent)
    expect(title).toBe(
      'Eve GitHub issue agent - install @evex/github-issue-maintainer',
    )
    // Locked PMM copy intentionally exceeds METADATA_TITLE_BUDGET; the layout
    // still appends ` · evex` once (must not be in the helper return value).
    expect(title).not.toContain(METADATA_TITLE_SUFFIX)
    expect(title.length).toBeGreaterThan(METADATA_TITLE_BUDGET)
  })

  it('overrides the title for docs-knowledge-assistant only', () => {
    const agent = makeAgent({
      name: 'Docs Knowledge Assistant',
      slug: 'docs-knowledge-assistant',
      title: 'Docs Knowledge Assistant',
    })
    const title = getAgentMetadataTitle(agent)
    expect(title).toBe(
      'Eve docs Q&A agent - install @evex/docs-knowledge-assistant',
    )
    expect(title).not.toContain(METADATA_TITLE_SUFFIX)
    expect(title.length).toBeGreaterThan(METADATA_TITLE_BUDGET)
  })

  it('overrides the title for github-ci-explainer only', () => {
    const agent = makeAgent({
      name: 'GitHub CI Explainer',
      slug: 'github-ci-explainer',
      title: 'GitHub CI Explainer',
    })
    const title = getAgentMetadataTitle(agent)
    expect(title).toBe(
      'Eve CI failure agent - install @evex/github-ci-explainer',
    )
    expect(title).not.toContain(METADATA_TITLE_SUFFIX)
    expect(title.length).toBeGreaterThan(METADATA_TITLE_BUDGET)
  })

  for (const [slug, expectedTitle] of Object.entries(
    JOB_INTENT_METADATA_TITLES,
  )) {
    it(`locks the job-intent title for ${slug}`, () => {
      const agent = makeAgent({ name: `Name for ${slug}`, slug })
      const title = getAgentMetadataTitle(agent)
      expect(title).toBe(expectedTitle)
      expect(title).not.toContain(METADATA_TITLE_SUFFIX)
      if (expectedTitle.length <= METADATA_TITLE_BUDGET) {
        expect(title.length).toBeLessThanOrEqual(METADATA_TITLE_BUDGET)
      }
    })
  }

  it('keeps the name-based pattern for other agents', () => {
    const agent = makeAgent({
      name: 'Custom Helper',
      slug: 'custom-helper',
    })
    expect(getAgentMetadataTitle(agent)).toBe(
      'Custom Helper - install @evex/custom-helper',
    )
  })

  // Registry slugs may be `constructor`; Object.prototype must not leak.
  it('ignores prototype keys like constructor on the title override map', () => {
    const agent = makeAgent({
      name: 'Constructor Agent',
      slug: 'constructor',
    })
    const title = getAgentMetadataTitle(agent)
    expect(typeof title).toBe('string')
    expect(title).toBe('Constructor Agent - install @evex/constructor')
    expect(title).not.toBe(Object.prototype.constructor)
  })

  it('never exceeds the metadata length budget', () => {
    const agent = makeAgent({
      name: 'A very long agent display name that keeps going',
      slug: 'a-very-long-agent-slug-that-also-keeps-going',
    })
    expect(getAgentMetadataTitle(agent).length).toBeLessThanOrEqual(
      METADATA_TITLE_BUDGET,
    )
  })

  it('drops the brand from the fallback so the layout template owns it', () => {
    const agent = makeAgent({
      name: 'A Very Long Unlocked Agent Display Name',
      slug: 'a-very-long-unlocked-agent-display-name',
    })
    expect(getAgentMetadataTitle(agent)).toBe(
      'A Very Long Unlocked Agent Display Name',
    )
  })
})

describe('getAgentJobIntentLede', () => {
  it('returns job-intent ledes for first-party play pages', () => {
    expect(getAgentJobIntentLede('code-reviewer')).toBe(
      'PR review agent for Eve.',
    )
    expect(getAgentJobIntentLede('github-issue-maintainer')).toBe(
      'GitHub issue agent for Eve.',
    )
    expect(getAgentJobIntentLede('docs-knowledge-assistant')).toBe(
      'Docs Q&A agent for Eve.',
    )
    expect(getAgentJobIntentLede('github-ci-explainer')).toBe(
      'Explains failed GitHub Actions checks from the log.',
    )
  })

  for (const [slug, expectedLede] of Object.entries(JOB_INTENT_LEDES)) {
    it(`locks the job-intent lede for ${slug}`, () => {
      expect(getAgentJobIntentLede(slug)).toBe(expectedLede)
    })
  }

  it('returns null for unlocked slugs', () => {
    expect(getAgentJobIntentLede('custom-helper')).toBeNull()
    expect(getAgentJobIntentLede('short')).toBeNull()
  })

  it('ignores prototype keys like constructor on the lede map', () => {
    expect(getAgentJobIntentLede('constructor')).toBeNull()
  })
})

describe('shouldRenderAgentDescriptionParagraph', () => {
  it('hides the registry description when it duplicates the job-intent lede', () => {
    expect(
      shouldRenderAgentDescriptionParagraph({
        description:
          'Finds stale product docs and drafts updates with file cites.',
        jobIntentLede:
          'Finds stale product docs and drafts updates with file cites.',
      }),
    ).toBe(false)
  })

  it('hides a Markdown-formatted description that matches the job-intent lede', () => {
    expect(
      shouldRenderAgentDescriptionParagraph({
        description:
          'Finds **stale** product docs and drafts updates with file cites.',
        jobIntentLede:
          'Finds stale product docs and drafts updates with file cites.',
      }),
    ).toBe(false)
  })

  it('treats whitespace and case as the same sentence', () => {
    expect(
      shouldRenderAgentDescriptionParagraph({
        description:
          '  Finds stale product docs and drafts updates with file cites.  ',
        jobIntentLede:
          'Finds stale product docs and drafts updates with file cites.',
      }),
    ).toBe(false)
  })

  it('keeps a distinct description when a job-intent lede is present', () => {
    expect(
      shouldRenderAgentDescriptionParagraph({
        description: 'Review GitHub pull requests from a native GitHub App.',
        jobIntentLede: 'PR review agent for Eve.',
      }),
    ).toBe(true)
  })

  it('keeps the description when there is no job-intent lede', () => {
    expect(
      shouldRenderAgentDescriptionParagraph({
        description: 'A helper without a locked lede.',
        jobIntentLede: null,
      }),
    ).toBe(true)
  })
})

const DEMAND_BACKED_PLAYS = [
  'churn-renewal-risk',
  'competitor-intel-monitor',
  'crm-hygiene-agent',
  'email-triage-assistant',
  'inbound-lead-qualifier',
  'invoice-chase-drafter',
  'knowledge-base-gardener',
  'meeting-action-extractor',
  'rfp-response-drafter',
] as const

const DEMAND_BACKED_DESCRIPTIONS: Readonly<Record<string, string>> = {
  'churn-renewal-risk':
    'Churn and renewal risk scanner via Connect CRM and Stripe that Slack-digests Healthy/Watch/At-risk movers and drafts HITL CRM save plays without auto-emailing customers.',
  'competitor-intel-monitor':
    'Scheduled competitor URL monitor that diffs pages and delivers scored Slack or email digests.',
  'crm-hygiene-agent':
    'Scheduled CRM hygiene via Connect that proposes dedupe, normalize, and enrich batches for human approval before any write.',
  'email-triage-assistant':
    'Inbox triage that classifies threads and writes draft replies without sending.',
  'inbound-lead-qualifier':
    'Inbound lead qualifier via signed intake or Connect CRM/Typeform that scores ICP fit, drafts approved CRM notes, and Slack-notifies hot leads only.',
  'invoice-chase-drafter':
    'Weekday AR chase via Connect that drafts mailbox reminders from QuickBooks or Xero and posts an idempotent Slack digest after a paid re-check.',
  'knowledge-base-gardener':
    'Finds stale product docs and drafts updates with file cites.',
  'meeting-action-extractor':
    'Extracts owners and deadlines from a meeting transcript and drafts Linear follow-ups for approval.',
  'rfp-response-drafter':
    'RFP response drafter via Google Drive Connect and sandbox files that cites every claim, Slack-routes SME gaps, and write-backs approved Drive or mailbox drafts without portal submit.',
}

const DEMAND_BACKED_LEDE_STEMS: Readonly<Record<string, string>> = {
  'churn-renewal-risk': 'weekly cron scores crm accounts',
  'competitor-intel-monitor': 'watches competitor pages on a schedule',
  'crm-hygiene-agent': 'scans hubspot, salesforce, or pipedrive',
  'email-triage-assistant': 'triages gmail, outlook, or imap',
  'inbound-lead-qualifier': 'takes inbound leads from a signed webhook',
  'invoice-chase-drafter': 'pulls open ar from quickbooks',
  'knowledge-base-gardener': 'finds stale product docs',
  'meeting-action-extractor':
    'extracts owners and deadlines from meeting transcripts',
  'rfp-response-drafter': 'pulls rfps from drive or the sandbox',
}

describe('demand-backed first-party plays', () => {
  for (const slug of DEMAND_BACKED_PLAYS) {
    it(`locks title, lede, description, and install for ${slug}`, () => {
      const agent = listStaticAgents().find((item) => item.slug === slug)
      expect(agent).toBeDefined()
      if (!agent) {
        return
      }

      const title = JOB_INTENT_METADATA_TITLES[slug]
      const lede = JOB_INTENT_LEDES[slug]
      const description = DEMAND_BACKED_DESCRIPTIONS[slug]
      expect(title).toBeDefined()
      expect(lede).toBeDefined()
      expect(description).toBeDefined()
      expect(getAgentMetadataTitle(agent)).toBe(title)
      expect(getAgentJobIntentLede(slug)).toBe(lede)
      expect(agent.description).toBe(description)
      expect(buildInstallCommand(slug)).toBe(
        `npx shadcn@latest add @evex/${slug}`,
      )
      const ledeStem = DEMAND_BACKED_LEDE_STEMS[slug]
      expect(ledeStem).toBeDefined()
      expect(agent.docs?.overview[0]?.toLowerCase()).not.toContain(ledeStem)
      expect(
        shouldRenderAgentDescriptionParagraph({
          description: agent.description,
          jobIntentLede: lede,
        }),
      ).toBe(description !== lede)
    })
  }
})

describe('getAgentMetaDescription', () => {
  it('strips inline Markdown markers from the SERP description', () => {
    const agent = makeAgent({
      description:
        'Review PRs with `inline` comments, **suggestion** blocks, and [rate limits](https://example.com).',
      slug: 'code-reviewer',
    })
    const description = getAgentMetaDescription(agent)

    expect(description).not.toMatch(RAW_MARKDOWN_MARKERS)
    expect(description).toContain('inline')
    expect(description).toContain('suggestion')
    expect(description).toContain('rate limits')
  })

  it('strips Markdown links whose destinations contain balanced parentheses', () => {
    const agent = makeAgent({
      description:
        'Explains [function](https://example.com/Function_(mathematics)) notation for agent prompts.',
      slug: 'code-reviewer',
    })
    const description = getAgentMetaDescription(agent)

    expect(description).toContain('function')
    expect(description).not.toContain('https://example.com')
    expect(description).not.toContain('Function_(mathematics)')
    expect(description).not.toMatch(STRAY_PAREN_AROUND_NOTATION)
  })

  it('preserves double-underscore tool names when stripping Markdown', () => {
    const agent = makeAgent({
      description:
        'Uses supabase__list_tables and supabase__execute_sql for read-only SQL.',
      slug: 'supabase-data-analyst',
    })
    const description = getAgentMetaDescription(agent)

    expect(description).toContain('supabase__list_tables')
    expect(description).toContain('supabase__execute_sql')
    expect(description).not.toContain('supabaselisttables')
    expect(description).not.toContain('supabaseexecutesql')
  })

  it('stays within the SERP description budget', () => {
    const agent = makeAgent({
      description:
        'Review GitHub pull requests from a native GitHub App channel. Mention `@code-reviewer` on a pull request to publish a GitHub review with inline comments, optional suggestion blocks, and Upstash-backed rate limiting for public repositories.',
      slug: 'code-reviewer',
    })
    const description = getAgentMetaDescription(agent)

    expect(description.length).toBeLessThanOrEqual(
      METADATA_DESCRIPTION_MAX_LENGTH,
    )
  })

  it('returns the exact live code-reviewer SERP/OG meta description', () => {
    const lead =
      'Eve agent for GitHub PR review. Mention it on a PR for inline comments on bugs, not style.'
    const expected =
      'Eve agent for GitHub PR review. Mention it on a PR for inline comments on bugs, not style. Install with npx shadcn@latest add @evex/code-reviewer.'
    const agent = makeAgent({
      description: lead,
      slug: 'code-reviewer',
    })
    const description = getAgentMetaDescription(agent)

    expect(lead).not.toContain('Install with')
    expect(expected.length).toBe(146)
    expect(description.length).toBe(146)
    expect(description).toBe(expected)
    expect(description).not.toContain('publish a GitHub.')
  })

  it('returns the exact live github-issue-maintainer SERP/OG meta description', () => {
    const lead =
      'Labels GitHub issues, asks for missing repro, and emails a weekly digest.'
    const expected =
      'Labels GitHub issues, asks for missing repro, and emails a weekly digest. Install with npx shadcn@latest add @evex/github-issue-maintainer.'
    const agent = makeAgent({
      description: lead,
      slug: 'github-issue-maintainer',
    })
    const description = getAgentMetaDescription(agent)
    const install = buildInstallCommand('github-issue-maintainer')

    expect(lead).not.toContain('Install with')
    expect(install).toBe('npx shadcn@latest add @evex/github-issue-maintainer')
    expect(description.length).toBeLessThanOrEqual(
      METADATA_DESCRIPTION_MAX_LENGTH,
    )
    expect(description).toBe(expected)
    expect(description).toContain(`Install with ${install}`)
    expect(description).toContain(
      'npx shadcn@latest add @evex/github-issue-maintainer',
    )
  })

  it('returns the exact live docs-knowledge-assistant SERP/OG meta description', () => {
    const lead = 'Answers from your repo docs and cites the file.'
    const expected =
      'Answers from your repo docs and cites the file. Install with npx shadcn@latest add @evex/docs-knowledge-assistant.'
    const agent = makeAgent({
      description: lead,
      slug: 'docs-knowledge-assistant',
    })
    const description = getAgentMetaDescription(agent)
    const install = buildInstallCommand('docs-knowledge-assistant')

    expect(lead).not.toContain('Install with')
    expect(install).toBe('npx shadcn@latest add @evex/docs-knowledge-assistant')
    expect(description.length).toBeLessThanOrEqual(
      METADATA_DESCRIPTION_MAX_LENGTH,
    )
    expect(description.length).toBeLessThanOrEqual(155)
    expect(description).toBe(expected)
    expect(description).toContain(`Install with ${install}`)
  })

  it('returns the exact live github-ci-explainer SERP/OG meta description', () => {
    const lead = 'Explains failed GitHub Actions checks from the log.'
    const expected =
      'Explains failed GitHub Actions checks from the log. Install with npx shadcn@latest add @evex/github-ci-explainer.'
    const agent = makeAgent({
      description: lead,
      slug: 'github-ci-explainer',
    })
    const description = getAgentMetaDescription(agent)
    const install = buildInstallCommand('github-ci-explainer')

    expect(lead).not.toContain('Install with')
    expect(install).toBe('npx shadcn@latest add @evex/github-ci-explainer')
    expect(description.length).toBeLessThanOrEqual(
      METADATA_DESCRIPTION_MAX_LENGTH,
    )
    expect(description.length).toBeLessThanOrEqual(155)
    expect(description).toBe(expected)
    expect(description).toContain(`Install with ${install}`)
  })

  it('appends the shadcn install command when space allows', () => {
    const agent = makeAgent({
      description:
        'Review GitHub pull requests from a native GitHub App channel. Mention `@code-reviewer` on a pull request to publish a GitHub review with inline comments, optional suggestion blocks, and Upstash-backed rate limiting for public repositories.',
      slug: 'code-reviewer',
    })
    const description = getAgentMetaDescription(agent)
    const install = buildInstallCommand('code-reviewer')

    expect(install).toBe('npx shadcn@latest add @evex/code-reviewer')
    expect(description).toContain(`Install with ${install}`)
    expect(description.endsWith('.')).toBe(true)
  })

  it('skips the install CTA when the slug leaves no room for a lead-in', () => {
    const longSlug = 'a'.repeat(120)
    const agent = makeAgent({
      description: 'Short useful summary for an eve agent.',
      slug: longSlug,
    })
    const description = getAgentMetaDescription(agent)

    expect(description.length).toBeLessThanOrEqual(
      METADATA_DESCRIPTION_MAX_LENGTH,
    )
    expect(description).not.toContain('Install with')
    expect(description).toContain('Short useful summary')
  })
})

describe('getAgentOgImageAlt', () => {
  it('names the agent and the registry', () => {
    expect(getAgentOgImageAlt(makeAgent({ name: 'Code Reviewer' }))).toBe(
      'Code Reviewer: eve agent on evex',
    )
  })
})

describe('getAgentDefinitionBlock', () => {
  it('builds a 45-60 word What-is block with the shadcn install command', () => {
    const agent = makeAgent({
      category: 'coding',
      description:
        'Review GitHub pull requests from a native GitHub App channel. Mention `@code-reviewer` on a pull request.',
      docs: {
        faqs: [],
        howItWorks: [],
        overview: ['After install you own the files.'],
        requirements: [],
        useCases: [],
      },
      name: 'Code Reviewer',
      slug: 'code-reviewer',
    })
    const block = getAgentDefinitionBlock(agent)

    expect(block.heading).toBe('What is Code Reviewer?')
    expect(block.installCommand).toBe(
      'npx shadcn@latest add @evex/code-reviewer',
    )
    expect(block.plainText).toContain(block.installCommand)
    expect(block.plainText).not.toContain('eve add')
    expect(block.plainText).not.toMatch(RAW_MARKDOWN_OR_CODE)
    expect(block.wordCount).toBeGreaterThanOrEqual(40)
    expect(block.wordCount).toBeLessThanOrEqual(60)
    expect(block.beforeCommand.endsWith('with ')).toBe(true)
    expect(block.afterCommand.startsWith('.')).toBe(true)
  })

  it('strips markdown leftovers from the job clause', () => {
    const agent = makeAgent({
      description:
        'Ship reviews with `inline` comments and **suggestion** blocks for PRs.',
      name: 'Review Helper',
      slug: 'review-helper',
    })
    const block = getAgentDefinitionBlock(agent)

    expect(block.plainText).toContain('inline')
    expect(block.plainText).toContain('suggestion')
    expect(block.plainText).not.toMatch(RAW_MARKDOWN_OR_CODE)
    expect(block.installCommand).toBe(
      'npx shadcn@latest add @evex/review-helper',
    )
  })

  it('does not assume coding agents are pull-request reviewers', () => {
    const agent = makeAgent({
      category: 'coding',
      description:
        'An Eve coding agent that creates Eve agents, runs their checks, deploys them to Vercel, and verifies the live routes.',
      docs: {
        faqs: [],
        howItWorks: [],
        overview: [
          'Eve Agent Builder turns a plain request into a tested, deployed Eve agent.',
        ],
        requirements: [],
        useCases: [],
      },
      name: 'Eve Agent Builder',
      slug: 'eve-agent-builder',
    })
    const block = getAgentDefinitionBlock(agent)

    expect(block.plainText).toContain('Eve developers building with code')
    expect(block.plainText).not.toContain('reviewing pull requests')
  })

  it('truncates under-45 filler on a clause boundary instead of mid-phrase', () => {
    const agent = makeAgent({
      category: 'marketing',
      description:
        'Generate brand-aligned SVG asset packs for SaaS products using Context.dev brand extraction and a Quiver Arrow SVG tool.',
      docs: {
        faqs: [],
        howItWorks: [],
        overview: [
          'Brand Visual Asset Generator is an on-demand eve agent that turns a company domain, product description, or explicit brand profile into a coherent pack of editable SVG assets for marketing sites.',
        ],
        requirements: [],
        useCases: [],
      },
      name: 'Brand Visual Asset Generator',
      slug: 'brand-visual-asset-generator',
    })
    const block = getAgentDefinitionBlock(agent)

    expect(block.wordCount).toBeLessThanOrEqual(60)
    expect(block.plainText.endsWith('.')).toBe(true)
    expect(block.plainText).not.toMatch(ENDS_WITH_OR_EXPLICIT)
    expect(block.plainText).not.toMatch(ENDS_WITH_COMMA)
  })

  it('uses a distinct draft-only clause for knowledge-base-gardener', () => {
    const agent = listStaticAgents().find(
      (item) => item.slug === 'knowledge-base-gardener',
    )
    expect(agent).toBeDefined()
    if (!agent) {
      return
    }

    const lede = getAgentJobIntentLede('knowledge-base-gardener')
    const block = getAgentDefinitionBlock(agent)
    expect(lede).toBe(
      'Finds stale product docs and drafts updates with file cites.',
    )
    expect(block.plainText).not.toContain(lede)
    expect(block.plainText.toLowerCase()).not.toContain(
      'finds stale product docs',
    )
    expect(block.plainText).toContain(
      'Knowledge Base Gardener is an Eve agent that reads docs on disk and drafts a cited update you review.',
    )
    expect(block.plainText).toContain(
      'npx shadcn@latest add @evex/knowledge-base-gardener',
    )
  })

  it('uses a distinct lowercase What-is clause for crm-hygiene-agent', () => {
    const agent = listStaticAgents().find(
      (item) => item.slug === 'crm-hygiene-agent',
    )
    expect(agent).toBeDefined()
    if (!agent) {
      return
    }

    const job =
      'scans the CRM on a cron, drafts a cleanup batch for Slack or digest review, and writes only after you approve'
    expect(job.startsWith('scans')).toBe(true)
    expect(job.endsWith('.')).toBe(false)

    const lede = getAgentJobIntentLede('crm-hygiene-agent')
    const block = getAgentDefinitionBlock(agent)
    expect(lede).toBe(
      'On a schedule, scans HubSpot, Salesforce, or Pipedrive via Connect and proposes dedupe, normalize, and enrich work you approve before anything writes.',
    )
    expect(agent.description).toBe(
      'Scheduled CRM hygiene via Connect that proposes dedupe, normalize, and enrich batches for human approval before any write.',
    )
    expect(block.plainText).not.toContain(lede)
    expect(block.plainText.toLowerCase()).not.toContain(
      'scans hubspot, salesforce, or pipedrive',
    )
    expect(block.plainText).toContain(
      `CRM Hygiene Agent is an Eve agent that ${job}.`,
    )
    expect(block.plainText).toContain(
      'npx shadcn@latest add @evex/crm-hygiene-agent',
    )
    expect(block.plainText).not.toContain('eve add')
  })

  it('uses a distinct lowercase What-is clause for churn-renewal-risk', () => {
    const agent = listStaticAgents().find(
      (item) => item.slug === 'churn-renewal-risk',
    )
    expect(agent).toBeDefined()
    if (!agent) {
      return
    }

    const job =
      'scans renewal-dated CRM accounts with Stripe health on a cron, Slack-digests risk buckets, and drafts owner save plays as approved CRM notes'
    expect(job.startsWith('scans')).toBe(true)
    expect(job.endsWith('.')).toBe(false)

    const lede = getAgentJobIntentLede('churn-renewal-risk')
    const block = getAgentDefinitionBlock(agent)
    expect(lede).toBe(
      'Weekly cron scores CRM accounts in a renewal window against Stripe payment health, posts a Slack digest of Healthy/Watch/At-risk movers, and drafts save plays as CRM notes behind approval without emailing the customer.',
    )
    expect(agent.description).toBe(
      'Churn and renewal risk scanner via Connect CRM and Stripe that Slack-digests Healthy/Watch/At-risk movers and drafts HITL CRM save plays without auto-emailing customers.',
    )
    expect(block.plainText).not.toContain(lede)
    expect(block.plainText.toLowerCase()).not.toContain(
      'weekly cron scores crm accounts',
    )
    expect(block.plainText).toContain(
      `Churn and Renewal Risk is an Eve agent that ${job}.`,
    )
    expect(block.plainText).toContain(
      'npx shadcn@latest add @evex/churn-renewal-risk',
    )
    expect(block.plainText).not.toContain('eve add')
  })

  it('uses a distinct lowercase What-is clause for email-triage-assistant', () => {
    const agent = listStaticAgents().find(
      (item) => item.slug === 'email-triage-assistant',
    )
    expect(agent).toBeDefined()
    if (!agent) {
      return
    }

    const job =
      'reads the inbox on a schedule or push, sorts threads into buckets, and leaves replies in Drafts only'
    expect(job.startsWith('reads')).toBe(true)
    expect(job.endsWith('.')).toBe(false)

    const lede = getAgentJobIntentLede('email-triage-assistant')
    const block = getAgentDefinitionBlock(agent)
    expect(lede).toBe(
      'Triages Gmail, Outlook, or IMAP threads and writes tone-matched draft replies you send yourself.',
    )
    expect(agent.description).toBe(
      'Inbox triage that classifies threads and writes draft replies without sending.',
    )
    expect(block.plainText).not.toContain(lede)
    expect(block.plainText.toLowerCase()).not.toContain(
      'triages gmail, outlook, or imap',
    )
    expect(block.plainText).toContain(
      `Email Triage Assistant is an Eve agent that ${job}.`,
    )
    expect(block.plainText).toContain(
      'npx shadcn@latest add @evex/email-triage-assistant',
    )
  })

  it('uses a distinct lowercase What-is clause for inbound-lead-qualifier', () => {
    const agent = listStaticAgents().find(
      (item) => item.slug === 'inbound-lead-qualifier',
    )
    expect(agent).toBeDefined()
    if (!agent) {
      return
    }

    const job =
      'ingests leads over push or cron, enriches and scores them, drafts a CRM note behind approval, and posts only hot leads to Slack'
    expect(job.startsWith('ingests')).toBe(true)
    expect(job.endsWith('.')).toBe(false)

    const lede = getAgentJobIntentLede('inbound-lead-qualifier')
    const block = getAgentDefinitionBlock(agent)
    expect(lede).toBe(
      'Takes inbound leads from a signed webhook, CRM scan, or Typeform poll, enriches and scores ICP fit, then drafts a CRM note and Slack-pings only the hot ones.',
    )
    expect(agent.description).toBe(
      'Inbound lead qualifier via signed intake or Connect CRM/Typeform that scores ICP fit, drafts approved CRM notes, and Slack-notifies hot leads only.',
    )
    expect(block.plainText).not.toContain(lede)
    expect(block.plainText.toLowerCase()).not.toContain(
      'takes inbound leads from a signed webhook',
    )
    expect(block.plainText).toContain(
      `Inbound Lead Qualifier is an Eve agent that ${job}.`,
    )
    expect(block.plainText).toContain(
      'npx shadcn@latest add @evex/inbound-lead-qualifier',
    )
    expect(block.plainText).not.toContain('eve add')
  })

  it('uses a distinct lowercase What-is clause for invoice-chase-drafter', () => {
    const agent = listStaticAgents().find(
      (item) => item.slug === 'invoice-chase-drafter',
    )
    expect(agent).toBeDefined()
    if (!agent) {
      return
    }

    const job =
      'pulls open invoices on a weekday cron, leaves reminder drafts in Drafts only, and posts an idempotent AR digest to Slack for finance'
    expect(job.startsWith('pulls')).toBe(true)
    expect(job.endsWith('.')).toBe(false)

    const lede = getAgentJobIntentLede('invoice-chase-drafter')
    const block = getAgentDefinitionBlock(agent)
    expect(lede).toBe(
      'On a weekday schedule, pulls open AR from QuickBooks or Xero over Connect, ages it into buckets, and drafts reminder emails into Drafts while Slack gets the finance digest.',
    )
    expect(agent.description).toBe(
      'Weekday AR chase via Connect that drafts mailbox reminders from QuickBooks or Xero and posts an idempotent Slack digest after a paid re-check.',
    )
    expect(block.plainText).not.toContain(lede)
    expect(block.plainText.toLowerCase()).not.toContain(
      'pulls open ar from quickbooks',
    )
    expect(block.plainText).toContain(
      `Invoice Chase Drafter is an Eve agent that ${job}.`,
    )
    expect(block.plainText).toContain(
      'npx shadcn@latest add @evex/invoice-chase-drafter',
    )
    expect(block.plainText).not.toContain('eve add')
  })

  it('uses a distinct lowercase What-is clause for rfp-response-drafter', () => {
    const agent = listStaticAgents().find(
      (item) => item.slug === 'rfp-response-drafter',
    )
    expect(agent).toBeDefined()
    if (!agent) {
      return
    }

    const job =
      'drafts cited RFP answers from Drive or sandbox knowledge packs, pauses for Slack SME approval, and writes back only as an approved draft'
    expect(job.startsWith('drafts')).toBe(true)
    expect(job.endsWith('.')).toBe(false)

    const lede = getAgentJobIntentLede('rfp-response-drafter')
    const block = getAgentDefinitionBlock(agent)
    expect(lede).toBe(
      'Pulls RFPs from Drive or the sandbox, grounds each answer in a knowledge pack with file citations, routes open questions to SMEs on Slack, and writes an approved draft Doc without submitting a portal response.',
    )
    expect(agent.description).toBe(
      'RFP response drafter via Google Drive Connect and sandbox files that cites every claim, Slack-routes SME gaps, and write-backs approved Drive or mailbox drafts without portal submit.',
    )
    expect(block.plainText).not.toContain(lede)
    expect(block.plainText.toLowerCase()).not.toContain(
      'pulls rfps from drive or the sandbox',
    )
    expect(block.plainText).toContain(
      `RFP Response Drafter is an Eve agent that ${job}.`,
    )
    expect(block.plainText).toContain(
      'npx shadcn@latest add @evex/rfp-response-drafter',
    )
    expect(block.plainText).not.toContain('eve add')
  })

  it('uses a distinct What-is clause for competitor-intel-monitor', () => {
    const agent = listStaticAgents().find(
      (item) => item.slug === 'competitor-intel-monitor',
    )
    expect(agent).toBeDefined()
    if (!agent) {
      return
    }

    const lede = getAgentJobIntentLede('competitor-intel-monitor')
    const block = getAgentDefinitionBlock(agent)
    expect(lede).toBe(
      'Watches competitor pages on a schedule and sends a scored Slack or email digest when something changes.',
    )
    expect(agent.description).toBe(
      'Scheduled competitor URL monitor that diffs pages and delivers scored Slack or email digests.',
    )
    expect(block.plainText).not.toContain(lede)
    expect(block.plainText.toLowerCase()).not.toContain(
      'watches competitor pages on a schedule',
    )
    expect(block.plainText).toContain(
      'Competitor Intel Monitor is an Eve agent that fetches your URL list, diffs each page against a store, and delivers only changes that clear your alert thresholds.',
    )
    expect(block.plainText).toContain(
      'npx shadcn@latest add @evex/competitor-intel-monitor',
    )
  })

  it('uses a distinct FS-framed clause for meeting-action-extractor', () => {
    const agent = listStaticAgents().find(
      (item) => item.slug === 'meeting-action-extractor',
    )
    expect(agent).toBeDefined()
    if (!agent) {
      return
    }

    const lede = getAgentJobIntentLede('meeting-action-extractor')
    const block = getAgentDefinitionBlock(agent)
    expect(lede).toBe(
      'Extracts owners and deadlines from meeting transcripts, then drafts Linear follow-ups you approve.',
    )
    expect(block.plainText).not.toContain(lede)
    expect(block.plainText.toLowerCase()).not.toContain(
      'extracts owners and deadlines from meeting transcripts',
    )
    expect(block.plainText).toContain(
      'Meeting Action Extractor is an Eve agent that reads a transcript on disk and drafts Linear issues you approve.',
    )
    expect(block.plainText).toContain(
      'npx shadcn@latest add @evex/meeting-action-extractor',
    )
  })

  for (const agent of listStaticAgents()) {
    it(`stays within the word budget for ${agent.slug}`, () => {
      const block = getAgentDefinitionBlock(agent)
      const command = buildInstallCommand(agent.slug)

      expect(block.heading).toBe(`What is ${agent.name}?`)
      expect(block.installCommand).toBe(command)
      expect(block.plainText).toContain(command)
      expect(block.plainText).not.toContain('eve add')
      expect(block.plainText).not.toMatch(RAW_MARKDOWN_OR_CODE)
      // Prefer 45-60; allow 40-60 when the under-45 append path still lands short.
      expect(block.wordCount).toBeGreaterThanOrEqual(40)
      expect(block.wordCount).toBeLessThanOrEqual(60)
      expect(block.plainText.endsWith('.')).toBe(true)
      expect(block.plainText).not.toMatch(ENDS_WITH_OR_EXPLICIT)
    })
  }
})

describe('structured data descriptions', () => {
  it('uses cleaned meta descriptions on SoftwareApplication and ItemList', () => {
    const agent = makeAgent({
      description: 'Ship reviews with `inline` comments and **suggestions**.',
      name: 'Code Reviewer',
      slug: 'code-reviewer',
    })
    const software = createAgentSoftwareSchema(agent, 0)
    const list = createAgentListSchema([agent])
    const listItem = (list.itemListElement as Record<string, unknown>[])[0]

    expect(software.description).toBe(getAgentMetaDescription(agent))
    expect(listItem?.description).toBe(getAgentMetaDescription(agent))
    expect(String(software.description)).not.toMatch(RAW_MARKDOWN_OR_CODE)
    expect(String(listItem?.description)).toContain(
      buildInstallCommand('code-reviewer'),
    )
  })
})

// Agent OG cards should show the shadcn install command (not a bare /r URL).
describe('agent OG install command', () => {
  it('matches buildInstallCommand for registry slugs', () => {
    for (const agent of listStaticAgents()) {
      const command = buildInstallCommand(agent.slug)
      expect(command).toBe(`npx shadcn@latest add @evex/${agent.slug}`)
      expect(command).not.toBe(`www.evex.sh/r/${agent.slug}`)
    }
  })
})

describe('registry agent meta descriptions fit the SERP budget', () => {
  const registryAgents = listStaticAgents()

  it('has agents to check', () => {
    expect(registryAgents.length).toBeGreaterThan(0)
  })

  for (const agent of registryAgents) {
    it(`stays within the description budget for ${agent.slug}`, () => {
      const description = getAgentMetaDescription(agent)
      expect(description.length).toBeLessThanOrEqual(
        METADATA_DESCRIPTION_MAX_LENGTH,
      )
      expect(description).not.toMatch(RAW_MARKDOWN_ANY)
    })
  }
})

// The root layout renders `<title>{pageTitle} · evex</title>`, so the budget
// that matters is the rendered one, and the page title must not carry a second
// copy of the brand.
describe('registry agent titles fit the rendered title tag', () => {
  const registryAgents = listStaticAgents()

  it('has agents to check', () => {
    expect(registryAgents.length).toBeGreaterThan(0)
  })

  for (const agent of registryAgents) {
    it(`renders within the title budget for ${agent.slug}`, () => {
      const title = getAgentMetadataTitle(agent)
      const rendered = `${title}${METADATA_TITLE_SUFFIX}`
      const override = JOB_INTENT_METADATA_TITLES[agent.slug]

      expect(title).not.toContain('| evex')
      expect(title).not.toContain(METADATA_TITLE_SUFFIX)
      if (override) {
        expect(title).toBe(override)
        expect(rendered).toBe(`${override}${METADATA_TITLE_SUFFIX}`)
        // Locked PMM copy may intentionally exceed the fitted budget
        // (knowledge-base-gardener). Budget-fitted overrides stay within 60.
        if (override.length <= METADATA_TITLE_BUDGET) {
          expect(rendered.length).toBeLessThanOrEqual(METADATA_TITLE_MAX_LENGTH)
        }
      } else {
        expect(title.startsWith(agent.name)).toBe(true)
        expect(rendered.length).toBeLessThanOrEqual(METADATA_TITLE_MAX_LENGTH)
      }
    })
  }
})

describe('compareRelatedAgents', () => {
  const current = makeAgent({ id: 'current', category: 'coding' })

  it('ranks same-category agents first, then by installs', () => {
    const sameCategory = makeAgent({ id: 'same', category: 'coding' })
    const popularOther = makeAgent({ id: 'other', category: 'marketing' })
    const installs = new Map([
      ['same', 1],
      ['other', 100],
    ])

    const sorted = [popularOther, sameCategory].sort(
      compareRelatedAgents(current, installs),
    )
    expect(sorted[0]?.id).toBe('same')
  })

  it('breaks category ties by install count', () => {
    const lowInstalls = makeAgent({ id: 'low', category: 'coding' })
    const highInstalls = makeAgent({ id: 'high', category: 'coding' })
    const installs = new Map([
      ['low', 2],
      ['high', 50],
    ])

    const sorted = [lowInstalls, highInstalls].sort(
      compareRelatedAgents(current, installs),
    )
    expect(sorted[0]?.id).toBe('high')
  })

  it('falls back to name for a stable order', () => {
    const alpha = makeAgent({ id: 'a', name: 'Alpha', category: 'coding' })
    const beta = makeAgent({ id: 'b', name: 'Beta', category: 'coding' })

    const sorted = [beta, alpha].sort(compareRelatedAgents(current, new Map()))
    expect(sorted.map((agent) => agent.name)).toEqual(['Alpha', 'Beta'])
  })
})

describe('pluralize', () => {
  it('handles singular, plural, and irregular forms', () => {
    expect(pluralize(1, 'file')).toBe('1 file')
    expect(pluralize(3, 'file')).toBe('3 files')
    expect(pluralize(2, 'dependency', 'dependencies')).toBe('2 dependencies')
  })
})
