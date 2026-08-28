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
// template appends that once. The four first-party plays keep their existing
// copy; the ten live catalog plays use the PMM-fitted strings below.
const JOB_INTENT_METADATA_TITLES: Readonly<Record<string, string>> = {
  'brand-visual-asset-generator': 'Eve brand SVG agent',
  'branded-seo-page-builder': 'Eve branded SEO page agent',
  'code-reviewer': 'Eve PR review agent - install @evex/code-reviewer',
  'docs-knowledge-assistant':
    'Eve docs Q&A agent - install @evex/docs-knowledge-assistant',
  'eve-agent-builder': 'Eve agent builder - install @evex/eve-agent-builder',
  'github-ci-explainer':
    'Eve CI failure agent - install @evex/github-ci-explainer',
  'github-issue-maintainer':
    'Eve GitHub issue agent - install @evex/github-issue-maintainer',
  'linear-operations-agent':
    'Eve Linear ops agent - @evex/linear-operations-agent',
  'openui-assistant': 'Eve OpenUI agent - install @evex/openui-assistant',
  'postgres-data-analyst':
    'Eve Postgres SQL agent - @evex/postgres-data-analyst',
  'programmatic-seo-agent': 'Eve programmatic SEO agent',
  'supabase-data-analyst':
    'Eve Supabase SQL agent - @evex/supabase-data-analyst',
  'x-draft-assistant': 'Eve X draft agent - install @evex/x-draft-assistant',
  'x-hot-topic-digest': 'Eve X digest agent - install @evex/x-hot-topic-digest',
}

const JOB_INTENT_LEDES: Readonly<Record<string, string>> = {
  'brand-visual-asset-generator':
    'Generates brand-aligned SVG packs from a site.',
  'branded-seo-page-builder': 'Builds an on-brand SEO page from a domain.',
  'code-reviewer': 'PR review agent for Eve.',
  'docs-knowledge-assistant': 'Docs Q&A agent for Eve.',
  'eve-agent-builder': 'Scaffolds, checks, and deploys a new Eve agent.',
  'github-ci-explainer': 'Explains failed GitHub Actions checks from the log.',
  'github-issue-maintainer': 'GitHub issue agent for Eve.',
  'linear-operations-agent':
    'Triages Linear work and posts Slack cycle digests.',
  'openui-assistant': 'Streams OpenUI generative UI in an Eve chat.',
  'postgres-data-analyst':
    'Answers Slack questions with read-only Postgres SQL.',
  'programmatic-seo-agent': 'Finds keywords and opens a PR of SEO pages.',
  'supabase-data-analyst':
    'Answers Slack questions with read-only Supabase SQL.',
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
        // Locked PMM copy may intentionally exceed the fitted budget (the
        // four first-party plays). Budget-fitted overrides stay within 60.
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
