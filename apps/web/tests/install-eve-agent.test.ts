import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import { getDocsPage } from '@/lib/docs-content'
import { getLearnPage, listLearnPages } from '@/lib/learn-content'
import { buildLearnPageMarkdown } from '@/lib/markdown-content'

const CATALOG_INLINE = '`npx shadcn@latest add @evex/<slug>`'
const EVE_INIT_INLINE = '`npx eve@latest init`'
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
    expect(page.dateModified).toBe('2026-09-03')
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

  it('locks the lede with Eve init and catalog commands as markdown inline code', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.summary).toBe(
      'An Eve agent is files in an Eve app. Scaffold the app with `npx eve@latest init`, write files under `agent/` yourself, or add a catalog agent with `npx shadcn@latest add @evex/<slug>`.',
    )
    expect(page.summary).toContain(EVE_INIT_INLINE)
    expect(page.summary).toContain(CATALOG_INLINE)
    expect(page.summary).not.toContain('@evex/{slug}')
    expect(page.summary).not.toContain('eve add')
    expect(page.summary).not.toMatch(MARKETPLACE)
    expect(page.summary).not.toMatch(VERCEL_DEPLOY)

    const ledeHtml = renderInlineMarkdown(page.summary)
    expect(ledeHtml).toContain('<code')
    expect(ledeHtml).toContain('npx eve@latest init')
    expect(ledeHtml).toContain('@evex/&lt;slug&gt;')
    expect(ledeHtml).not.toContain('@evex/<!-- -->')
    expect(ledeHtml).not.toContain(CATALOG_INLINE)
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
    expect(ledeHtml).toContain('npx eve@latest init')
    expect(ledeHtml).toContain('npx shadcn@latest add @evex/&lt;slug&gt;')
    expect(ledeHtml).not.toContain('`npx shadcn@latest add @evex/<slug>`')
  })

  it('uses the four required H2s and both install commands', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.sections.map((section) => section.heading)).toEqual([
      'Start with an Eve app',
      'Add a community agent from a registry',
      'Or write the agent yourself',
      'Where evex fits',
    ])

    const scaffoldSection = page.sections.find(
      (section) => section.heading === 'Start with an Eve app',
    )
    expect(scaffoldSection?.body).toEqual([
      'You need Node.js 24. The official scaffold is:',
      '`npx eve@latest init my-agent`',
      'If you already have a package.json, run `npx eve@latest init .` from that root before you add `agent/` files. Or install manually with `npm install eve@latest ai zod`, then create `agent/instructions.md`.',
    ])

    const catalogSection = page.sections.find(
      (section) => section.heading === 'Add a community agent from a registry',
    )
    expect(catalogSection?.body).toEqual([
      'The shadcn CLI copies agent source into that Eve app. evex is one catalog:',
      CATALOG_INLINE,
      'Inspect the files on [/agents](/agents) first. Other registries use the same CLI with their own namespace. After the files land, evex is out of the loop.',
    ])

    const writeSection = page.sections.find(
      (section) => section.heading === 'Or write the agent yourself',
    )
    expect(writeSection?.body).toEqual([
      'A minimal agent needs `agent/instructions.md`. Add `agent/agent.ts` when you need runtime config. You do not need a catalog.',
    ])

    const fitsSection = page.sections.find(
      (section) => section.heading === 'Where evex fits',
    )
    expect(fitsSection?.body).toEqual([
      'evex is an open catalog of community Eve agents, not the Eve runtime. Browse [/agents](/agents). What a registry is: [Eve agent registry](/learn/eve-agent-registry). CLI details: [Installation](/docs/installation). Official Eve getting started: [eve.dev/docs/getting-started](https://eve.dev/docs/getting-started).',
    ])
    expect(fitsSection?.body[0]?.startsWith('evex is an open catalog')).toBe(
      true,
    )
    expect(fitsSection?.body[0]).not.toContain('eevex')

    const bodyText = page.sections.flatMap((section) => section.body).join('\n')
    expect(bodyText).toContain(CATALOG_INLINE)
    expect(bodyText).toContain('`npx eve@latest init my-agent`')
    expect(bodyText).not.toContain('@evex/{slug}')
    expect(bodyText).not.toContain('eve add')
    expect(bodyText).not.toMatch(MARKETPLACE)
    expect(bodyText).not.toMatch(VERCEL_DEPLOY)
    expect(bodyText).not.toContain('eevex')

    const markdown = buildLearnPageMarkdown(page)
    expect(markdown).toContain(CATALOG_INLINE)
    expect(markdown).toContain('`npx eve@latest init my-agent`')
    expect(markdown).toContain('[/agents](/agents)')
    expect(markdown).toContain(
      '[Eve agent registry](/learn/eve-agent-registry)',
    )
    expect(markdown).toContain('[Installation](/docs/installation)')
    expect(markdown).toContain(
      '[eve.dev/docs/getting-started](https://eve.dev/docs/getting-started)',
    )
  })

  it('keeps decisionRows, examples, and faqs honest about Eve vs catalog', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.comparisonRows).toBeUndefined()
    expect(page.decisionRows).toEqual([
      {
        choice: 'Scaffold a new Eve app',
        useWhen: 'You do not have an Eve project.',
        avoidWhen: 'You already have one.',
      },
      {
        choice: 'Write files under agent/',
        useWhen: 'You are authoring the agent.',
        avoidWhen: 'You want a ready-made catalog agent.',
      },
      {
        choice: 'Install from evex',
        useWhen: 'You picked a slug on /agents.',
        avoidWhen:
          'You need a different registry, or you still need to inspect the source.',
      },
    ])
    expect(page.examples.length).toBeGreaterThan(0)
    expect(page.faqs).toEqual([
      {
        question:
          'Is `npx shadcn@latest add @evex/<slug>` how you install Eve?',
        answer:
          'No. That copies a catalog agent into an Eve app. Eve itself is `npx eve@latest init`.',
      },
      {
        question: 'Do I need evex to install an Eve agent?',
        answer:
          'No. You can scaffold with eve init or write `agent/` files yourself.',
      },
      {
        question: 'What is the evex command?',
        answer:
          '`npx shadcn@latest add @evex/<slug>` inside an Eve app, after you inspect the files on /agents.',
      },
    ])
    expect(page.description).toContain('npx eve@latest init')
    expect(page.description).toContain('npx shadcn@latest add @evex/<slug>')
    expect(page.description).not.toMatch(MARKETPLACE)
    expect(page.description).not.toMatch(VERCEL_DEPLOY)
    expect(page.description).not.toContain('@evex/{slug}')
  })

  it('emits crawlable hrefs for catalog, registry, docs, and eve.dev', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const fitsBody = page.sections.find(
      (section) => section.heading === 'Where evex fits',
    )?.body
    const html = (fitsBody ?? [])
      .map((paragraph) => renderInlineMarkdown(paragraph))
      .join('')

    expect(html).toContain('href="/agents"')
    expect(html).toContain('href="/learn/eve-agent-registry"')
    expect(html).toContain('href="/docs/installation"')
    expect(html).toContain('href="https://eve.dev/docs/getting-started"')
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
