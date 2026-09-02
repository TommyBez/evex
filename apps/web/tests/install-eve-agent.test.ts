import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import { getDocsPage } from '@/lib/docs-content'
import { getLearnPage, listLearnPages } from '@/lib/learn-content'
import { buildLearnPageMarkdown } from '@/lib/markdown-content'

const INSTALL_INLINE = '`npx shadcn@latest add @evex/<slug>`'
const INSTALL_HREF = '/learn/install-eve-agent'
const MARKETPLACE = /marketplace/i
const VERCEL_DEPLOY = /vercel deploy/i
const LEARN_SUMMARY_MARKDOWN_USAGE =
  /<LearnInlineMarkdown>\{page\.summary\}<\/LearnInlineMarkdown>/
const LEARN_SUMMARY_RAW_TEXT_USAGE =
  /<p className="mt-3 text-pretty font-medium text-foreground leading-relaxed">\s*\{page\.summary\}\s*<\/p>/

const renderInlineMarkdown = (markdown: string): string =>
  renderToStaticMarkup(createElement(LearnInlineMarkdown, null, markdown))

describe('learn page: install-eve-agent', () => {
  const page = getLearnPage('install-eve-agent')

  it('exists with locked title, H1 fields, dates, and keyword', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.slug).toBe('install-eve-agent')
    expect(page.title).toBe('Install an Eve agent')
    expect(page.shortTitle).toBe('Install an Eve agent')
    expect(page.cluster).toBe('distribution')
    expect(page.datePublished).toBe('2026-09-02')
    expect(page.dateModified).toBe('2026-09-02')
    expect(page.primaryKeyword).toBe('install eve agent')
    expect(page.title.endsWith(' · evex')).toBe(false)
  })

  it('keeps sibling Learn pages untouched', () => {
    const registry = getLearnPage('eve-agent-registry')
    const older = getLearnPage('agent-registry')

    expect(registry).not.toBeNull()
    expect(older).not.toBeNull()
    expect(registry?.title).toBe('Eve agent registry')
    expect(older?.title).toBe(
      'Agent registry: discovery without trust is just a list',
    )
    expect(
      listLearnPages().some((entry) => entry.slug === 'install-eve-agent'),
    ).toBe(true)
  })

  it('locks the lede with install command as markdown inline code', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.summary).toBe(
      'Install a community Eve agent with `npx shadcn@latest add @evex/<slug>`. Inspect the files on /agents first.',
    )
    expect(page.summary).toContain(INSTALL_INLINE)
    expect(page.summary).not.toContain('@evex/{slug}')
    expect(page.summary).not.toContain('eve add')
    expect(page.summary).not.toMatch(MARKETPLACE)
    expect(page.summary).not.toMatch(VERCEL_DEPLOY)

    const ledeHtml = renderInlineMarkdown(page.summary)
    expect(ledeHtml).toContain('<code')
    expect(ledeHtml).toContain('@evex/&lt;slug&gt;')
    expect(ledeHtml).not.toContain('@evex/<!-- -->')
    expect(ledeHtml).not.toContain(INSTALL_INLINE)
  })

  it('renders the Learn detail summary through LearnInlineMarkdown', () => {
    const source = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/learn/[slug]/page.tsx'),
      'utf8',
    )

    expect(source).toMatch(LEARN_SUMMARY_MARKDOWN_USAGE)
    expect(source).not.toMatch(LEARN_SUMMARY_RAW_TEXT_USAGE)

    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const ledeHtml = renderInlineMarkdown(page.summary)
    expect(ledeHtml).toContain('<code')
    expect(ledeHtml).toContain('npx shadcn@latest add @evex/&lt;slug&gt;')
    expect(ledeHtml).not.toContain('`npx shadcn@latest add @evex/<slug>`')
  })

  it('uses the three required H2s and the exact install command', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.sections.map((section) => section.heading)).toEqual([
      'How you install',
      'Inspect first',
      'Where to go next',
    ])

    const installSection = page.sections.find(
      (section) => section.heading === 'How you install',
    )
    expect(installSection?.body).toEqual([
      'Run this inside an Eve app:',
      INSTALL_INLINE,
      'Pick the slug from the catalog. The files land in your project. After that, evex is out of the loop.',
    ])

    const nextSection = page.sections.find(
      (section) => section.heading === 'Where to go next',
    )
    expect(nextSection?.body).toEqual([
      'The live catalog is [/agents](/agents). What a registry is: [Eve agent registry](/learn/eve-agent-registry). Command details: [Installation](/docs/installation).',
    ])

    const bodyText = page.sections.flatMap((section) => section.body).join('\n')
    expect(bodyText).toContain(INSTALL_INLINE)
    expect(bodyText).not.toContain('@evex/{slug}')
    expect(bodyText).not.toContain('eve add')
    expect(bodyText).not.toMatch(MARKETPLACE)
    expect(bodyText).not.toMatch(VERCEL_DEPLOY)

    const markdown = buildLearnPageMarkdown(page)
    expect(markdown).toContain(INSTALL_INLINE)
    expect(markdown).toContain('[/agents](/agents)')
    expect(markdown).toContain(
      '[Eve agent registry](/learn/eve-agent-registry)',
    )
    expect(markdown).toContain('[Installation](/docs/installation)')
  })

  it('keeps decisionRows, examples, and faqs short without a comparison table', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.comparisonRows).toBeUndefined()
    expect(page.decisionRows.length).toBeGreaterThan(0)
    expect(page.examples.length).toBeGreaterThan(0)
    expect(page.faqs.length).toBeGreaterThan(0)
    expect(page.description).not.toMatch(MARKETPLACE)
    expect(page.description).not.toMatch(VERCEL_DEPLOY)
  })

  it('does not add a fourth featured card on /learn', () => {
    const source = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/learn/page.tsx'),
      'utf8',
    )

    expect(source).not.toContain("'install-eve-agent'")
    expect(source).toContain("'eve-agent-registry'")
  })
})

describe('in-body links to /learn/install-eve-agent', () => {
  it('adds a crawlable install link on /docs Where to go next', () => {
    const docs = getDocsPage('introduction')
    expect(docs).not.toBeNull()
    if (!docs) {
      return
    }

    expect(docs.dateModified).toBe('2026-09-02')
    expect(docs.title).toBe(
      'evex documentation: the community registry for eve agents',
    )

    const nextSection = docs.sections.find(
      (section) => section.heading === 'Where to go next',
    )
    expect(nextSection?.body).toContain(
      'How to install: [Install an Eve agent](/learn/install-eve-agent).',
    )

    const html = (nextSection?.body ?? [])
      .map((paragraph) => renderInlineMarkdown(paragraph))
      .join('')

    expect(html).toContain(`href="${INSTALL_HREF}">Install an Eve agent</a>`)
    expect(html).not.toContain(`[Install an Eve agent](${INSTALL_HREF})`)
  })

  it('adds a crawlable install link on /docs/installation', () => {
    const docs = getDocsPage('installation')
    expect(docs).not.toBeNull()
    if (!docs) {
      return
    }

    expect(docs.dateModified).toBe('2026-09-02')

    const installSection = docs.sections.find(
      (section) => section.heading === 'Run the install command',
    )
    expect(installSection?.body).toContain(
      'How to install: [Install an Eve agent](/learn/install-eve-agent).',
    )

    const html = (installSection?.body ?? [])
      .map((paragraph) => renderInlineMarkdown(paragraph))
      .join('')

    expect(html).toContain(`href="${INSTALL_HREF}">Install an Eve agent</a>`)
    expect(html).not.toContain(`[Install an Eve agent](${INSTALL_HREF})`)
  })

  it('is listed by listLearnPages for sitemap and llms twins', () => {
    const slugs = listLearnPages().map((entry) => entry.slug)
    expect(slugs).toContain('install-eve-agent')
    expect(slugs).toContain('eve-agent-registry')
    expect(slugs).toContain('agent-registry')
  })
})
