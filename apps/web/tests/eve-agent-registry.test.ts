import { readFileSync } from 'node:fs'
import path from 'node:path'
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
const LEARN_SUMMARY_MARKDOWN_USAGE =
  /<LearnInlineMarkdown>\{page\.summary\}<\/LearnInlineMarkdown>/
const LEARN_SUMMARY_RAW_TEXT_USAGE =
  /<p className="mt-3 text-pretty font-medium text-foreground leading-relaxed">\s*\{page\.summary\}\s*<\/p>/

const renderInlineMarkdown = (markdown: string): string =>
  renderToStaticMarkup(createElement(LearnInlineMarkdown, null, markdown))

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
    expect(page.dateModified).toBe('2026-09-04')
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
    // Markdown backticks must not survive as visible raw characters once rendered.
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
      'What it is',
      'How you install',
      'Where to browse',
    ])

    const installSection = page.sections.find(
      (section) => section.heading === 'How you install',
    )
    expect(page.sections[0]?.body).toEqual([
      'An Eve agent registry is a catalog of reusable agents for [Eve](https://eve.dev/docs/getting-started). Each agent is source you can read on [/agents](/agents) before install. evex is that registry. Agents enter through a reviewed pull request ([Publishing](/docs/publishing)).',
    ])

    expect(installSection?.body).toEqual([
      'From the root of an Eve app:',
      INSTALL_INLINE,
      'The CLI writes the agent source into your project ([Installation](/docs/installation)). After install, the files are local.',
    ])

    expect(page.sections[2]?.body).toEqual([
      'The live catalog is [/agents](/agents). Publishing is in [Publishing](/docs/publishing).',
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
    expect(markdown).toContain('[Publishing](/docs/publishing)')
    expect(markdown).toContain('[Installation](/docs/installation)')
    expect(markdown).not.toContain('[evex documentation](/docs)')
  })

  it('locks decisionRows, examples, and faqs without a comparison table', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.comparisonRows).toBeUndefined()
    expect(page.decisionRows).toEqual([
      {
        choice: 'Browse then install',
        useWhen:
          'You want Eve agent source on /agents before adding it to a project.',
        avoidWhen:
          'You want a hosted agent service rather than source files in a project.',
      },
      {
        choice: 'Contribute by pull request',
        useWhen: 'You have an Eve agent package ready for review on evex.',
        avoidWhen:
          'You need a publish path other than a reviewed pull request on evex.',
      },
    ])
    expect(page.examples).toEqual([
      {
        label: 'Install from the catalog',
        body: 'Pick a slug on [/agents](/agents), then run `npx shadcn@latest add @evex/<slug>` from an Eve app root.',
      },
      {
        label: 'Publish an agent',
        body: 'Agents join the catalog through a reviewed pull request ([Publishing](/docs/publishing)).',
      },
    ])
    expect(page.faqs).toEqual([
      {
        question: 'How do agents enter the Eve agent registry?',
        answer: 'Through a reviewed pull request.',
      },
      {
        question: 'What does the install command do?',
        answer:
          '`npx shadcn@latest add @evex/<slug>` writes the agent files into your Eve project. After install, the files are local.',
      },
      {
        question: 'Where do I browse the live catalog?',
        answer: 'The live catalog is [/agents](/agents).',
      },
    ])
    expect(page.description).toBe(
      'evex is the open registry for Eve agents. Browse the catalog, inspect every file, and install with npx shadcn@latest add @evex/<slug>. Agents enter through a reviewed pull request.',
    )
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

    expect(docs.dateModified).toBe('2026-09-02')

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
