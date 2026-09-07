import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FEATURED_LEARN_SLUGS } from '@/app/(main)/learn/page'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import { getDocsPage } from '@/lib/docs-content'
import { getLearnPage, listLearnPages } from '@/lib/learn-content'

const INSTALL_HREF = '/learn/install-eve-agent'
const NPX_COMMAND = 'npx '

const renderInlineMarkdown = (markdown: string): string =>
  renderToStaticMarkup(createElement(LearnInlineMarkdown, null, markdown))

describe('learn page: install-eve-agent', () => {
  const page = getLearnPage('install-eve-agent')

  it('matches the locked title, date, summary, and slug', () => {
    expect(page).not.toBeNull()
    expect(page?.slug).toBe('install-eve-agent')
    expect(page?.title).toBe('Install an Eve agent')
    expect(page?.shortTitle).toBe('Install an Eve agent')
    expect(page?.dateModified).toBe('2026-09-06')
    expect(page?.description).toBe(
      'Pick the right install for where the Eve agent came from: scaffold a new app, copy a catalog agent into an existing app, or create a standalone directory.',
    )
    expect(page?.summary).toBe(
      'Installing an Eve agent depends on where the agent came from and where the files should land. `eve init` scaffolds a new Eve app when you do not have one yet. Catalog installs from evex or agentcn copy into an existing Eve app. bergside/awesome-eve-agents creates a standalone agent directory.',
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
      '24 or newer',
      'Start from the source, then pick the install that matches that destination.',
      'Those commands are not interchangeable with each other, with a hand-written `agent/` tree, or with `eve init`',
      'Agent files for that path are listed on [/agents](/agents).',
      'When you still need an Eve app, the official scaffold creates one:',
      'Use this when you have no Eve app yet.',
      '[/agents](/agents)',
      '[Installation](/docs/installation)',
      '[evex and agentcn comparison](/learn/evex-vs-agentcn)',
      '[eveagents.dev](https://www.eveagents.dev)',
      '[Eve getting started](https://eve.dev/docs/getting-started)',
      'https://www.agentcn.run/docs/installation',
      'https://www.agentcn.run/docs/agents/eve/deep-search',
      'https://github.com/bergside/awesome-eve-agents',
      'https://eve.dev/docs/getting-started',
    ]) {
      expect(text).toContain(value)
    }
    expect(text).not.toContain('@evex/{slug}')
    expect(text).not.toContain('/learn/eve-agent-registry')
    expect(text).not.toContain('open catalog')
    expect(text).not.toContain('not the Eve runtime')
    expect(text).not.toContain('npx eve@latest init .')
    expect(text).not.toContain('GitHub stars')
    expect(text).not.toContain('—')
    expect(page.description).not.toContain('—')
    expect(page.summary).not.toContain('—')
    expect(page.sections[3]?.body).toHaveLength(3)
  })

  it('matches the four locked decision rows, examples, and four FAQs', () => {
    expect(page?.decisionRows).toEqual([
      {
        choice: 'Scaffold a new Eve app',
        useWhen: 'You do not have an Eve app yet.',
        avoidWhen:
          'You already have an Eve app, or you are installing a catalog agent into an existing app.',
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
          'You want a standalone agent directory, or you still need to scaffold the app.',
      },
      {
        choice: 'Install from bergside/awesome-eve-agents',
        useWhen: 'You want the agent as its own standalone directory.',
        avoidWhen:
          'You want the agent copied into an Eve app you already have.',
      },
    ])
    expect(page?.examples).toEqual([
      {
        label: 'An evex agent in an existing Eve app',
        body: 'You already have an Eve app and chose an agent on [/agents](/agents). From the app root, run `npx shadcn@latest add @evex/<slug>`. The agent source is copied under `agent/` in that app.',
      },
      {
        label: 'A bergside agent as a standalone directory',
        body: 'You chose an agent from [eveagents.dev](https://www.eveagents.dev) and want its own directory. Run `npx @bergside/eveagents install <slug>`, move into the new directory with `cd <slug>`, then start Eve with `npx eve@latest`.',
      },
    ])
    expect(page?.faqs).toHaveLength(4)
    expect(page?.faqs.map((faq) => faq.question)).toEqual([
      'Is eve init the only way to install an Eve agent?',
      "Why aren't the install commands interchangeable?",
      'What lands where?',
      'Where is the source listed?',
    ])
    expect(page?.faqs[0]?.answer).toBe(
      'No. `eve init` scaffolds a new Eve app when you do not have one. Catalog installs from evex or agentcn copy into an existing app. bergside creates a standalone agent directory. Match the command to the source and where the files should land.',
    )
    expect(page?.faqs[1]?.answer).toBe(
      'The `@evex` and `@agentcn` commands copy registry entries into an existing app. The bergside CLI creates a standalone directory. `eve init` creates an Eve app. Scaffold, catalog-into-app, and standalone are different jobs.',
    )
    expect(page?.faqs[2]?.answer).toBe(
      'evex writes the selected agent under `agent/`. agentcn writes its recipe into the existing app. bergside creates a new directory with the whole agent. `eve init` creates the app itself.',
    )
    expect(page?.faqs[3]?.answer).toBe(
      'evex publishes agent files on [/agents](/agents). agentcn documents each recipe in its own docs, for example [Deep Search](https://www.agentcn.run/docs/agents/eve/deep-search); our [comparison](/learn/evex-vs-agentcn) covers how the two registries differ. bergside lists its agents at [eveagents.dev](https://www.eveagents.dev).',
    )

    for (const row of page?.decisionRows ?? []) {
      for (const value of [row.choice, row.useWhen, row.avoidWhen]) {
        expect(value).not.toContain('`')
        expect(value).not.toContain(NPX_COMMAND)
      }
    }
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
      '/docs/installation',
      '/learn/evex-vs-agentcn',
      'https://www.eveagents.dev',
      'https://eve.dev/docs/getting-started',
      'https://www.agentcn.run/docs/installation',
      'https://www.agentcn.run/docs/agents/eve/deep-search',
      'https://github.com/bergside/awesome-eve-agents',
    ]) {
      expect(html).toContain(`href="${href}"`)
    }

    const faqHtml = (page.faqs ?? [])
      .map((faq) => renderInlineMarkdown(faq.answer))
      .join('')
    expect(faqHtml).toContain('href="/learn/evex-vs-agentcn"')
    expect(faqHtml).toContain(
      'href="https://www.agentcn.run/docs/agents/eve/deep-search"',
    )
    expect(faqHtml).toContain('href="https://www.eveagents.dev"')

    const exampleHtml = (page.examples ?? [])
      .map((example) => renderInlineMarkdown(example.body))
      .join('')
    expect(exampleHtml).toContain('href="/agents"')
    expect(exampleHtml).toContain('href="https://www.eveagents.dev"')
  })

  it('is featured as the first /learn index card', () => {
    const source = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/learn/page.tsx'),
      'utf8',
    )

    expect(FEATURED_LEARN_SLUGS.indexOf('install-eve-agent')).toBe(0)
    expect(source).toContain("'install-eve-agent'")
    expect(source).not.toContain("'eve-agent-registry'")
    expect(source).toContain(
      'The install command depends on which catalog the agent came from.',
    )
  })
})

describe('in-body links to /learn/install-eve-agent', () => {
  it('adds a crawlable install link on /docs Where to go next', () => {
    const docs = getDocsPage('introduction')
    expect(docs).not.toBeNull()
    if (!docs) {
      return
    }

    expect(docs.dateModified).toBe('2026-09-07')
    expect(docs.title).toBe('Open-source AI agent registry: install as source')

    const nextSection = docs.sections.find(
      (section) => section.heading === 'Where to go next',
    )
    expect(nextSection?.body).toContain(
      'Install walkthrough: [Install an Eve agent](/learn/install-eve-agent).',
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

    expect(docs.dateModified).toBe('2026-09-05')

    const installSection = docs.sections.find(
      (section) => section.heading === 'Run the install command',
    )
    expect(installSection?.body).toContain(
      'How to install: [Install an Eve agent](/learn/install-eve-agent).',
    )
    expect(installSection?.body.join('\n')).not.toContain(
      '/learn/evex-vs-agentcn',
    )

    const html = (installSection?.body ?? [])
      .map((paragraph) => renderInlineMarkdown(paragraph))
      .join('')

    expect(html).toContain(`href="${INSTALL_HREF}">Install an Eve agent</a>`)
    expect(html).not.toContain('href="/learn/evex-vs-agentcn"')
    expect(html).not.toContain(`[Install an Eve agent](${INSTALL_HREF})`)
  })

  it('adds a crawlable install link on the shared agent detail template', () => {
    const source = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/agents/[slug]/page.tsx'),
      'utf8',
    )
    const stickySource = readFileSync(
      path.join(import.meta.dirname, '../components/sticky-install-cta.tsx'),
      'utf8',
    )
    const installCommandSource = readFileSync(
      path.join(import.meta.dirname, '../components/install-command.tsx'),
      'utf8',
    )
    const learnLine =
      'Full install guide: [Install an Eve agent](/learn/install-eve-agent).'

    expect(source).toContain('LearnInlineMarkdown')
    expect(source).toContain(learnLine)
    expect(source).not.toContain('/learn/evex-vs-agentcn')
    expect(stickySource).not.toContain(learnLine)
    expect(installCommandSource).not.toContain(learnLine)

    const html = renderInlineMarkdown(learnLine)
    expect(html).toContain(`href="${INSTALL_HREF}">Install an Eve agent</a>`)
    expect(html).not.toContain(`[Install an Eve agent](${INSTALL_HREF})`)
  })

  it('is listed by listLearnPages for sitemap and llms twins', () => {
    const slugs = listLearnPages().map((entry) => entry.slug)
    expect(slugs).toContain('install-eve-agent')
    expect(slugs).not.toContain('eve-agent-registry')
    expect(slugs).toContain('agent-registry')
  })
})
