import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FEATURED_LEARN_SLUGS } from '@/app/(main)/learn/page'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import {
  getLearnPage,
  getLearnPageHeading,
  listLearnPages,
} from '@/lib/learn-content'
import { buildLearnPageMarkdown } from '@/lib/markdown-content'
import { createPageMetadata } from '@/lib/metadata'
import { createLearnArticleSchema } from '@/lib/structured-data'

const FEATURED_CARD_ONE_LINER =
  'Vercel-first Eve vs deploy-anywhere Flue, then Evex installs.'
const DOCUMENT_TITLE =
  'Eve vs Flue: which TypeScript agent framework (and where Evex fits)'
const VISIBLE_H1 = 'Eve vs Flue: Vercel-first vs deploy-anywhere'
const EM_DASH = '—'
const SLUG_PLACEHOLDER = '@evex/<slug>'

const renderInlineMarkdown = (markdown: string): string =>
  renderToStaticMarkup(createElement(LearnInlineMarkdown, null, markdown))

describe('learn page: eve-vs-flue', () => {
  const page = getLearnPage('eve-vs-flue')

  it('locks Soft Eng fields plus distinct document title and H1', () => {
    expect(page).not.toBeNull()
    expect(page?.slug).toBe('eve-vs-flue')
    expect(page?.title).toBe(DOCUMENT_TITLE)
    expect(page?.heading).toBe(VISIBLE_H1)
    expect(page ? getLearnPageHeading(page) : null).toBe(VISIBLE_H1)
    expect(page?.shortTitle).toBe('Eve vs Flue')
    expect(page?.cluster).toBe('comparisons')
    expect(page?.primaryKeyword).toBe('eve vs flue')
    expect(page?.relatedKeywords).toEqual([
      'flue framework',
      'eve agent framework',
      'install eve agent',
    ])
    expect(page?.datePublished).toBe('2026-09-06')
    expect(page?.dateModified).toBe('2026-09-06')
    expect(page?.description).toBe(
      'Compare Eve and Flue on deployment gravity: Vercel-first vs deploy-anywhere. Then see where Evex fits as the registry for reusable Eve agents.',
    )
    expect(page?.summary).toBe(
      'Pick Eve when your default path is Vercel. Pick Flue when you need to write once and deploy across Node, Cloudflare, or CI. After you choose Eve (or already have an Eve app), Evex is how you install reusable agents with `npx shadcn@latest add @evex/<slug>`.',
    )
  })

  it('emits the Writer document title from page metadata and H1 from heading', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const metadata = createPageMetadata({
      title: page.title,
      description: page.description,
      path: `/learn/${page.slug}`,
      markdownPath: `/learn/${page.slug}.md`,
    })
    expect(metadata.title).toBe(DOCUMENT_TITLE)
    expect(String(metadata.title).endsWith(' · evex')).toBe(false)

    const pageSource = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/learn/[slug]/page.tsx'),
      'utf8',
    )
    expect(pageSource).toContain('title: page.title')
    expect(pageSource).toContain('{getLearnPageHeading(page)}')
  })

  it('keeps the exact locked sections, commands, facts, and links', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.sections.map((section) => section.heading)).toEqual([
      'The decision is deployment gravity',
      'Eve in one paragraph',
      'Flue in one paragraph',
      'Where Evex fits',
    ])

    const text = page.sections.flatMap((section) => section.body).join('\n')
    for (const value of [
      'Eve and Flue are both TypeScript agent frameworks.',
      '`eve deploy`',
      '[Deploy to Vercel](https://eve.dev/docs/guides/deployment/vercel)',
      'write-once, deploy-anywhere',
      '[Flue getting started](https://flueframework.com/docs/guide/getting-started/)',
      '`npx eve@latest init`',
      '[Eve getting started](https://eve.dev/docs/getting-started)',
      'programmable harness',
      '[Flue](https://flueframework.com/)',
      '[withastro/flue](https://github.com/withastro/flue)',
      'Eve is the TypeScript agent framework you author under `agent/`. Evex is the catalog where you browse reusable Eve agents and install them as source into that project.',
      '[/agents](/agents)',
      '`npx shadcn@latest add @evex/<slug>`',
      '[Installation](/docs/installation)',
      '[MCP](/docs/mcp)',
      '[/docs](/docs)',
      '[/learn/install-eve-agent](/learn/install-eve-agent)',
      'agents installing into an eve app, not into a Flue app',
    ]) {
      expect(text).toContain(value)
    }

    expect(text).toContain(SLUG_PLACEHOLDER)
    expect(text).not.toContain('@evex/{slug}')
    expect(text).not.toContain('open catalog')
    expect(text).not.toContain('not the Eve runtime')
    expect(text).not.toContain('Evex is not a framework')
    expect(text).not.toContain('is not a framework')
    expect(text).not.toContain('is not the runtime')
    expect(text).not.toContain(EM_DASH)
    expect(page.title).not.toContain(EM_DASH)
    expect(page.heading).not.toContain(EM_DASH)
    expect(page.description).not.toContain(EM_DASH)
    expect(page.summary).not.toContain(EM_DASH)
  })

  it('matches the three locked decision rows, examples, and four FAQs', () => {
    expect(page?.decisionRows).toEqual([
      {
        choice: 'Eve',
        useWhen:
          'Your default host is Vercel, and you want filesystem agents under `agent/` with `eve init` / `eve deploy`.',
        avoidWhen:
          'You need Node, Cloudflare, or CI as equal first-class targets without a Vercel-first gravity.',
      },
      {
        choice: 'Flue',
        useWhen:
          'You want an open harness/framework you can run locally and deploy across Node, Cloudflare, or CI.',
        avoidWhen:
          'Your team is already committed to Eve on Vercel and wants registry installs from Evex.',
      },
      {
        choice: 'Evex install',
        useWhen:
          'You already have (or will create) an Eve app and want reusable agent source via `npx shadcn@latest add @evex/<slug>`.',
        avoidWhen:
          'You only have a Flue project and expected `@evex` to install there. Evex installs into an eve project.',
      },
    ])
    expect(page?.examples).toEqual([
      {
        label: 'Eve on Vercel, then Evex',
        body: 'Your default host is Vercel, so you scaffold with `npx eve@latest init`, deploy with the Eve Vercel flow, then install a catalog agent from [/agents](/agents) with `npx shadcn@latest add @evex/<slug>`.',
      },
      {
        label: 'Flue for deploy-anywhere',
        body: 'You need Node, Cloudflare, or CI as equal targets, so you pick Flue and follow [Flue getting started](https://flueframework.com/docs/guide/getting-started/). You do not use `@evex/<slug>` unless you also keep an Eve app for registry installs.',
      },
    ])
    expect(page?.faqs).toEqual([
      {
        question: 'What is the difference between Eve and Evex?',
        answer:
          'Eve is the TypeScript agent framework (filesystem under `agent/`, Vercel-first deploy). Evex is the catalog of reusable Eve agents you inspect and install as source with `npx shadcn@latest add @evex/<slug>`.',
      },
      {
        question: 'Can I install Evex agents into a Flue project?',
        answer:
          'No. Evex Installation says agents install into an eve project and write the `agent/` layout Eve loads. If you want `@evex/<slug>`, create or open an Eve app first. Flue remains the right framework when deploy-anywhere is the priority.',
      },
      {
        question: 'When should I pick Flue?',
        answer:
          'Pick Flue when write-once and deploy across Node, Cloudflare, or CI matters more than a Vercel-first path, and you want the hooks-style Flue agent model.',
      },
      {
        question: 'When should I pick Eve?',
        answer:
          'Pick Eve when Vercel is your default production host and you want filesystem-authored agents with the Eve init and deploy flow. After the Eve app exists, use Evex to install catalog agents.',
      },
    ])

    for (const faq of page?.faqs ?? []) {
      expect(faq.question).not.toContain('`')
    }

    const pageText = [
      page?.title,
      page?.heading,
      page?.shortTitle,
      page?.description,
      page?.summary,
      ...(page?.sections.flatMap((section) => [
        section.heading,
        ...section.body,
      ]) ?? []),
      ...(page?.decisionRows.flatMap((row) => [
        row.choice,
        row.useWhen,
        row.avoidWhen,
      ]) ?? []),
      ...(page?.examples.flatMap((example) => [example.label, example.body]) ??
        []),
      ...(page?.faqs.flatMap((faq) => [faq.question, faq.answer]) ?? []),
    ].join('\n')

    expect(pageText).not.toContain('Evex is not a framework')
    expect(pageText).not.toContain('is not a framework')
    expect(pageText).not.toContain('is not the runtime')
    expect(pageText).not.toContain('not the Eve runtime')
    expect(pageText).not.toContain('Eve runtime')
    expect(pageText).not.toContain('Eve is the runtime')
    expect(pageText).toContain(
      'There is no hosted Evex runtime ([Installation](/docs/installation)).',
    )
  })

  it('renders decision-row backticks as inline code, not literal markdown', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const pageSource = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/learn/[slug]/page.tsx'),
      'utf8',
    )
    expect(pageSource).toContain(
      '<LearnInlineMarkdown>{row.useWhen}</LearnInlineMarkdown>',
    )
    expect(pageSource).toContain(
      '<LearnInlineMarkdown>{row.avoidWhen}</LearnInlineMarkdown>',
    )

    const html = page.decisionRows
      .flatMap((row) => [row.useWhen, row.avoidWhen])
      .map(renderInlineMarkdown)
      .join('')

    expect(html).toContain('<code')
    expect(html).toContain('>agent/</code>')
    expect(html).toContain('@evex/&lt;slug&gt;')
    expect(html).toContain('>eve init</code>')
    expect(html).not.toContain('`agent/`')
    expect(html).not.toContain(`\`${SLUG_PLACEHOLDER}\``)
  })

  it('renders locked markdown links as crawlable anchors', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const html = [
      page.summary,
      ...page.sections.flatMap((section) => section.body),
    ]
      .map(renderInlineMarkdown)
      .join('')

    for (const href of [
      '/agents',
      '/docs',
      '/docs/installation',
      '/docs/mcp',
      '/learn/install-eve-agent',
      'https://eve.dev/docs/guides/deployment/vercel',
      'https://eve.dev/docs/getting-started',
      'https://flueframework.com/',
      'https://flueframework.com/docs/guide/getting-started/',
      'https://github.com/withastro/flue',
    ]) {
      expect(html).toContain(`href="${href}"`)
    }

    const exampleHtml = page.examples
      .map((example) => renderInlineMarkdown(example.body))
      .join('')
    expect(exampleHtml).toContain('href="/agents"')
    expect(exampleHtml).toContain(
      'href="https://flueframework.com/docs/guide/getting-started/"',
    )
  })

  it('mirrors the visible H1 in markdown and Article JSON-LD', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const markdown = buildLearnPageMarkdown(page)
    expect(markdown.startsWith(`# ${VISIBLE_H1}\n`)).toBe(true)
    expect(markdown).toContain(page.description)
    expect(markdown).toContain(SLUG_PLACEHOLDER)
    expect(markdown).not.toContain('@evex/{slug}')

    const schema = createLearnArticleSchema(page)
    expect(schema['@type']).toBe('Article')
    expect(schema.headline).toBe(VISIBLE_H1)
    expect(schema.description).toBe(page.description)
    expect(schema.url).toBe('https://www.evex.sh/learn/eve-vs-flue')
    expect(schema.datePublished).toBe('2026-09-06')
    expect(schema.dateModified).toBe('2026-09-06')
    expect(schema.about).toBe('eve vs flue')
    expect(schema.keywords).toEqual([
      'eve vs flue',
      'flue framework',
      'eve agent framework',
      'install eve agent',
    ])
  })

  it('is featured on the /learn index with the locked card one-liner', () => {
    const source = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/learn/page.tsx'),
      'utf8',
    )

    expect(FEATURED_LEARN_SLUGS).toContain('eve-vs-flue')
    expect(source).toContain("'eve-vs-flue'")
    expect(source).toContain(FEATURED_CARD_ONE_LINER)
  })

  it('is listed by listLearnPages for sitemap and llms twins', () => {
    const slugs = listLearnPages().map((entry) => entry.slug)
    expect(slugs).toContain('eve-vs-flue')
  })
})
