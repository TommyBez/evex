import { describe, expect, it } from 'vitest'
import { getDocsPage } from '@/lib/docs-content'
import { getLearnPage, listLearnPages } from '@/lib/learn-content'
import { buildLearnPageMarkdown } from '@/lib/markdown-content'

const EVE_ADD_COMMAND = /eve add/
const INSTALL_INLINE_CODE = '`npx shadcn@latest add @evex/<slug>`'
const LEARN_HREF = '/learn/publish-eve-agent'
const BRACKET_SLUG = /\{slug\}/
const AT_BRACKET_EVEX = /\[@\]evex/

describe('learn page: publish-eve-agent', () => {
  const page = getLearnPage('publish-eve-agent')

  it('exists with locked title, H1 fields, lede, and distribution cluster', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.slug).toBe('publish-eve-agent')
    expect(page.title).toBe('Publish an Eve agent')
    expect(page.shortTitle).toBe('Publish an Eve agent')
    expect(page.summary).toBe(
      'Publishing an Eve agent to the community registry is a pull request on evex. vercel deploy ships your Eve app. It does not add the agent to the catalog.',
    )
    expect(page.cluster).toBe('distribution')
    expect(page.datePublished).toBe('2026-09-01')
    expect(page.dateModified).toBe('2026-09-01')
    expect(page.primaryKeyword).toBe('publish eve agent')
    expect(page.title.endsWith(' · evex')).toBe(false)
  })

  it('uses the three required H2s and install command as inline code with <slug>', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.sections.map((section) => section.heading)).toEqual([
      'vercel deploy is not publish',
      'How an agent joins evex',
      'After merge',
    ])

    const afterMerge = page.sections.find(
      (section) => section.heading === 'After merge',
    )
    expect(afterMerge?.body.join('\n')).toContain(INSTALL_INLINE_CODE)
    expect(afterMerge?.body.join('\n')).toContain('[/agents](/agents)')
    expect(afterMerge?.body.join('\n')).toContain(
      '[Publish your eve agent to the evex registry](/docs/publishing)',
    )

    const markdown = buildLearnPageMarkdown(page)
    expect(markdown).toContain(INSTALL_INLINE_CODE)
    expect(markdown).not.toMatch(EVE_ADD_COMMAND)
    expect(markdown).not.toMatch(AT_BRACKET_EVEX)
    // Install path uses <slug>, not {slug}.
    expect(INSTALL_INLINE_CODE).not.toMatch(BRACKET_SLUG)
  })

  it('is listed for sitemap and llms via listLearnPages', () => {
    const slugs = listLearnPages().map((entry) => entry.slug)
    expect(slugs).toContain('publish-eve-agent')
  })
})

describe('docs in-body links to /learn/publish-eve-agent', () => {
  it('includes a crawlable href on the docs introduction page', () => {
    const page = getDocsPage('introduction')
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.dateModified).toBe('2026-09-01')
    const whereNext = page.sections.find(
      (section) => section.heading === 'Where to go next',
    )
    expect(whereNext?.body.join('\n')).toContain(
      `[Publish an Eve agent](${LEARN_HREF})`,
    )
  })

  it('includes a crawlable href on the docs publishing page without recutting the title', () => {
    const page = getDocsPage('publishing')
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.title).toBe('Publish your eve agent to the evex registry')
    expect(page.dateModified).toBe('2026-09-01')
    const firstSection = page.sections[0]
    expect(firstSection?.heading).toBe('Scaffold a new agent')
    expect(firstSection?.body.join('\n')).toContain(
      `[Publish an Eve agent](${LEARN_HREF})`,
    )
  })
})
