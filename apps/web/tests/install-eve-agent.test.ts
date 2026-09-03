import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import { getDocsPage } from '@/lib/docs-content'
import { getLearnPage, listLearnPages } from '@/lib/learn-content'

const INSTALL_HREF = '/learn/install-eve-agent'

const renderInlineMarkdown = (markdown: string): string =>
  renderToStaticMarkup(createElement(LearnInlineMarkdown, null, markdown))

describe('learn page: install-eve-agent', () => {
  const page = getLearnPage('install-eve-agent')

  it('matches the locked title, date, summary, and slug', () => {
    expect(page).not.toBeNull()
    expect(page?.slug).toBe('install-eve-agent')
    expect(page?.title).toBe('Install an Eve agent')
    expect(page?.shortTitle).toBe('Install an Eve agent')
    expect(page?.dateModified).toBe('2026-09-03')
    expect(page?.summary).toBe(
      'The install command depends on where the Eve agent came from. Agents from evex and agentcn are copied into an Eve app you already have. An agent from bergside/awesome-eve-agents is installed as a new standalone directory.',
    )
  })

  it('keeps the exact locked sections, commands, facts, and links', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }
    expect(page.sections.map((section) => section.heading)).toEqual([
      'First, where did the agent come from?',
      'Into an existing Eve app',
      'As a standalone agent directory',
      'If you have no Eve app yet',
    ])
    const text = page.sections.flatMap((section) => section.body).join('\n')
    for (const value of [
      '`npx shadcn@latest add @evex/<slug>`',
      '`npx shadcn@latest add @agentcn/eve/deep-search`',
      '`npx @bergside/eveagents install <slug>`',
      '`cd <slug>`',
      '`npx eve@latest`',
      '`npx eve@latest init my-agent`',
      '21 agents',
      'MIT license',
      '26 GitHub stars when checked',
      '[/agents](/agents)',
      '[Eve agent registry](/learn/eve-agent-registry)',
      '[Installation](/docs/installation)',
      '[evex and agentcn comparison](/learn/evex-vs-agentcn)',
      '[eveagents.dev](https://eveagents.dev)',
      '[Eve getting started](https://eve.dev/docs/getting-started)',
    ]) {
      expect(text).toContain(value)
    }
    expect(text).not.toContain('@evex/{slug}')
    expect(text).not.toContain('open catalog')
    expect(text).not.toContain('not the Eve runtime')
  })

  it('matches the four locked decision rows and three FAQs', () => {
    expect(page?.decisionRows).toEqual([
      {
        choice: 'Scaffold a new Eve app',
        useWhen: 'You do not have an Eve app yet.',
        avoidWhen:
          'You already have an Eve app, or you are choosing an agent from a registry for an existing app.',
      },
      {
        choice: 'Write the agent yourself',
        useWhen: 'You are authoring your own agent files under agent/.',
        avoidWhen: 'You want a ready-made agent from a catalog.',
      },
      {
        choice: 'Install from evex or agentcn',
        useWhen:
          'You want registry source copied into an Eve app you already have.',
        avoidWhen:
          'You want a standalone agent directory, or you have no Eve app yet.',
      },
      {
        choice: 'Install from bergside/awesome-eve-agents',
        useWhen: 'You want the agent as its own standalone directory.',
        avoidWhen:
          'You want the agent copied into an Eve app you already have.',
      },
    ])
    expect(page?.faqs).toHaveLength(3)
    expect(page?.faqs.map((faq) => faq.question)).toEqual([
      "Why aren't the install commands interchangeable?",
      'What does each command install?',
      'Where can I inspect an agent before I run a command?',
    ])
  })

  it('renders locked markdown links as crawlable anchors', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }
    const html = page.sections
      .flatMap((section) => section.body)
      .map(renderInlineMarkdown)
      .join('')
    for (const href of [
      '/agents',
      '/learn/eve-agent-registry',
      '/docs/installation',
      '/learn/evex-vs-agentcn',
      'https://eveagents.dev',
      'https://eve.dev/docs/getting-started',
    ]) {
      expect(html).toContain(`href="${href}"`)
    }
  })

  it('does not add a fourth featured card on /learn', () => {
    const source = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/learn/page.tsx'),
      'utf8',
    )
    expect(source).not.toContain("'install-eve-agent'")
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
