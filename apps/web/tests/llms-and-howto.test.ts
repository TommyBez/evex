import { describe, expect, it } from 'vitest'
import { GET as getLlmsTxt } from '@/app/llms.txt/route'
import { GET as getLlmsFullTxt } from '@/app/llms-full.txt/route'
import {
  getAgentMetaDescription,
  getAgentPlainDescription,
} from '@/lib/agent-detail'
import type { AgentWithAuthor } from '@/lib/agent-types'
import { getDocsPage } from '@/lib/docs-content'
import { listStaticAgents } from '@/lib/registry'
import { buildInstallCommand } from '@/lib/site-url'
import { createDocsInstallHowToSchema } from '@/lib/structured-data'

const RAW_MARKDOWN_OR_CODE = /`|\*\*|\[.*?\]\(.*?\)/
const RAW_BOLD = /\*\*/
const RAW_INLINE_CODE = /`[^`]+`/
const RAW_BACKTICK_OR_BOLD = /`|\*\*/
const EVE_ADD_COMMAND = /eve add/

function makeAgent(overrides: Partial<AgentWithAuthor> = {}): AgentWithAuthor {
  return {
    author: { githubUsername: 'octocat', name: 'octocat' },
    authorAvatarUrl: null,
    authorName: 'octocat',
    authorUsername: 'octocat',
    category: 'coding',
    createdAt: new Date('2026-01-01'),
    dependencies: '',
    description:
      'Review PRs with `inline` comments, **suggestion** blocks, and [rate limits](https://example.com).',
    docs: null,
    id: 'agent-a',
    installCount: 0,
    name: 'Code Reviewer',
    slug: 'code-reviewer',
    title: 'Code Reviewer',
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  }
}

describe('getAgentPlainDescription', () => {
  it('strips Markdown without appending an install CTA', () => {
    const agent = makeAgent()
    const plain = getAgentPlainDescription(agent)

    expect(plain).not.toMatch(RAW_MARKDOWN_OR_CODE)
    expect(plain).toContain('inline')
    expect(plain).toContain('suggestion')
    expect(plain).toContain('rate limits')
    expect(plain).not.toContain('Install with')
    expect(plain).not.toContain(buildInstallCommand(agent.slug))
  })

  it('preserves double-underscore tool names and snake_case identifiers', () => {
    const agent = makeAgent({
      description:
        'Exposes `supabase__list_tables` and **supabase__execute_sql** plus snake_case_ids for read-only queries.',
      slug: 'supabase-data-analyst',
    })
    const plain = getAgentPlainDescription(agent)

    expect(plain).toContain('supabase__list_tables')
    expect(plain).toContain('supabase__execute_sql')
    expect(plain).toContain('snake_case_ids')
    expect(plain).not.toContain('supabaselisttables')
    expect(plain).not.toContain('supabaseexecutesql')
    expect(plain).not.toMatch(RAW_MARKDOWN_OR_CODE)
  })
})

describe('llms.txt agent blurbs', () => {
  it('uses cleaned prose and a dedicated Install line per agent', async () => {
    const body = await getLlmsTxt().text()
    const agents = listStaticAgents()

    expect(agents.length).toBeGreaterThan(0)
    expect(body).toContain('supabase__list_tables')
    expect(body).toContain('supabase__execute_sql')
    expect(body).not.toContain('supabaselisttables')
    expect(body).not.toContain('supabaseexecutesql')

    for (const agent of agents) {
      const install = buildInstallCommand(agent.slug)
      expect(install).toBe(`npx shadcn@latest add @evex/${agent.slug}`)
      expect(body).toContain(`Install: \`${install}\``)
      expect(body).not.toMatch(EVE_ADD_COMMAND)

      const plain = getAgentPlainDescription(agent)
      if (plain.length > 0) {
        expect(body).toContain(plain)
      }
    }

    // Agent blurbs in the index should not dump raw Markdown markers from
    // registry descriptions (backticks / bold). The dedicated Install line
    // still uses backticks around the command, which is intentional.
    const agentsSection = body.split('## Agents\n\n')[1]?.split('\n## ')[0]
    expect(agentsSection).toBeDefined()
    const blurbLines = (agentsSection ?? '')
      .split('\n')
      .filter((line) => line.startsWith('- [') && !line.includes('Install:'))
    for (const line of blurbLines) {
      expect(line).not.toMatch(RAW_BOLD)
      expect(line).not.toMatch(RAW_INLINE_CODE)
    }
  })
})

describe('llms-full.txt agent sections', () => {
  it('cleans descriptions and keeps the Install fact line', async () => {
    const body = await getLlmsFullTxt().text()
    const agents = listStaticAgents()

    for (const agent of agents) {
      const install = buildInstallCommand(agent.slug)
      expect(body).toContain(`- Install: \`${install}\``)

      const plain = getAgentPlainDescription(agent)
      if (plain.length > 0) {
        expect(body).toContain(plain)
      }

      // Raw Markdown markers from the registry description should not appear
      // as the section lead-in once cleaned.
      if (agent.description.includes('`') || agent.description.includes('**')) {
        expect(plain).not.toMatch(RAW_BACKTICK_OR_BOLD)
      }
    }

    expect(body).not.toMatch(EVE_ADD_COMMAND)
  })
})

function isHowToStep(value: unknown): value is { name: string; text: string } {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const record = value as Record<string, unknown>
  return typeof record.name === 'string' && typeof record.text === 'string'
}

describe('createDocsInstallHowToSchema', () => {
  it('emits HowTo steps matching the installation docs page', () => {
    const page = getDocsPage('installation')
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const schema = createDocsInstallHowToSchema(page)
    expect(Array.isArray(schema.step)).toBe(true)
    const steps = Array.isArray(schema.step)
      ? schema.step.filter(isHowToStep)
      : []
    expect(steps).toHaveLength(
      Array.isArray(schema.step) ? schema.step.length : 0,
    )

    expect(schema['@type']).toBe('HowTo')
    expect(schema.name).toBe(page.title)
    expect(schema.description).toBe(page.summary)
    expect(schema.url).toBe('https://www.evex.sh/docs/installation')
    expect(schema.mainEntityOfPage).toBe(
      'https://www.evex.sh/docs/installation',
    )

    expect(steps.map((step) => step.name)).toEqual(
      page.sections.map((section) => section.heading),
    )
    expect(steps).toHaveLength(page.sections.length)

    const stepText = steps.map((step) => step.text).join('\n')
    expect(stepText).toContain('npx shadcn@latest add @evex/{slug}')
    expect(stepText).toContain('npx shadcn@latest add @evex/code-reviewer')
    expect(stepText).not.toMatch(EVE_ADD_COMMAND)

    for (const section of page.sections) {
      const step = steps.find((entry) => entry.name === section.heading)
      expect(step).toBeDefined()
      expect(step?.text).toContain(section.body[0] ?? '')
    }

    expect(schema.tool).toEqual([
      { '@type': 'HowToTool', name: 'shadcn CLI' },
      { '@type': 'HowToTool', name: 'eve CLI' },
    ])
    expect(schema.supply).toEqual([
      { '@type': 'HowToSupply', name: 'Node.js 24 or newer' },
    ])
  })
})

describe('ItemList meta description sentence boundary', () => {
  it('truncates before the install CTA on a sentence boundary when possible', () => {
    const agent = makeAgent({
      description:
        'Review GitHub pull requests from a native GitHub App channel. Mention `@code-reviewer` on a pull request to publish a GitHub review with inline comments, optional suggestion blocks, and Upstash-backed rate limiting for public repositories.',
      slug: 'code-reviewer',
    })
    const description = getAgentMetaDescription(agent)
    const install = buildInstallCommand('code-reviewer')
    const cta = ` Install with ${install}.`

    expect(description.endsWith(cta)).toBe(true)
    const lead = description.slice(0, description.length - cta.length)
    expect(lead).toBe(
      'Review GitHub pull requests from a native GitHub App channel.',
    )
  })
})
