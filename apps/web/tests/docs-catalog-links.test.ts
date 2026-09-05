import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import { getDocsPage } from '@/lib/docs-content'

const DOCS_BODY_MARKDOWN_USAGE =
  /<p key=\{paragraph\}>\s*<LearnInlineMarkdown>\{paragraph\}<\/LearnInlineMarkdown>\s*<\/p>/

function renderInlineMarkdown(markdown: string): string {
  return renderToStaticMarkup(
    createElement(LearnInlineMarkdown, null, markdown),
  )
}

describe('docs in-body catalog links', () => {
  it('wires LearnInlineMarkdown into DocsSections body paragraphs', () => {
    const source = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/docs/docs-sections.tsx'),
      'utf8',
    )

    expect(source).toContain('LearnInlineMarkdown')
    expect(source).toMatch(DOCS_BODY_MARKDOWN_USAGE)
  })

  it('adds crawlable catalog anchors on /docs Where to go next', () => {
    const page = getDocsPage('introduction')
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.dateModified).toBe('2026-09-05')
    expect(page.title).toBe(
      'evex documentation: the community registry for eve agents',
    )

    const nextSection = page.sections.find(
      (section) => section.heading === 'Where to go next',
    )
    expect(nextSection).toBeDefined()
    expect(nextSection?.body).toHaveLength(4)
    expect(nextSection?.body[0]).toContain('The Installation page covers')
    expect(nextSection?.body[1]).toBe(
      'The live catalog is [Eve agents](/agents). First-party agents include the [Eve GitHub issue agent](/agents/github-issue-maintainer), the [Eve docs Q&A agent](/agents/docs-knowledge-assistant), and the [Eve support reply agent](/agents/support-reply-draft).',
    )
    expect(nextSection?.body[2]).toBe(
      'How to install: [Install an Eve agent](/learn/install-eve-agent).',
    )
    expect(nextSection?.body[3]).toBe(
      'How evex compares to agentcn: [evex vs agentcn](/learn/evex-vs-agentcn).',
    )

    const html = (nextSection?.body ?? [])
      .map((paragraph) => renderInlineMarkdown(paragraph))
      .join('')

    expect(html).toContain('href="/agents">Eve agents</a>')
    expect(html).toContain(
      'href="/agents/github-issue-maintainer">Eve GitHub issue agent</a>',
    )
    expect(html).toContain(
      'href="/agents/docs-knowledge-assistant">Eve docs Q&amp;A agent</a>',
    )
    expect(html).toContain(
      'href="/agents/support-reply-draft">Eve support reply agent</a>',
    )
    expect(html).toContain(
      'href="/learn/install-eve-agent">Install an Eve agent</a>',
    )
    expect(html).toContain('href="/learn/evex-vs-agentcn">evex vs agentcn</a>')
    expect(html).not.toContain('/learn/eve-agent-registry')
    expect(html).not.toContain('[Eve agents](/agents)')
    expect(html).not.toContain(
      '[Install an Eve agent](/learn/install-eve-agent)',
    )
    expect(html).not.toContain('[evex vs agentcn](/learn/evex-vs-agentcn)')
  })

  it('adds a crawlable comparison link in /docs/installation More docs', () => {
    const page = getDocsPage('installation')
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const installSection = page.sections.find(
      (section) => section.heading === 'Run the install command',
    )
    expect(installSection?.body).toContain(
      'How to install: [Install an Eve agent](/learn/install-eve-agent).',
    )
    expect(page.sections.map((section) => section.heading)).not.toContain(
      'More docs',
    )

    const source = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/docs/[slug]/page.tsx'),
      'utf8',
    )
    expect(source).toContain('LearnInlineMarkdown')
    expect(source).toContain("page.slug === 'installation'")
    expect(source).toContain(
      'How evex compares to agentcn: [evex vs agentcn](/learn/evex-vs-agentcn).',
    )
    expect(source).not.toContain('As-of')
    expect(source).not.toContain('as of')

    const html = renderInlineMarkdown(
      'How evex compares to agentcn: [evex vs agentcn](/learn/evex-vs-agentcn).',
    )
    expect(html).toContain('href="/learn/evex-vs-agentcn">evex vs agentcn</a>')
    expect(html).not.toContain('[evex vs agentcn](/learn/evex-vs-agentcn)')

    const installHtml = (installSection?.body ?? [])
      .map((paragraph) => renderInlineMarkdown(paragraph))
      .join('')
    expect(installHtml).toContain(
      'href="/learn/install-eve-agent">Install an Eve agent</a>',
    )
  })

  it('adds crawlable Learn links after the /agents hub lede', () => {
    const source = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/agents/page.tsx'),
      'utf8',
    )
    const learnLinks =
      'How to install from a registry: [Install an Eve agent](/learn/install-eve-agent). How evex differs from agentcn: [evex vs agentcn](/learn/evex-vs-agentcn).'

    expect(source).toContain('LearnInlineMarkdown')
    expect(source).toContain(learnLinks)
    expect(source).not.toContain('As-of')
    expect(source).not.toContain('as of')

    const html = renderInlineMarkdown(learnLinks)
    expect(html).toContain(
      'href="/learn/install-eve-agent">Install an Eve agent</a>',
    )
    expect(html).toContain('href="/learn/evex-vs-agentcn">evex vs agentcn</a>')
    expect(html).not.toContain(
      '[Install an Eve agent](/learn/install-eve-agent)',
    )
    expect(html).not.toContain('[evex vs agentcn](/learn/evex-vs-agentcn)')
  })

  it('adds crawlable /agents anchor on the publishing deploy vs PR section', () => {
    const page = getDocsPage('publishing')
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.dateModified).toBe('2026-09-01')
    expect(page.title).toBe('Publish your eve agent to the evex registry')
    expect(page.sections.map((section) => section.heading)[0]).toBe(
      'Publish an Eve agent, or vercel deploy?',
    )
    expect(page.sections.map((section) => section.heading)[1]).toBe(
      'Scaffold a new agent',
    )

    const deploySection = page.sections[0]
    expect(deploySection?.body).toEqual([
      'vercel deploy ships your Eve app to Vercel. Publishing an Eve agent to the community registry is a pull request on evex. After merge, people install it with `npx shadcn@latest add @evex/<slug>`. The live catalog is [/agents](/agents).',
    ])
    expect(deploySection?.body[0]).toContain(
      '`npx shadcn@latest add @evex/<slug>`',
    )
    expect(deploySection?.body[0]).not.toContain('eve add')
    expect(deploySection?.body[0]).not.toContain('@evex/{slug}')
    expect(deploySection?.body.join(' ')).not.toContain('Not a PR reviewer')

    const html = renderInlineMarkdown(deploySection?.body[0] ?? '')
    expect(html).toContain('href="/agents">/agents</a>')
    expect(html).not.toContain('[/agents](/agents)')
    // Inline code keeps <slug> out of the HTML parser (no raw tag / comment split).
    expect(html).toContain('<code')
    expect(html).toContain('@evex/&lt;slug&gt;')
    expect(html).not.toContain('@evex/<!-- -->')
  })
})
