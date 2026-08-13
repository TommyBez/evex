import { describe, expect, it } from 'vitest'
import { getDocsPage } from '@/lib/docs-content'
import { getLearnPage, getRelatedLearnPages } from '@/lib/learn-content'
import { buildLearnPageMarkdown } from '@/lib/markdown-content'

const WORD_SPLIT = /\s+/
const EVE_ADD_OUTSIDE_BACKTICKS = /(?:^|[^`])eve add(?:$|[^`])/m

describe('docs introduction AI-SEO definition', () => {
  it('renames the first section and uses the exact 45-word summary', () => {
    const page = getDocsPage('introduction')
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.sections[0]?.heading).toBe('What is an Eve agent registry?')
    expect(page.summary).toBe(
      'An Eve agent registry is a catalog of reusable agents for Eve developers. You inspect files, then install them as source with npx shadcn@latest add @evex/<slug>, instead of copying folders. evex is that registry. After install you own the files. There is no hosted runtime.',
    )
    expect(page.summary.split(WORD_SPLIT).filter(Boolean)).toHaveLength(45)
    expect(page.sections[0]?.body.join(' ')).not.toContain(page.summary)
    expect(page.summary).not.toContain('eve add')
  })
})

describe('learn page: evex vs agentcn', () => {
  const page = getLearnPage('evex-vs-agentcn')

  it('is present with comparison cluster metadata', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.slug).toBe('evex-vs-agentcn')
    expect(page.title).toBe('Eve agent registries: evex vs agentcn')
    expect(page.shortTitle).toBe('evex vs agentcn')
    expect(page.cluster).toBe('comparisons')
    expect(page.datePublished).toBe('2026-08-13')
    expect(page.dateModified).toBe('2026-08-13')
    expect(page.primaryKeyword).toBe('evex vs agentcn')
  })

  it('has a comparison table, bottom line, five FAQs, and shadcn install', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.comparisonRows?.length).toBe(8)
    expect(page.comparisonBottomLine).toContain('inspect-before-install')
    expect(page.faqs).toHaveLength(5)
    expect(page.decisionRows.map((row) => row.choice)).toEqual([
      'evex',
      'agentcn',
      'Copy-paste from GitHub',
    ])
    expect(page.examples.map((example) => example.label)).toEqual([
      'evex inspect-then-install',
      'agentcn mixed-framework',
    ])

    const markdown = buildLearnPageMarkdown(page)
    expect(markdown).toContain('| Criterion | evex | agentcn |')
    expect(markdown).toContain('npx shadcn@latest add @evex/<slug>')
    // Explicit anti-pattern callout is required; do not publish `eve add` as install.
    expect(markdown).toContain('Never `eve add`')
    expect(markdown).not.toMatch(EVE_ADD_OUTSIDE_BACKTICKS)
  })

  it('keeps related learn pages in the same topical neighborhood', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const relatedSlugs = getRelatedLearnPages(page, 4).map(
      (related) => related.slug,
    )
    expect(relatedSlugs).toEqual(
      expect.arrayContaining(['langgraph-vs-crewai']),
    )
  })

  it('uses the six required H2s in order', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.sections.map((section) => section.heading)).toEqual([
      'What an Eve agent registry is',
      'Same install mechanic, different product',
      'Inspect before you install',
      'How agents get into the catalog',
      'When to pick which',
      'How to install from evex',
    ])
  })
})
