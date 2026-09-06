import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  AGENTS_INDEX_DESCRIPTION,
  AGENTS_INDEX_H1,
  AGENTS_INDEX_INTRO,
  AGENTS_INDEX_LEARN_LINKS,
  AGENTS_INDEX_TITLE,
  AgentsIndexGrid,
  generateMetadata as generateAgentsMetadata,
} from '@/app/(main)/agents/page'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import { stripInlineMarkdown } from '@/lib/agent-detail'
import { listStaticAgents } from '@/lib/registry'
import { createAgentListSchema } from '@/lib/structured-data'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: () => undefined,
    refresh: () => undefined,
  }),
}))

const PAGE_SOURCE = readFileSync(
  path.join(import.meta.dirname, '../app/(main)/agents/page.tsx'),
  'utf8',
)
const CARD_SOURCE = readFileSync(
  path.join(import.meta.dirname, '../components/agent-card.tsx'),
  'utf8',
)
const H2_TAG = /<h2[\s>]/i
const EM_DASH = '\u2014'
const CANONICAL_INSTALL = 'npx shadcn@latest add @evex/<slug>'
const MARKDOWN_MARKER_SPLIT = /[`*[]/
const WORD_SPLIT = /\s+/

function renderInlineMarkdown(markdown: string): string {
  return renderToStaticMarkup(
    createElement(LearnInlineMarkdown, null, markdown),
  )
}

describe('/agents index copy lock', () => {
  it('locks title, H1, description, and intro strings', () => {
    expect(AGENTS_INDEX_TITLE).toBe(
      'Eve agents for the Eve agent framework | browse and install',
    )
    expect(AGENTS_INDEX_H1).toBe('Eve agents for the Eve agent framework')
    expect(AGENTS_INDEX_DESCRIPTION).toBe(
      'Browse and install Eve agents for the Eve agent framework. Preview every file, then run npx shadcn@latest add @evex/<slug>. MCP-ready editors: see /docs/mcp.',
    )
    expect(AGENTS_INDEX_INTRO).toEqual([
      'This catalog lists Eve agents you can inspect and install into an Eve app.',
      'Every agent installs with one command: `npx shadcn@latest add @evex/<slug>`. Replace the slug with the agent you pick.',
      'Open any agent page to preview the files before you install.',
      'Installing or running agents from MCP-ready editors is covered in [/docs/mcp](/docs/mcp).',
    ])
    expect(AGENTS_INDEX_LEARN_LINKS).toBe(
      'How to install from a registry: [Install an Eve agent](/learn/install-eve-agent). How evex differs from agentcn: [evex vs agentcn](/learn/evex-vs-agentcn).',
    )
  })

  it('keeps the layout brand suffix off the title constant', () => {
    expect(AGENTS_INDEX_TITLE.endsWith(' · evex')).toBe(false)
    expect(AGENTS_INDEX_TITLE).not.toContain('evex')
    expect(`${AGENTS_INDEX_TITLE} · evex`).toBe(
      'Eve agents for the Eve agent framework | browse and install · evex',
    )
  })

  it('uses the canonical install command and avoids banned phrases', () => {
    const lockedCopy = [
      AGENTS_INDEX_TITLE,
      AGENTS_INDEX_H1,
      AGENTS_INDEX_DESCRIPTION,
      ...AGENTS_INDEX_INTRO,
      AGENTS_INDEX_LEARN_LINKS,
    ].join('\n')

    expect(lockedCopy).toContain(CANONICAL_INSTALL)
    expect(lockedCopy).not.toContain('@evex/{slug}')
    expect(lockedCopy).not.toContain('open catalog')
    expect(lockedCopy).not.toContain('not the Eve runtime')
    expect(lockedCopy).not.toContain(EM_DASH)
    expect(PAGE_SOURCE).not.toContain('open catalog')
    expect(PAGE_SOURCE).not.toContain('not the Eve runtime')
  })

  it('renders the locked H1 and four intro paragraphs on the page', () => {
    expect(PAGE_SOURCE).toContain('{AGENTS_INDEX_H1}')
    expect(PAGE_SOURCE).toContain('AGENTS_INDEX_INTRO.map')
    expect(PAGE_SOURCE).toContain('LearnInlineMarkdown')
    expect(PAGE_SOURCE).toContain('{AGENTS_INDEX_LEARN_LINKS}')
    expect(PAGE_SOURCE).not.toMatch(H2_TAG)
    expect(PAGE_SOURCE).not.toContain('AGENTS_INDEX_LEDE')
    expect(PAGE_SOURCE).not.toContain(
      'This is the open registry for Eve agents',
    )
  })

  it('turns intro install code and /docs/mcp into crawlable HTML', () => {
    const installHtml = renderInlineMarkdown(AGENTS_INDEX_INTRO[1])
    const mcpHtml = renderInlineMarkdown(AGENTS_INDEX_INTRO[3])
    const learnHtml = renderInlineMarkdown(AGENTS_INDEX_LEARN_LINKS)

    expect(installHtml).toContain('<code')
    expect(installHtml).toContain('@evex/&lt;slug&gt;')
    expect(installHtml).not.toContain('@evex/{slug}')
    expect(mcpHtml).toContain('href="/docs/mcp">/docs/mcp</a>')
    expect(mcpHtml).not.toContain('[/docs/mcp](/docs/mcp)')
    expect(learnHtml).toContain(
      'href="/learn/install-eve-agent">Install an Eve agent</a>',
    )
    expect(learnHtml).toContain(
      'href="/learn/evex-vs-agentcn">evex vs agentcn</a>',
    )
  })
})

describe('/agents index metadata', () => {
  it('emits the locked title and description on the clean URL', async () => {
    const metadata = await generateAgentsMetadata({
      searchParams: Promise.resolve({}),
    })

    expect(metadata.title).toBe(AGENTS_INDEX_TITLE)
    expect(metadata.description).toBe(AGENTS_INDEX_DESCRIPTION)
    expect('robots' in metadata).toBe(false)
    expect(metadata.alternates?.canonical).toBe('/agents')
  })

  it('noindexes filtered /agents search and category URLs with follow', async () => {
    const withQuery = await generateAgentsMetadata({
      searchParams: Promise.resolve({ q: 'review' }),
    })
    const withCategory = await generateAgentsMetadata({
      searchParams: Promise.resolve({ category: 'devops' }),
    })

    expect(withQuery.robots).toEqual({
      follow: true,
      googleBot: {
        follow: true,
        index: false,
      },
      index: false,
    })
    expect(withCategory.robots).toEqual(withQuery.robots)
    expect(withQuery.title).toBe(AGENTS_INDEX_TITLE)
    expect(withQuery.description).toBe(AGENTS_INDEX_DESCRIPTION)
  })
})

describe('/agents first HTML catalog', () => {
  it('does not gate the static grid behind a skeleton-only Suspense fallback', () => {
    expect(PAGE_SOURCE).toContain(
      'fallback={<AgentsIndexGrid agents={agents} />}',
    )
    expect(PAGE_SOURCE).not.toContain('AgentGridSkeleton')
    expect(PAGE_SOURCE).not.toContain('AGENT_GRID_SKELETON_CARD_IDS')
    expect(CARD_SOURCE).toContain('href={`')
    expect(CARD_SOURCE).toContain('/agents/')
    expect(CARD_SOURCE).toContain('agent.slug')
  })

  it('prerenders /agents/{slug} hrefs and existing blurbs for the static list', () => {
    const agents = listStaticAgents()
    expect(agents.length).toBeGreaterThan(0)

    const html = renderToStaticMarkup(
      createElement(AgentsIndexGrid, { agents }),
    )

    for (const agent of agents) {
      const blurbLead =
        agent.description.split(MARKDOWN_MARKER_SPLIT)[0]?.trim() ?? ''
      const plainBlurb = stripInlineMarkdown(agent.description)
      const blurbWords = plainBlurb.split(WORD_SPLIT).slice(0, 8).join(' ')

      expect(html).toContain(`href="/agents/${agent.slug}"`)
      expect(blurbLead.length).toBeGreaterThan(0)
      expect(html).toContain(blurbLead)
      expect(blurbWords.length).toBeGreaterThan(0)
      expect(html).toContain(blurbWords)
    }

    expect(html).not.toContain('AgentGridSkeleton')
    expect(html).not.toContain('h-44 rounded-md border border-border')
  })
})

describe('/agents ItemList JSON-LD', () => {
  it('matches the visible static catalog', () => {
    const agents = listStaticAgents()
    const schema = createAgentListSchema(agents, {
      description: AGENTS_INDEX_DESCRIPTION,
      name: AGENTS_INDEX_H1,
    })
    const items = schema.itemListElement as Record<string, unknown>[]

    expect(schema['@type']).toBe('ItemList')
    expect(schema.name).toBe(AGENTS_INDEX_H1)
    expect(schema.description).toBe(AGENTS_INDEX_DESCRIPTION)
    expect(schema.numberOfItems).toBe(agents.length)
    expect(items).toHaveLength(agents.length)

    for (const [index, agent] of agents.entries()) {
      expect(items[index]).toMatchObject({
        '@type': 'ListItem',
        name: agent.name,
        position: index + 1,
        url: `https://www.evex.sh/agents/${agent.slug}`,
      })
    }
  })
})
