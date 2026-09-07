import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { generateMetadata } from '@/app/(main)/docs/page'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import {
  getDocsIndexPage,
  getDocsPageHeading,
  getDocsPageIntro,
  listDocsSubPages,
} from '@/lib/docs-content'
import { buildDocsPageMarkdown } from '@/lib/markdown-content'
import { siteConfig } from '@/lib/metadata'
import { createDocsArticleSchema } from '@/lib/structured-data'

const DOCUMENT_TITLE = 'Open-source AI agent registry: install as source'
const DOCUMENT_TITLE_WITH_BRAND = `${DOCUMENT_TITLE} · evex`
const VISIBLE_H1 = 'Open-source AI agent registry: install as source'
const META_DESCRIPTION =
  'evex is an open-source AI agent registry. Browse Eve agents, inspect every file, then install as source with npx shadcn@latest add @evex/<slug>.'
const LEDE =
  'Browse community AI agents built for Eve, inspect every file before you trust them, and install as source with one command. You own the files afterward. There is no hosted runtime.'
const DEFINITION =
  'An AI agent registry is a catalog of reusable agents you can audit and install into your project. evex is the open-source registry for Eve agents: each item is code-owned, reviewed by pull request, and installed with npx shadcn@latest add @evex/<slug> through the official shadcn community registry.'
const EM_DASH = '—'
const SLUG_PLACEHOLDER = '@evex/<slug>'
const INSTALL_COMMAND = `npx shadcn@latest add ${SLUG_PLACEHOLDER}`

const LOCKED_HEADINGS = [
  'Registry vs framework',
  'Not a cloud governance registry',
  'How evex compares to agentcn and AgentsKit',
  'Where to go next',
] as const

function renderInlineMarkdown(markdown: string): string {
  return renderToStaticMarkup(
    createElement(LearnInlineMarkdown, null, markdown),
  )
}

describe('docs index: PMM Counsel A lock 2026-09-07', () => {
  const page = getDocsIndexPage()

  it('locks title, H1, meta, and both intro paragraphs', () => {
    expect(page.slug).toBe('introduction')
    expect(page.title).toBe(DOCUMENT_TITLE)
    expect(page.heading).toBe(VISIBLE_H1)
    expect(getDocsPageHeading(page)).toBe(VISIBLE_H1)
    expect(page.description).toBe(META_DESCRIPTION)
    expect(page.summary).toBe(LEDE)
    expect(page.definition).toBe(DEFINITION)
    expect(getDocsPageIntro(page)).toEqual([LEDE, DEFINITION])
    expect(page.dateModified).toBe('2026-09-07')
    expect(page.datePublished).toBe('2026-07-04')
    expect(page.shortTitle).toBe('Introduction')
  })

  it('emits document title without a brand suffix so the layout template applies once', () => {
    const metadata = generateMetadata()

    expect(metadata.title).toBe(DOCUMENT_TITLE)
    expect(String(metadata.title).endsWith(` · ${siteConfig.name}`)).toBe(false)
    expect(`${metadata.title} · ${siteConfig.name}`).toBe(
      DOCUMENT_TITLE_WITH_BRAND,
    )
    expect(metadata.description).toBe(META_DESCRIPTION)
    expect(metadata.openGraph?.title).toBe(DOCUMENT_TITLE_WITH_BRAND)
    expect(metadata.twitter?.title).toBe(DOCUMENT_TITLE_WITH_BRAND)
    expect(metadata.openGraph?.description).toBe(META_DESCRIPTION)
    expect(metadata.twitter?.description).toBe(META_DESCRIPTION)
    expect(metadata.alternates?.canonical).toBe('/docs')
    expect('robots' in metadata).toBe(false)
  })

  it('renders H1 from heading and intro from summary plus definition, not description', () => {
    const pageSource = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/docs/page.tsx'),
      'utf8',
    )

    expect(pageSource).toContain('title: page.title')
    expect(pageSource).toContain('socialTitle:')
    expect(pageSource).toContain('{getDocsPageHeading(page)}')
    expect(pageSource).toContain('{getDocsPageIntro(page)')
    expect(pageSource).not.toContain('{page.title}')
    expect(pageSource).not.toContain('{page.description}')
  })

  it('locks the three new H2s and Where to go next', () => {
    expect(page.sections.map((section) => section.heading)).toEqual([
      ...LOCKED_HEADINGS,
    ])
    expect(page.sections.map((section) => section.heading)).not.toContain(
      'What is an Eve agent registry?',
    )
    expect(page.sections.map((section) => section.heading)).not.toContain(
      'How evex relates to eve',
    )
    expect(page.sections.map((section) => section.heading)).not.toContain(
      'What installing gets you',
    )
  })

  it('keeps the locked section bodies, install command, and comparison link', () => {
    expect(page.sections[0]?.body).toEqual([
      'Eve is the TypeScript agent framework you author under agent/ (Vercel-first). It defines how an agent is structured and run.',
      'evex is the catalog on top of that convention. It does not run agents. It packages community Eve agents so you can browse them, preview files and dependencies, install them as source, and keep editing in your own repo.',
    ])
    expect(page.sections[1]?.body).toEqual([
      'AWS and GCP ship agent registries aimed at governed deployment inside their clouds: policies, environments, and operational control for agents you already run on their platforms.',
      'evex is a different job. It is an open catalog of installable Eve agent source. You review the files on the agent page, run the install command into your Eve project, and the agent lives in your repository with no runtime dependency on the registry.',
    ])
    expect(page.sections[2]?.body).toEqual([
      'agentcn uses the same shadcn install mechanic for Eve agents. evex competes on the full registry loop: catalog UX, file preview, author profiles, favorites, leaderboard, and first-party publishing docs with PR-owned agents.',
      "AgentsKit Registry is a shadcn-style install-as-source catalog for the AgentsKit stack (provider-agnostic agents). evex is Eve-native: agents follow Eve's agent/ layout and install with `npx shadcn@latest add @evex/<slug>`.",
      'For a deeper Eve-vs-agentcn comparison, see [/learn/evex-vs-agentcn](/learn/evex-vs-agentcn).',
    ])

    const pageText = [
      page.title,
      page.heading ?? '',
      page.description,
      page.summary,
      page.definition ?? '',
      ...page.sections.flatMap((section) => section.body),
    ].join('\n')

    expect(pageText).toContain(INSTALL_COMMAND)
    expect(pageText).toContain(SLUG_PLACEHOLDER)
    expect(pageText).not.toContain('@evex/{slug}')
    expect(pageText).not.toContain(EM_DASH)
    expect(pageText).not.toContain('eve add')
    expect(pageText.toLowerCase()).not.toContain('evex is not a framework')
  })

  it('locks the high CTA hrefs on Where to go next', () => {
    const nextSection = page.sections.find(
      (section) => section.heading === 'Where to go next',
    )
    expect(nextSection?.body[0]).toContain('[Eve agents](/agents)')
    expect(nextSection?.body[1]).toBe(
      'Install walkthrough: [Install an Eve agent](/learn/install-eve-agent).',
    )
    expect(nextSection?.body[2]).toBe(
      'Browse and install from editors (Cursor, VS Code, Claude Code): [MCP](/docs/mcp).',
    )

    const html = (nextSection?.body ?? [])
      .map((paragraph) => renderInlineMarkdown(paragraph))
      .join('')

    expect(html).toContain('href="/agents"')
    expect(html).toContain('href="/learn/install-eve-agent"')
    expect(html).toContain('href="/docs/mcp"')
    expect(html).toContain('href="/learn/evex-vs-agentcn"')
    expect(html).not.toContain('[Eve agents](/agents)')
    expect(html).not.toContain(
      '[Install an Eve agent](/learn/install-eve-agent)',
    )
    expect(html).not.toContain('[MCP](/docs/mcp)')
  })

  it('keeps Guides cards for install, MCP, and publishing', () => {
    const slugs = listDocsSubPages().map((subPage) => subPage.slug)

    expect(slugs).toEqual(['installation', 'registry', 'mcp', 'publishing'])
  })

  it('mirrors the visible H1 in markdown and TechArticle JSON-LD', () => {
    const markdown = buildDocsPageMarkdown(page)
    expect(markdown.startsWith(`# ${VISIBLE_H1}\n`)).toBe(true)
    expect(markdown).toContain(META_DESCRIPTION)
    expect(markdown).toContain(LEDE)
    expect(markdown).toContain(DEFINITION)
    expect(markdown).toContain(SLUG_PLACEHOLDER)
    expect(markdown).not.toContain('@evex/{slug}')

    const schema = createDocsArticleSchema(page, 'https://www.evex.sh/docs')
    expect(schema['@type']).toBe('TechArticle')
    expect(schema.headline).toBe(VISIBLE_H1)
    expect(schema.description).toBe(META_DESCRIPTION)
    expect(schema.dateModified).toBe('2026-09-07')
    expect(schema.url).toBe('https://www.evex.sh/docs')
  })
})
