import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  FEATURED_LEARN_SLUGS,
  LEARN_INDEX_H1,
  LEARN_INDEX_INTRO,
  LEARN_INDEX_REGISTRY_LINK,
  LEARN_INDEX_TITLE,
  metadata as learnIndexMetadata,
} from '@/app/(main)/learn/page'
import { getLearnPage } from '@/lib/learn-content'
import { createLearnListSchema } from '@/lib/structured-data'

const FEATURED_CARD_DESCRIPTIONS = {
  'eve-agent-registry':
    'Browse the catalog, inspect every file, and install with one shadcn command.',
  'install-eve-agent':
    'Inspect the files on /agents, then install with one shadcn command.',
} as const
const AGENTS_HREF_WITH_VISIBLE_TEXT =
  /href="\/agents"[\s\S]*?>[\s\S]*?\/agents[\s\S]*?</

describe('/learn Eve agent guides index', () => {
  it('locks metadata title without the layout brand suffix', () => {
    expect(learnIndexMetadata.title).toBe(LEARN_INDEX_TITLE)
    expect(learnIndexMetadata.title).toBe(
      'Eve agent guides for the Eve framework',
    )
    expect(learnIndexMetadata.alternates?.canonical).toBe('/learn')
    // Layout template is `%s · evex` — helper must not already include the brand.
    expect(String(learnIndexMetadata.title).endsWith(' · evex')).toBe(false)
    expect(`${learnIndexMetadata.title} · evex`).toBe(
      'Eve agent guides for the Eve framework · evex',
    )
  })

  it('locks the H1, exact intro, and crawlable /agents link', () => {
    expect(LEARN_INDEX_H1).toBe('Eve agent guides')
    expect(LEARN_INDEX_INTRO).toBe(
      'These guides are for Vercel Eve agents you install from evex, the open registry on Cursor and the shadcn CLI. Not the game and not the TV show. Start from the catalog at /agents.',
    )
    expect(LEARN_INDEX_REGISTRY_LINK).toBe(
      'What an Eve agent registry is: [Eve agent registry](/learn/eve-agent-registry).',
    )

    const pageSource = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/learn/page.tsx'),
      'utf8',
    )

    expect(pageSource).toContain('LEARN_INDEX_H1')
    expect(pageSource).toContain('LEARN_INDEX_INTRO_BEFORE_AGENTS')
    expect(pageSource).toContain('LEARN_INDEX_REGISTRY_LINK')
    expect(pageSource).toContain('href="/agents"')
    expect(pageSource).toContain('/learn/eve-agent-registry')
    expect(pageSource).toMatch(AGENTS_HREF_WITH_VISIBLE_TEXT)
    expect(pageSource).not.toContain('LEARN_CLUSTERS')
    expect(pageSource).not.toContain('All guides')
    expect(pageSource).not.toContain(
      'AI agent engineering guides for people building real agents',
    )
    expect(pageSource).not.toContain('listLearnPages')
  })

  it('features the Eve agent registry and Install an Eve agent cards plus the two comparison cards', () => {
    const pageSource = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/learn/page.tsx'),
      'utf8',
    )

    expect(pageSource).toContain("'eve-agent-registry'")
    expect(pageSource).toContain("'install-eve-agent'")
    expect(pageSource).toContain("'evex-vs-agentcn'")
    expect(pageSource).toContain("'langgraph-vs-crewai'")
    expect(pageSource).toContain(
      FEATURED_CARD_DESCRIPTIONS['eve-agent-registry'],
    )
    expect(pageSource).toContain(
      FEATURED_CARD_DESCRIPTIONS['install-eve-agent'],
    )
    expect(pageSource).not.toContain('publish-eve-agent')
    expect(pageSource).not.toContain('mcp-server-for-ai-agents')
    expect(pageSource).not.toContain('agentic-workflows')
    expect(pageSource).not.toContain('ai-agent-frameworks')

    const registryPage = getLearnPage('eve-agent-registry')
    expect(registryPage).not.toBeNull()
    expect(registryPage?.shortTitle).toBe('Eve agent registry')

    const installPage = getLearnPage('install-eve-agent')
    expect(installPage).not.toBeNull()
    expect(installPage?.shortTitle).toBe('Install an Eve agent')

    const featuredPages = FEATURED_LEARN_SLUGS.map((slug) => {
      const page = getLearnPage(slug)
      expect(page).not.toBeNull()
      if (!page) {
        throw new Error(`Missing featured learn page: ${slug}`)
      }
      return page
    })

    expect(FEATURED_LEARN_SLUGS).toEqual([
      'eve-agent-registry',
      'install-eve-agent',
      'evex-vs-agentcn',
      'langgraph-vs-crewai',
    ])

    const schema = createLearnListSchema(featuredPages)
    expect(schema['@type']).toBe('ItemList')
    expect(schema.name).toBe('Eve agent guides')
    expect(schema.numberOfItems).toBe(4)
    expect(schema.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        url: 'https://www.evex.sh/learn/eve-agent-registry',
        name: 'Eve agent registry',
      },
      {
        '@type': 'ListItem',
        position: 2,
        url: 'https://www.evex.sh/learn/install-eve-agent',
        name: 'Install an Eve agent',
      },
      {
        '@type': 'ListItem',
        position: 3,
        url: 'https://www.evex.sh/learn/evex-vs-agentcn',
        name: 'Eve agent registries: evex vs agentcn',
      },
      {
        '@type': 'ListItem',
        position: 4,
        url: 'https://www.evex.sh/learn/langgraph-vs-crewai',
        name: 'LangGraph vs CrewAI: graph control or role-based crews?',
      },
    ])
  })
})
