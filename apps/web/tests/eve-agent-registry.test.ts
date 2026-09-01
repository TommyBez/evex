import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LEARN_INDEX_REGISTRY_LINK } from '@/app/(main)/learn/page'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import { getDocsPage } from '@/lib/docs-content'
import { getLearnPage, listLearnPages } from '@/lib/learn-content'
import { buildLearnPageMarkdown } from '@/lib/markdown-content'

const INSTALL_INLINE = '`npx shadcn@latest add @evex/<slug>`'
const REGISTRY_HREF = '/learn/eve-agent-registry'
const MARKETPLACE = /marketplace/i
const VERCEL_DEPLOY = /vercel deploy/i
const DKA_OR_GIM =
  /docs-knowledge-assistant|github-issue-maintainer|support-reply-draft/i

function renderInlineMarkdown(markdown: string): string {
  return renderToStaticMarkup(
    createElement(LearnInlineMarkdown, null, markdown),
  )
}

describe('learn page: eve-agent-registry', () => {
  const page = getLearnPage('eve-agent-registry')

  it('exists with locked title, H1 fields, dates, and keyword', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.slug).toBe('eve-agent-registry')
    expect(page.title).toBe('Eve agent registry')
    expect(page.shortTitle).toBe('Eve agent registry')
    expect(page.cluster).toBe('distribution')
    expect(page.datePublished).toBe('2026-09-01')
    expect(page.dateModified).toBe('2026-09-01')
    expect(page.primaryKeyword).toBe('eve agent registry')
    expect(page.title.endsWith(' · evex')).toBe(false)
  })

  it('keeps the agent-registry slug as a separate page', () => {
    const sibling = getLearnPage('agent-registry')
    expect(sibling).not.toBeNull()
    expect(sibling?.title).toBe(
      'Agent registry: discovery without trust is just a list',
    )
    expect(
      listLearnPages().some((entry) => entry.slug === 'eve-agent-registry'),
    ).toBe(true)
  })

  it('locks the lede with install command as markdown inline code', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.summary).toBe(
      'evex is the open registry for Eve agents. Browse the catalog, inspect every file, and install with `npx shadcn@latest add @evex/<slug>`.',
    )
    expect(page.summary).toContain(INSTALL_INLINE)
    expect(page.summary).not.toContain('@evex/{slug}')
    expect(page.summary).not.toContain('eve add')
    expect(page.summary).not.toContain('[@]evex')
    expect(page.summary).not.toMatch(MARKETPLACE)
    expect(page.summary).not.toMatch(VERCEL_DEPLOY)
    expect(page.summary).not.toMatch(DKA_OR_GIM)

    const ledeHtml = renderInlineMarkdown(page.summary)
    expect(ledeHtml).toContain('<code')
    expect(ledeHtml).toContain('@evex/&lt;slug&gt;')
    expect(ledeHtml).not.toContain('@evex/<!-- -->')
  })

  it('uses the three required H2s and the exact install command', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.sections.map((section) => section.heading)).toEqual([
      'What it is',
      'How you install',
      'Where to browse',
    ])

    const installSection = page.sections.find(
      (section) => section.heading === 'How you install',
    )
    expect(installSection?.body).toEqual([
      'Run this inside an Eve app:',
      INSTALL_INLINE,
      'The files land in your project. After that, evex is out of the loop.',
    ])

    const bodyText = page.sections.flatMap((section) => section.body).join('\n')
    expect(bodyText).toContain(INSTALL_INLINE)
    expect(bodyText).not.toContain('@evex/{slug}')
    expect(bodyText).not.toContain('eve add')
    expect(bodyText).not.toMatch(MARKETPLACE)
    expect(bodyText).not.toMatch(VERCEL_DEPLOY)
    expect(bodyText).not.toMatch(DKA_OR_GIM)
    expect(bodyText).not.toContain('Not a PR reviewer')

    const markdown = buildLearnPageMarkdown(page)
    expect(markdown).toContain(INSTALL_INLINE)
    expect(markdown).toContain('[/agents](/agents)')
    expect(markdown).toContain('[evex documentation](/docs)')
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
    expect(page.description).not.toMatch(DKA_OR_GIM)
  })
})

describe('in-body links to /learn/eve-agent-registry', () => {
  it('adds a crawlable registry link on /docs Where to go next', () => {
    const docs = getDocsPage('introduction')
    expect(docs).not.toBeNull()
    if (!docs) {
      return
    }

    expect(docs.dateModified).toBe('2026-09-01')

    const nextSection = docs.sections.find(
      (section) => section.heading === 'Where to go next',
    )
    expect(nextSection?.body).toContain(
      'What an Eve agent registry is: [Eve agent registry](/learn/eve-agent-registry).',
    )

    const html = (nextSection?.body ?? [])
      .map((paragraph) => renderInlineMarkdown(paragraph))
      .join('')

    expect(html).toContain(`href="${REGISTRY_HREF}">Eve agent registry</a>`)
    expect(html).not.toContain(`[Eve agent registry](${REGISTRY_HREF})`)
  })

  it('adds a crawlable registry link on the /learn index intro', () => {
    expect(LEARN_INDEX_REGISTRY_LINK).toBe(
      'What an Eve agent registry is: [Eve agent registry](/learn/eve-agent-registry).',
    )

    const html = renderInlineMarkdown(LEARN_INDEX_REGISTRY_LINK)
    expect(html).toContain(`href="${REGISTRY_HREF}">Eve agent registry</a>`)
    expect(html).not.toContain(`[Eve agent registry](${REGISTRY_HREF})`)
  })

  it('is listed by listLearnPages for sitemap and llms twins', () => {
    const slugs = listLearnPages().map((entry) => entry.slug)
    expect(slugs).toContain('eve-agent-registry')
    expect(slugs).toContain('agent-registry')
  })
})
