import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  LearnInlineMarkdown,
  looksLikeBlockMarkdown,
} from '@/components/learn-inline-markdown'
import { getDocsPage } from '@/lib/docs-content'
import { getLearnPage, getRelatedLearnPages } from '@/lib/learn-content'
import { buildLearnPageMarkdown } from '@/lib/markdown-content'

const WORD_SPLIT = /\s+/
const EVE_ADD_OUTSIDE_BACKTICKS = /(?:^|[^`])eve add(?:$|[^`])/m
const EVE_ADD_CONTIGUOUS = /eve add/
const NUMBERED_STEP_PREFIX = /^\d+\.\s/
const DEEP_SEARCH_HREF = 'https://www.agentcn.run/docs/agents/eve/deep-search'
const CONTRIBUTING_HREF =
  'https://github.com/shadcn-labs/agentcn/blob/main/CONTRIBUTING.md'
const LANGGRAPH_HREF = 'https://docs.langchain.com/oss/python/langgraph/'
const CREWAI_HREF = 'https://docs.crewai.com/en/introduction'
const LANGGRAPH_CHECKPOINTER_HREF =
  'https://docs.langchain.com/oss/python/langgraph/checkpointers'
const LANGGRAPH_INTERRUPT_HREF =
  'https://docs.langchain.com/oss/python/langgraph/interrupts'
const EVE_GETTING_STARTED_HREF = 'https://eve.dev/docs/getting-started'
const MARKDOWN_LINK = /\[[^\]]+\]\([^)]+\)/g
const AS_OF_STAMP = /as of/i
const CHECKED_DATE_STAMP = /checked \d/i

const renderInlineMarkdown = (markdown: string): string =>
  renderToStaticMarkup(createElement(LearnInlineMarkdown, null, markdown))

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) {
    return 0
  }
  let count = 0
  let from = 0
  while (from <= haystack.length) {
    const index = haystack.indexOf(needle, from)
    if (index === -1) {
      return count
    }
    count += 1
    from = index + needle.length
  }
  return count
}

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
    expect(page.dateModified).toBe('2026-09-04')
    expect(page.primaryKeyword).toBe('evex vs agentcn')
  })

  it('links the live catalog from the registry definition section', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const definition = page.sections.find(
      (section) => section.heading === 'What an Eve agent registry is',
    )
    expect(definition?.body).toEqual([
      'An Eve agent registry is a catalog of reusable agents Eve developers can inspect and install as source files. Instead of copying folders from GitHub by hand, you run a shadcn CLI command that writes the agent files into your project.',
      'evex is that kind of registry for Eve. Browse the catalog on [/agents](/agents), open an agent page, preview the files, then install with `npx shadcn@latest add @evex/<slug>` ([Installation](/docs/installation)). After install you own the files. There is no hosted agent runtime. See [/docs](/docs) for the product overview.',
    ])
  })

  it('locks the comparison table, closer, decision rows, examples, and FAQs', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.comparisonRows).toEqual([
      {
        criterion: 'Install',
        left: '`npx shadcn@latest add @evex/<slug>` ([Installation](/docs/installation))',
        right:
          'Same shadcn CLI. Live Eve example: `npx shadcn@latest add @agentcn/eve/deep-search` ([Deep Search](https://www.agentcn.run/docs/agents/eve/deep-search)).',
      },
      {
        criterion: 'Inspect files before install',
        left: 'Yes. Files, dependencies, author, and command on every agent page.',
        right:
          'Recipe docs: Composition file tree, Manual source, optional live preview that needs an API key. Not an inspect-files UI on the catalog listing.',
      },
      {
        criterion: 'Author identity',
        left: 'GitHub-verified author profiles',
        right:
          'Not surfaced as GitHub-verified author profiles on recipe pages.',
      },
      {
        criterion: 'Publish path',
        left: 'Reviewed pull request ([Publishing](/docs/publishing)).',
        right:
          'Fork and open a PR ([Contributing](https://github.com/shadcn-labs/agentcn/blob/main/CONTRIBUTING.md)). No first-party publishing docs on agentcn.run (checked 4 Sep 2026).',
      },
      {
        criterion: 'Catalog extras',
        left: 'Browse, search, leaderboard, favorites, publishing docs',
        right:
          '[Agents](https://www.agentcn.run/docs/agents) list and [Changelog](https://www.agentcn.run/docs/changelog). No leaderboard, favorites, or author pages in the public docs index.',
      },
      {
        criterion: 'After install',
        left: 'You own the files ([Installation](/docs/installation)). No runtime dependency on evex.',
        right:
          'You own the copied files ([Installation](https://www.agentcn.run/docs/installation)). Same class of write-to-disk outcome.',
      },
      {
        criterion: 'Hosted agent runtime',
        left: 'No',
        right: 'No',
      },
      {
        criterion: 'Price',
        left: 'Free, MIT',
        right:
          'Free. GitHub lists [MIT](https://github.com/shadcn-labs/agentcn). No paid tier on agentcn.run.',
      },
    ])
    expect(page.comparisonBottomLine).toBe(
      'If you want inspect-before-install and a PR-owned catalog, use evex. If you already live in agentcn, the install mechanic is the same class of tool. Star count is not a quality signal.',
    )
    expect(page.decisionRows).toEqual([
      {
        choice: 'evex',
        useWhen:
          'You want inspect-before-install, GitHub-verified authors, and a PR-owned Eve catalog with first-party publishing docs.',
        avoidWhen:
          'You need a multi-framework recipe catalog outside Eve and already standardize on agentcn.',
      },
      {
        choice: 'agentcn',
        useWhen:
          'You already live in agentcn or need its mixed-framework recipes with the same class of shadcn install.',
        avoidWhen:
          'Your decision gate is file preview on every catalog page plus a documented PR publish path for Eve-only agents.',
      },
      {
        choice: 'Copy-paste from GitHub',
        useWhen:
          'You are doing a one-off experiment and do not need a repeatable install command.',
        avoidWhen:
          'You want dependency prompts, a stable slug, and a page teammates can reinstall from.',
      },
    ])
    expect(page.examples).toEqual([
      {
        label: 'evex inspect-then-install',
        body: 'Open an agent page on [/agents](/agents), preview every file and dependency, confirm the GitHub-verified author, then run `npx shadcn@latest add @evex/<slug>` and own the files in your Eve project.',
      },
      {
        label: 'agentcn mixed-framework',
        body: 'Use agentcn when the recipe you need is already there across Eve or other frameworks it documents, accepting recipe-doc composition trees and optional live preview instead of an inspect-files catalog UI.',
      },
    ])
    expect(page.faqs).toEqual([
      {
        question: 'What is the difference between evex and agentcn?',
        answer:
          'Both are Eve-capable agent registries that install with the shadcn CLI. evex adds inspect-before-install on every agent page, GitHub-verified author profiles, and first-party publish-via-PR docs. agentcn emphasizes recipe docs, changelog, and mixed-framework recipes.',
      },
      {
        question: 'How do I install an agent from evex?',
        answer:
          'From your Eve project root, run `npx shadcn@latest add @evex/<slug>`. Preview files on the agent page first. Prerequisites and post-install steps are in Installation.',
      },
      {
        question: 'Is evex an agent marketplace?',
        answer:
          'evex is a community registry for reusable Eve agent source files. There is no commerce layer, paid tier, or hosted runtime.',
      },
      {
        question: 'How do I publish an agent to evex?',
        answer:
          'Open a reviewed pull request with the agent package. First-party steps are in Publishing. Canonical files stay in the repository.',
      },
      {
        question: 'Does evex run the agent after install?',
        answer:
          'Install writes source into your project. You own the files and run them in your Eve app. There is no runtime dependency on evex.',
      },
    ])
    expect(page.faqs.at(-1)?.question).toBe(
      'Does evex run the agent after install?',
    )

    const markdown = buildLearnPageMarkdown(page)
    expect(markdown).toContain('| Criterion | evex | agentcn |')
    expect(markdown).toContain('npx shadcn@latest add @evex/<slug>')
    expect(markdown).toContain('@evex/<slug>')
    expect(markdown).not.toContain('@evex/{slug}')
    // Explicit anti-pattern callout is required; do not publish eve CLI add as install.
    // Wording avoids the contiguous "eve add" substring so llms-full.txt (#58) stays clean.
    expect(markdown).toContain(
      'Use the shadcn `add` command above, not an `eve` CLI `add` subcommand',
    )
    expect(markdown).not.toMatch(EVE_ADD_OUTSIDE_BACKTICKS)
    expect(markdown).not.toMatch(EVE_ADD_CONTIGUOUS)
  })

  it('cites Deep Search, Publishing, and CONTRIBUTING on the locked surfaces only', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const comparisonText = (page.comparisonRows ?? [])
      .flatMap((row) => [row.left, row.right])
      .join('\n')
    const sectionText = page.sections
      .flatMap((section) => section.body)
      .join('\n')
    const faqText = page.faqs.map((faq) => faq.answer).join('\n')
    const pageText = [
      comparisonText,
      page.comparisonBottomLine,
      sectionText,
      faqText,
      page.examples.map((example) => example.body).join('\n'),
      page.summary,
      page.description,
    ].join('\n')

    expect(
      countOccurrences(pageText, `[Deep Search](${DEEP_SEARCH_HREF})`),
    ).toBe(1)
    expect(page.comparisonRows?.[0]?.right).toContain(
      `[Deep Search](${DEEP_SEARCH_HREF})`,
    )
    expect(sectionText).not.toContain('[Deep Search]')
    expect(faqText).not.toContain('[Deep Search]')

    expect(
      countOccurrences(comparisonText, '[Publishing](/docs/publishing)'),
    ).toBe(1)
    expect(page.comparisonRows?.[3]?.left).toBe(
      'Reviewed pull request ([Publishing](/docs/publishing)).',
    )
    expect(page.comparisonRows?.[4]?.left).toBe(
      'Browse, search, leaderboard, favorites, publishing docs',
    )
    expect(page.comparisonRows?.[4]?.left).not.toContain('](')

    const howAgents = page.sections.find(
      (section) => section.heading === 'How agents get into the catalog',
    )
    expect(howAgents?.body[0]).toContain('[/docs/publishing](/docs/publishing)')
    expect(
      countOccurrences(sectionText, '[/docs/publishing](/docs/publishing)'),
    ).toBe(1)
    expect(sectionText).not.toContain('[Publishing](/docs/publishing)')
    expect(faqText).not.toMatch(MARKDOWN_LINK)

    expect(page.comparisonRows?.[3]?.right).toContain(
      `[Contributing](${CONTRIBUTING_HREF})`,
    )
    expect(howAgents?.body[1]).toBe(
      'agentcn publishing, per its CONTRIBUTING.md, is also fork-and-open-a-PR. There are no first-party publishing docs on agentcn.run. Both paths can accept community work. evex makes the PR-owned path a first-class product surface with docs, author profiles, and CODEOWNERS.',
    )
    expect(howAgents?.body[1]).not.toContain('GitHub README')
    expect(howAgents?.body[1]).not.toContain('4 Sep 2026')
    expect(sectionText).not.toContain(CONTRIBUTING_HREF)

    expect(pageText).not.toContain('/learn/eve-agent-registry')
    expect(pageText).not.toContain('13 Aug 2026')
    expect(page.comparisonRows?.[3]?.right).toContain(
      'No first-party publishing docs on agentcn.run (checked 4 Sep 2026).',
    )
    expect(countOccurrences(pageText, '4 Sep 2026')).toBe(1)
  })

  it('keeps Same install mechanic dated without a Deep Search link', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const mechanic = page.sections.find(
      (section) =>
        section.heading === 'Same install mechanic, different product',
    )
    expect(mechanic?.body).toEqual([
      'evex and agentcn both install through the shadcn CLI. On evex the command is always `npx shadcn@latest add @evex/<slug>`. On agentcn, a live Eve example is `npx shadcn@latest add @agentcn/eve/deep-search`.',
      'The shared mechanic does not make the products identical. evex is built around browse, inspect, install, and publish for Eve agents. agentcn ships recipes across frameworks and leans on recipe docs plus optional live preview. Choose on inspectability and the publish path, not on which CLI wrapper looks familiar.',
    ])
    expect(mechanic?.body[0]).not.toContain('](')

    const inspect = page.sections.find(
      (section) => section.heading === 'Inspect before you install',
    )
    expect(inspect?.body[0]).toBe(
      'On every evex agent page you can preview files, dependencies, author identity, and the install command before you run anything ([/agents](/agents)). That inspect-before-install loop is the trust surface: you review what will land under `agent/` first.',
    )

    const whenToPick = page.sections.find(
      (section) => section.heading === 'When to pick which',
    )
    expect(whenToPick?.body[1]).toBe(
      'Stay with agentcn when you already live in that catalog or need its mixed-framework recipe set. The install mechanic is the same class of tool. Star count, install totals, and community-size bragging are not quality signals.',
    )
  })

  it('renders locked comparison citations as crawlable anchors', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const html = (page.comparisonRows ?? [])
      .flatMap((row) => [row.left, row.right])
      .map(renderInlineMarkdown)
      .join('')

    for (const href of [
      '/docs/installation',
      '/docs/publishing',
      DEEP_SEARCH_HREF,
      CONTRIBUTING_HREF,
      'https://www.agentcn.run/docs/agents',
      'https://www.agentcn.run/docs/changelog',
      'https://www.agentcn.run/docs/installation',
      'https://github.com/shadcn-labs/agentcn',
    ]) {
      expect(html).toContain(`href="${href}"`)
    }
    expect(html).not.toContain('href="/learn/eve-agent-registry"')

    const faqHtml = page.faqs
      .map((faq) => renderInlineMarkdown(faq.answer))
      .join('')
    expect(faqHtml).not.toContain('href="/docs/installation"')
    expect(faqHtml).not.toContain('href="/docs/publishing"')
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

  it('marks install steps as block markdown so the page can avoid p>ol nesting', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const installSection = page.sections.find(
      (section) => section.heading === 'How to install from evex',
    )
    expect(installSection).toBeDefined()
    expect(installSection?.body).toEqual([
      '1. Start from an Eve project root (create one with `npx eve@latest init` if needed). Eve requires Node.js 24 or newer ([Eve getting started](https://eve.dev/docs/getting-started)).',
      '2. Pick an agent on [/agents](/agents) and preview its files, dependencies, and author on the agent page.',
      '3. Run `npx shadcn@latest add @evex/<slug>` from the project root ([Installation](/docs/installation)). Example: `npx shadcn@latest add @evex/code-reviewer`.',
      '4. Own the written files: fill `.env.example` when present, read the installed README, and run evals under `evals/` before you trust the agent in production.',
      'Use the shadcn `add` command above, not an `eve` CLI `add` subcommand, and not a URL install as the command you publish or paste into docs.',
    ])
    const numberedSteps = (installSection?.body ?? []).filter((paragraph) =>
      NUMBERED_STEP_PREFIX.test(paragraph),
    )
    expect(numberedSteps.length).toBe(4)
    for (const step of numberedSteps) {
      expect(looksLikeBlockMarkdown(step)).toBe(true)
    }
  })
})

describe('learn page: langgraph vs crewai', () => {
  const page = getLearnPage('langgraph-vs-crewai')

  it('keeps the locked title, lede, summary, and section order', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.title).toBe(
      'LangGraph vs CrewAI: graph control or role-based crews?',
    )
    expect(page.shortTitle).toBe('LangGraph vs CrewAI')
    expect(page.description).toBe(
      'A builder-focused comparison of LangGraph and CrewAI, with Eve as a file-based reference point.',
    )
    expect(page.summary).toBe(
      'LangGraph and CrewAI start from different mental models. LangGraph makes workflow state and transitions explicit. CrewAI makes role-based collaboration quick to model. The right choice depends on which complexity your team needs to see first, not which framework has the longer feature list.',
    )
    expect(page.datePublished).toBe('2026-07-01')
    expect(page.dateModified).toBe('2026-09-05')
    expect(page.sections.map((section) => section.heading)).toEqual([
      'The real comparison is not popularity',
      'Where LangGraph is stronger',
      'Where CrewAI is stronger',
      'Where Eve differs',
      'How Eve agents get into a project',
      'How to decide without guessing',
    ])
  })

  it('locks the citation/voice section bodies and unchanged closer', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.sections).toEqual([
      {
        heading: 'The real comparison is not popularity',
        body: [
          'Both frameworks can build useful agents. The difference is how they ask you to think. [LangGraph](https://docs.langchain.com/oss/python/langgraph/) asks you to model a stateful graph. [CrewAI](https://docs.crewai.com/en/introduction) often starts with agents, roles, and tasks, while its Flows cover more structured orchestration.',
          'Those mental models lead to different debugging experiences. A graph helps when the failure is in routing. A crew helps when the work naturally decomposes into roles.',
          'When the workflow goes wrong, the useful question is which model helps your team find the problem faster: explicit state transitions, or role-shaped collaboration.',
        ],
      },
      {
        heading: 'Where LangGraph is stronger',
        body: [
          'LangGraph fits when the workflow needs explicit branching, loops, [checkpointed state](https://docs.langchain.com/oss/python/langgraph/checkpointers), and [human-in-the-loop](https://docs.langchain.com/oss/python/langgraph/interrupts) transitions. It also fits when you want to reason about the path a run took.',
          'The tradeoff is overhead. Simple workflows can feel verbose when forced into graph terms.',
          'A graph also creates useful pressure: drawing the states makes the workflow inspectable. That helps for regulated, high-stakes, or long-running processes where implicit model behavior is hard to audit.',
        ],
      },
      {
        heading: 'Where CrewAI is stronger',
        body: [
          'CrewAI fits fast prototypes and workflows that map to human-like roles: researcher, analyst, writer, reviewer. CrewAI also has Flow-style orchestration, but the common crew abstraction is easiest to explain when the work naturally decomposes into roles.',
          'The tradeoff appears when control flow gets complex. Role metaphors can hide state transitions that should be explicit.',
          'CrewAI can be the right choice when the team needs to test a multi-agent collaboration pattern quickly. The role-based crew abstraction becomes weaker when the workflow needs durable recovery, careful retries, or exact visibility into how state changes over time; those cases often need flow or graph structure.',
        ],
      },
      {
        heading: 'Where Eve differs',
        body: [
          'Eve is [filesystem-first](https://eve.dev/docs/getting-started). That makes it relevant when the agent is a backend project whose tools, skills, channels, schedules, and env requirements should be visible as files.',
          'This gives teams a third option in the comparison. If the main problem is control flow, reach for graph thinking. If the main problem is role collaboration, crew thinking may fit. If the main problem is inspectable, source-owned agent capability, Eve’s file model becomes more interesting.',
        ],
      },
      {
        heading: 'How Eve agents get into a project',
        body: [
          'Eve agents are files in an Eve app, not a hosted runtime. evex is the open registry for those agents. Open the [/agents](/agents) catalog, inspect the files, then install with `npx shadcn@latest add @evex/<slug>` ([Installation](/docs/installation)).',
          'If you want a first install to compare against a graph or a crew, start with the PR review agent: `npx shadcn@latest add @evex/code-reviewer`.',
        ],
      },
      {
        heading: 'How to decide without guessing',
        body: [
          'Build the same uncomfortable slice in both frameworks. Include one external tool, one bad input, one human decision, and one recovery path. Then read the implementation with a teammate who did not write it.',
          'If they can explain what happens next, what can fail, and where to make a change, the framework is serving the team. If they need a tour of hidden conventions, the framework may be working against the workflow.',
        ],
      },
    ])
  })

  it('keeps the decision table, examples, and FAQ answers locked', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.decisionRows).toEqual([
      {
        choice: 'LangGraph',
        useWhen:
          'State transitions, retries, and explicit routing are the main complexity.',
        avoidWhen:
          'The workflow is simple enough that graph structure adds more weight than clarity.',
      },
      {
        choice: 'CrewAI',
        useWhen:
          'The task maps naturally to roles and fast multi-agent collaboration.',
        avoidWhen:
          'The workflow needs precise state control and durable side-effect boundaries.',
      },
    ])
    expect(page.examples).toEqual([
      {
        label: 'LangGraph-shaped workflow',
        body: 'A claims workflow with branching escalation paths, retries, and approval states benefits from explicit graph control.',
      },
      {
        label: 'CrewAI-shaped workflow',
        body: 'A research pipeline with researcher, analyst, and writer roles can be faster to express as a crew.',
      },
    ])
    expect(page.faqs).toEqual([
      {
        question: 'Is LangGraph more production-ready than CrewAI?',
        answer:
          'It is often stronger for explicit state and control flow. CrewAI can still be useful when the role model fits the work.',
      },
      {
        question: 'Where does Eve fit in this comparison?',
        answer:
          'Eve is a different axis: file-owned backend agents rather than graph-first or role-first orchestration.',
      },
      {
        question: 'How should teams choose?',
        answer:
          'Build the hardest failure path in each candidate framework and compare which one is easier to debug.',
      },
      {
        question: 'How do I try an Eve agent after this comparison?',
        answer:
          'Install from evex with `npx shadcn@latest add @evex/<slug>` after you inspect the files on the agent page. The catalog is at /agents.',
      },
    ])
  })

  it('cites primary sources once and keeps angle-bracket slugs', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const sectionText = page.sections
      .flatMap((section) => section.body)
      .join('\n')
    const faqText = page.faqs.map((faq) => faq.answer).join('\n')
    const pageText = [
      sectionText,
      faqText,
      page.examples.map((example) => example.body).join('\n'),
      page.decisionRows
        .flatMap((row) => [row.choice, row.useWhen, row.avoidWhen])
        .join('\n'),
      page.summary,
      page.description,
    ].join('\n')

    expect(countOccurrences(pageText, `[LangGraph](${LANGGRAPH_HREF})`)).toBe(1)
    expect(countOccurrences(pageText, `[CrewAI](${CREWAI_HREF})`)).toBe(1)
    expect(
      countOccurrences(
        pageText,
        `[checkpointed state](${LANGGRAPH_CHECKPOINTER_HREF})`,
      ),
    ).toBe(1)
    expect(
      countOccurrences(
        pageText,
        `[human-in-the-loop](${LANGGRAPH_INTERRUPT_HREF})`,
      ),
    ).toBe(1)
    expect(
      countOccurrences(
        pageText,
        `[filesystem-first](${EVE_GETTING_STARTED_HREF})`,
      ),
    ).toBe(1)
    expect(countOccurrences(pageText, '[/agents](/agents)')).toBe(1)
    expect(
      countOccurrences(pageText, '[Installation](/docs/installation)'),
    ).toBe(1)

    expect(pageText).toContain('`npx shadcn@latest add @evex/<slug>`')
    expect(pageText).toContain('`npx shadcn@latest add @evex/code-reviewer`')
    expect(pageText).toContain('@evex/<slug>')
    expect(pageText).not.toContain('@evex/{slug}')
    expect(pageText).not.toContain('[Eve agents catalog](/agents)')
    expect(pageText).not.toContain(
      '[the PR review agent](/agents/code-reviewer)',
    )
    expect(pageText).not.toContain('/agents/code-reviewer')
    expect(pageText).not.toMatch(AS_OF_STAMP)
    expect(pageText).not.toMatch(CHECKED_DATE_STAMP)
    expect(faqText).not.toMatch(MARKDOWN_LINK)

    const markdown = buildLearnPageMarkdown(page)
    expect(markdown).toContain('npx shadcn@latest add @evex/<slug>')
    expect(markdown).toContain('@evex/<slug>')
    expect(markdown).not.toContain('@evex/{slug}')
  })

  it('renders locked citations as crawlable anchors', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const html = page.sections
      .flatMap((section) => section.body)
      .map(renderInlineMarkdown)
      .join('')

    for (const href of [
      LANGGRAPH_HREF,
      CREWAI_HREF,
      LANGGRAPH_CHECKPOINTER_HREF,
      LANGGRAPH_INTERRUPT_HREF,
      EVE_GETTING_STARTED_HREF,
      '/agents',
      '/docs/installation',
    ]) {
      expect(html).toContain(`href="${href}"`)
    }
    expect(html).not.toContain('href="/agents/code-reviewer"')

    const faqHtml = page.faqs
      .map((faq) => renderInlineMarkdown(faq.answer))
      .join('')
    expect(faqHtml).not.toContain('href="/agents"')
    expect(faqHtml).not.toContain('href="/docs/installation"')
  })
})
