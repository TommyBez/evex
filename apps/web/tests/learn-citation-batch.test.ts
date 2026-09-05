import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import {
  getLearnPage,
  type LearnPage,
  listLearnPages,
} from '@/lib/learn-content'

const CITATION_SLUGS = [
  'mcp-server-for-ai-agents',
  'agentic-workflows',
  'ai-agent-frameworks',
  'ai-agent-tools',
  'mcp-vs-skills',
  'agent-registry',
  'shadcn-registry-for-agents',
] as const

const EXCLUDED_SLUGS = [
  'install-eve-agent',
  'evex-vs-agentcn',
  'langgraph-vs-crewai',
] as const

const AUTOGEN_HREF = 'https://microsoft.github.io/autogen/stable//index.html'
const MCP_INTRO_HREF = 'https://modelcontextprotocol.io/introduction'
const MCP_ARCHITECTURE_HREF =
  'https://modelcontextprotocol.io/docs/concepts/architecture'
const LANGGRAPH_HREF = 'https://docs.langchain.com/oss/python/langgraph/'
const CREWAI_HREF = 'https://docs.crewai.com/en/introduction'
const EVE_GETTING_STARTED_HREF = 'https://eve.dev/docs/getting-started'
const EVE_CONNECTIONS_HREF = 'https://eve.dev/docs/connections'
const EVE_TOOLS_HREF = 'https://eve.dev/docs/tools'
const EVE_SKILLS_HREF = 'https://eve.dev/docs/skills'
const SHADCN_REGISTRY_HREF = 'https://ui.shadcn.com/docs/registry'
const AS_OF_STAMP = /as of/i
const CHECKED_DATE_STAMP = /checked \d/i
const AGENT_FRAMEWORK_ALT =
  /microsoft agent framework|azure\.github\.io\/agent-framework|dev\.azure\.com\/.*agent.framework/i
const INSTALL_COMMAND = /npx shadcn@latest add/

const renderInlineMarkdown = (markdown: string): string =>
  renderToStaticMarkup(createElement(LearnInlineMarkdown, null, markdown))

function requireLearnPage(slug: string): LearnPage {
  const page = getLearnPage(slug)
  expect(page).not.toBeNull()
  if (!page) {
    throw new Error(`Missing learn page: ${slug}`)
  }
  return page
}

function flattenPageText(page: LearnPage): string {
  return [
    page.title,
    page.shortTitle,
    page.description,
    page.summary,
    page.sections
      .flatMap((section) => [
        section.heading,
        ...section.body,
        ...(section.bullets ?? []),
      ])
      .join('\n'),
    page.decisionRows
      .flatMap((row) => [row.choice, row.useWhen, row.avoidWhen])
      .join('\n'),
    page.examples.map((example) => example.body).join('\n'),
    page.faqs.flatMap((faq) => [faq.question, faq.answer]).join('\n'),
    page.comparisonBottomLine ?? '',
    page.comparisonRows
      ?.flatMap((row) => [row.criterion, row.left, row.right])
      .join('\n') ?? '',
  ].join('\n')
}

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

describe('learn citation batch', () => {
  it('stamps dateModified 2026-09-05 on the seven citation pages only', () => {
    for (const slug of CITATION_SLUGS) {
      const page = requireLearnPage(slug)
      expect(page.dateModified).toBe('2026-09-05')
    }

    expect(requireLearnPage('install-eve-agent').dateModified).toBe(
      '2026-09-04',
    )
    expect(requireLearnPage('evex-vs-agentcn').dateModified).toBe('2026-09-04')
    expect(requireLearnPage('langgraph-vs-crewai').dateModified).toBe(
      '2026-09-05',
    )
  })

  it('keeps locked titles, H1s, and section order', () => {
    expect(requireLearnPage('mcp-server-for-ai-agents')).toMatchObject({
      title: 'MCP server for AI agents: what it gives you and what it does not',
      shortTitle: 'MCP server for AI agents',
    })
    expect(
      requireLearnPage('mcp-server-for-ai-agents').sections.map(
        (section) => section.heading,
      ),
    ).toEqual([
      'MCP solves integration sprawl',
      'What an MCP server actually exposes',
      'Keep access separate from agent behavior',
      'The risk is assuming protocol equals policy',
      'How to evaluate an MCP server before using it',
    ])

    expect(requireLearnPage('agentic-workflows')).toMatchObject({
      title: 'Agentic workflows: when software should decide the next step',
      shortTitle: 'Agentic workflows',
    })
    expect(
      requireLearnPage('agentic-workflows').sections.map(
        (section) => section.heading,
      ),
    ).toEqual([
      'Do not make everything agentic',
      'Use agents for ambiguity',
      'Hybrid workflows are the default',
      'Design for the second run',
    ])

    expect(requireLearnPage('ai-agent-frameworks')).toMatchObject({
      title: 'AI agent frameworks: the practical checklist before you choose',
      shortTitle: 'AI agent frameworks',
    })
    expect(
      requireLearnPage('ai-agent-frameworks').sections.map(
        (section) => section.heading,
      ),
    ).toEqual([
      'Start with the job the agent must survive',
      'The seven checks that actually matter',
      'Where the popular options tend to fit',
      'Use the failure-path prototype',
      'When distribution is part of the decision',
    ])

    expect(requireLearnPage('ai-agent-tools')).toMatchObject({
      title: 'AI agent tools: the safe way to give models actions',
      shortTitle: 'AI agent tools',
    })
    expect(
      requireLearnPage('ai-agent-tools').sections.map(
        (section) => section.heading,
      ),
    ).toEqual([
      'A tool is not just a helper function',
      'Narrow tools beat clever tools',
      'Give every tool a reviewable file',
      'What to include in a tool contract',
    ])

    expect(requireLearnPage('mcp-vs-skills')).toMatchObject({
      title: 'MCP vs skills: do you need a connection or a playbook?',
      shortTitle: 'MCP vs skills',
    })
    expect(
      requireLearnPage('mcp-vs-skills').sections.map(
        (section) => section.heading,
      ),
    ).toEqual([
      'The common confusion',
      'MCP is an interface to capabilities',
      'Skills are playbooks',
      'Use both when capability needs a method',
    ])

    expect(requireLearnPage('agent-registry')).toMatchObject({
      title: 'Agent registry: discovery without trust is just a list',
      shortTitle: 'Agent registry',
    })
    expect(
      requireLearnPage('agent-registry').sections.map(
        (section) => section.heading,
      ),
    ).toEqual([
      'The registry problem is trust',
      'Registry, catalog, marketplace',
      'What a registry item needs',
      'Why source ownership matters',
    ])

    expect(requireLearnPage('shadcn-registry-for-agents')).toMatchObject({
      title: 'Shadcn registry for agents: installing workflows as source files',
      shortTitle: 'Shadcn registry for agents',
    })
    expect(
      requireLearnPage('shadcn-registry-for-agents').sections.map(
        (section) => section.heading,
      ),
    ).toEqual([
      'A reusable agent is not just a dependency',
      'What the registry must show before install',
      'Why it pairs well with Eve',
      'When not to use a registry item',
    ])
  })

  it('does not restore eve-agent-registry or add As-of / checked stamps', () => {
    expect(getLearnPage('eve-agent-registry')).toBeNull()
    expect(
      listLearnPages().some((page) => page.slug === 'eve-agent-registry'),
    ).toBe(false)

    for (const slug of CITATION_SLUGS) {
      const text = flattenPageText(requireLearnPage(slug))
      expect(text).not.toMatch(AS_OF_STAMP)
      expect(text).not.toMatch(CHECKED_DATE_STAMP)
      expect(text).not.toContain('/learn/eve-agent-registry')
    }
  })

  it('does not add install commands or Microsoft Agent Framework alts', () => {
    for (const slug of CITATION_SLUGS) {
      const text = flattenPageText(requireLearnPage(slug))
      expect(text).not.toMatch(INSTALL_COMMAND)
      expect(text).not.toContain('@evex/{slug}')
      expect(text).not.toMatch(AGENT_FRAMEWORK_ALT)
    }
  })

  it('leaves the excluded learn pages untouched', () => {
    const install = requireLearnPage('install-eve-agent')
    expect(install.title).toBe('Install an Eve agent')
    expect(install.summary).toBe(
      'The install command depends on the source. evex and agentcn copy an agent into an existing Eve app. bergside/awesome-eve-agents creates a standalone agent directory.',
    )
    expect(install.examples[0]?.body).toBe(
      'You already have an Eve app and chose an agent on /agents. Read its source, then run `npx shadcn@latest add @evex/<slug>` from the app root. The agent source is copied under `agent/` in that app.',
    )

    const comparison = requireLearnPage('evex-vs-agentcn')
    expect(comparison.title).toBe('Eve agent registries: evex vs agentcn')
    expect(comparison.comparisonRows?.[3]?.right).toContain(
      'checked 4 Sep 2026',
    )

    const langgraph = requireLearnPage('langgraph-vs-crewai')
    expect(langgraph.title).toBe(
      'LangGraph vs CrewAI: graph control or role-based crews?',
    )
    expect(langgraph.sections[0]?.body[0]).toContain(
      `[LangGraph](${LANGGRAPH_HREF})`,
    )

    expect(EXCLUDED_SLUGS).toHaveLength(3)
  })
})

describe('learn page: mcp-server-for-ai-agents citations', () => {
  const page = getLearnPage('mcp-server-for-ai-agents')

  it('locks the cited lede, protocol primitives, and FAQ answers', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.summary).toBe(
      'An [MCP server](https://modelcontextprotocol.io/introduction) gives agents a standard way to discover and call external capabilities. It does not decide policy for you. The server exposes tools and context; the agent still needs clear instructions, permissions, logging, and workflow boundaries. Treat MCP as the integration layer, not the whole agent architecture.',
    )
    expect(page.sections[0]?.body[1]).toBe(
      'An MCP server gives those capabilities a standard shape. The host or client discovers [tools, resources, and prompts](https://modelcontextprotocol.io/docs/concepts/architecture) through MCP, then presents the usable actions or context to the model in the format that runtime expects.',
    )
    expect(page.sections[1]?.body[0]).toBe(
      'The useful split matches the protocol primitives. Tools perform actions, such as listing issues or running a read-only query. Resources provide context, such as files, schemas, or documentation. Prompts provide reusable interaction templates.',
    )
    expect(page.sections[2]?.body[0]).toBe(
      'In an Eve project, MCP access usually belongs near [connections](https://eve.dev/docs/connections) or narrow tools, while agent behavior stays in instructions, skills, and application code. That keeps external capability separate from the policy that decides when to use it.',
    )
    expect(page.sections[3]?.body[0]).toBe(
      'MCP standardizes how capabilities are exposed. The protocol does not dictate how applications use LLMs or manage context. It does not decide whether the agent should call a tool, whether a user is authorized, whether a result can be trusted, or whether a write needs approval.',
    )
    expect(page.faqs).toEqual([
      {
        question: 'Is MCP only for tools?',
        answer:
          'MCP can expose tools, resources, and prompts. Tools are the most visible part because they let agents act.',
      },
      {
        question: 'Does MCP make tool use safe?',
        answer:
          'MCP gives tools a standard interface. Safety still depends on scopes, validation, approvals, and logging.',
      },
      {
        question: 'When should I build an MCP server?',
        answer:
          'Build one when the same integration should be reused across agents, clients, or teams.',
      },
    ])
  })

  it('renders MCP and Eve citations as crawlable anchors', () => {
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
      MCP_INTRO_HREF,
      MCP_ARCHITECTURE_HREF,
      EVE_CONNECTIONS_HREF,
    ]) {
      expect(html).toContain(`href="${href}"`)
    }
  })
})

describe('learn page: agentic-workflows citations', () => {
  const page = getLearnPage('agentic-workflows')

  it('locks the judgment, Eve, and FAQ strings', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.sections[0]?.body[0]).toBe(
      'A workflow becomes agentic when the model observes state, chooses an action, sees the result, and decides what to do next. That flexibility helps triage, research, code review, support, and messy operational work.',
    )
    expect(page.sections[2]?.body[1]).toBe(
      'Eve fits this pattern because [channels, schedules, tools, skills, and durable sessions](https://eve.dev/docs/getting-started) can sit around model judgment instead of replacing application structure.',
    )
    expect(page.faqs).toEqual([
      {
        question: 'Are agentic workflows the same as automations?',
        answer:
          'Automations follow predefined steps. Agentic workflows let the model choose some steps based on context.',
      },
      {
        question: 'Where do tools fit?',
        answer:
          'Tools are the bounded actions an agentic workflow can request. They should stay narrow and observable.',
      },
      {
        question: 'What is the first thing to test?',
        answer:
          'Test the failure path: bad input, missing context, duplicate trigger, and rejected approval.',
      },
    ])

    const html = renderInlineMarkdown(page.sections[2]?.body[1] ?? '')
    expect(html).toContain(`href="${EVE_GETTING_STARTED_HREF}"`)
  })
})

describe('learn page: ai-agent-frameworks citations', () => {
  const page = getLearnPage('ai-agent-frameworks')

  it('links preferred live docs and leaves Mastra unlinked', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    const fit = page.sections.find(
      (section) => section.heading === 'Where the popular options tend to fit',
    )
    expect(fit?.body).toEqual([
      '[LangGraph](https://docs.langchain.com/oss/python/langgraph/) is strongest when explicit workflow state is the center of the problem. If you need branches, loops, retries, and human interruptions that are easy to reason about, graph structure helps. The tradeoff is that simple workflows can feel heavy when forced into graph terms.',
      '[CrewAI](https://docs.crewai.com/en/introduction) is strongest when the work naturally maps to roles: researcher, analyst, writer, reviewer. It can be fast for prototypes and internal workflows where role collaboration is the clearest way to describe the task. CrewAI also has flow-style orchestration, but if exact state recovery and side-effect boundaries are the main concern, compare those flow primitives directly against graph-first options.',
      '[AutoGen](https://microsoft.github.io/autogen/stable//index.html)-style systems are strongest when the work is conversational collaboration between agents, especially code or research loops where one agent proposes and another critiques. The risk is that long conversations can hide control flow unless you add strong stop conditions and tracing.',
      '[Eve](https://eve.dev/docs/getting-started) is strongest when the agent should be a TypeScript backend project with inspectable files: instructions, tools, skills, channels, schedules, and env requirements. That makes it a better fit for source-owned agents distributed through a registry than for every possible orchestration problem.',
    ])

    const distribution = page.sections.find(
      (section) =>
        section.heading === 'When distribution is part of the decision',
    )
    expect(distribution?.body[1]).toBe(
      'That is where evex is relevant. It does not make Eve the best framework for every workflow. It makes Eve’s source-owned file model easier to discover, preview, and install when that model is the right fit. Browse [/agents](/agents).',
    )

    const text = flattenPageText(page)
    expect(countOccurrences(text, `[AutoGen](${AUTOGEN_HREF})`)).toBe(1)
    expect(text).toContain('Eve, Mastra, and vendor SDKs')
    expect(text).not.toContain('[Mastra]')
    expect(text).not.toMatch(AGENT_FRAMEWORK_ALT)
    expect(page.faqs[0]?.answer).toBe(
      'Start with state, tools, approvals, deployment, observability, evals, and source ownership. There is no universal best.',
    )
    expect(page.faqs[1]?.answer).toBe(
      'Language matters because your team has to maintain the agent, but it should not override runtime fit, recovery, and tool safety.',
    )
    expect(page.faqs[2]?.answer).toBe(
      'Build one failure-path prototype in each candidate framework. Include a tool error, a duplicate event, and one user-visible output.',
    )

    const html = (fit?.body ?? []).map(renderInlineMarkdown).join('')
    for (const href of [
      LANGGRAPH_HREF,
      CREWAI_HREF,
      AUTOGEN_HREF,
      EVE_GETTING_STARTED_HREF,
    ]) {
      expect(html).toContain(`href="${href}"`)
    }
    expect(html).not.toContain('Mastra')
    expect(renderInlineMarkdown(distribution?.body[1] ?? '')).toContain(
      'href="/agents"',
    )
  })
})

describe('learn page: ai-agent-tools citations', () => {
  const page = getLearnPage('ai-agent-tools')

  it('cites Eve tools docs and keeps FAQ answers', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.sections[2]?.body[0]).toBe(
      'Eve tools live in `agent/tools/` ([Tools](https://eve.dev/docs/tools)), so every callable action has a file. That layout makes review concrete: what can the model ask the system to do, and where is that behavior implemented?',
    )
    expect(page.faqs).toEqual([
      {
        question: 'Should tools be tiny?',
        answer:
          'They should be narrow, not necessarily tiny. A tool can do several deterministic steps if the model should not decide between them.',
      },
      {
        question: 'Where should validation happen?',
        answer:
          'Validate at the tool boundary with schemas and runtime checks. Do not rely on prompt instructions alone.',
      },
      {
        question: 'Should a tool return prose or data?',
        answer:
          'Return structured data when the agent will reason over it. Use prose only when the output is meant for a human.',
      },
    ])
    expect(renderInlineMarkdown(page.sections[2]?.body[0] ?? '')).toContain(
      `href="${EVE_TOOLS_HREF}"`,
    )
  })
})

describe('learn page: mcp-vs-skills citations', () => {
  const page = getLearnPage('mcp-vs-skills')

  it('locks the cited lede, protocol/skill opens, and FAQ answers', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.summary).toBe(
      '[MCP](https://modelcontextprotocol.io/introduction) gives an AI application a standard way to reach external systems. Skills, in Eve and Agent Skills–style runtimes, give an agent a reusable playbook for a task. They often work together, but they are not substitutes. The clean design is usually MCP for access, skills for judgment.',
    )
    expect(page.sections[1]?.body[0]).toBe(
      'An MCP server exposes tools, resources, and prompts through a standard protocol ([architecture](https://modelcontextprotocol.io/docs/concepts/architecture)). The client can discover what is available and call into those capabilities without each agent inventing a custom integration.',
    )
    expect(page.sections[2]?.body[0]).toBe(
      'A skill is a playbook ([Eve skills](https://eve.dev/docs/skills)): a model-loadable procedure that improves how the agent works. It tells the agent what to check, what to avoid, what output shape to use, what examples matter. Loading a skill adds instructions; it does not grant a new execution surface.',
    )
    expect(page.faqs).toEqual([
      {
        question: 'Can a skill call an MCP tool?',
        answer:
          'A skill can tell the agent when and how to use the tool. The runtime still performs the actual tool call.',
      },
      {
        question: 'Can MCP replace skills?',
        answer:
          'MCP can expose prompts, but skills remain useful for local, portable procedure and examples.',
      },
      {
        question: 'Which is safer?',
        answer:
          'Safety comes from scopes, validation, approvals, and logs - not from choosing MCP or skills alone.',
      },
    ])

    const html = [
      page.summary,
      page.sections[1]?.body[0],
      page.sections[2]?.body[0],
    ]
      .filter((value): value is string => Boolean(value))
      .map(renderInlineMarkdown)
      .join('')
    for (const href of [
      MCP_INTRO_HREF,
      MCP_ARCHITECTURE_HREF,
      EVE_SKILLS_HREF,
    ]) {
      expect(html).toContain(`href="${href}"`)
    }
  })
})

describe('learn page: agent-registry citations', () => {
  const page = getLearnPage('agent-registry')

  it('locks the evex example and marketplace FAQ without a new install command', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.examples[0]).toEqual({
      label: 'evex-style registry',
      body: 'An agent page on [/agents](/agents) shows files, dependencies, author, and install command. Agents enter through a reviewed pull request ([Publishing](/docs/publishing)).',
    })
    expect(page.faqs).toEqual([
      {
        question: 'What makes an agent registry trustworthy?',
        answer:
          'Transparent files, clear ownership, dependency disclosure, review history, and install previews.',
      },
      {
        question: 'Should a registry store runtime state?',
        answer:
          'It can store metrics and favorites, but canonical source metadata should stay close to the files being installed.',
      },
      {
        question: 'Is evex an agent marketplace?',
        answer:
          'evex is a community registry for reusable Eve agent configurations. Commerce, paid tiers, and vendor storefronts are a different product shape.',
      },
    ])

    const html = renderInlineMarkdown(page.examples[0]?.body ?? '')
    expect(html).toContain('href="/agents"')
    expect(html).toContain('href="/docs/publishing"')
    expect(flattenPageText(page)).not.toMatch(INSTALL_COMMAND)
  })
})

describe('learn page: shadcn-registry-for-agents citations', () => {
  const page = getLearnPage('shadcn-registry-for-agents')

  it('locks the shadcn registry lede, Eve pairing, and FAQ answers', () => {
    expect(page).not.toBeNull()
    if (!page) {
      return
    }

    expect(page.summary).toBe(
      'The [shadcn registry](https://ui.shadcn.com/docs/registry) model fits agents because many agent workflows are source bundles: instructions, tools, skills, env examples, evals, and integration files that users need to inspect and adapt. For agents, owning the installed files is often the point.',
    )
    expect(page.sections[0]?.body[1]).toBe(
      'A registry item can install editable files directly into the project with the shadcn CLI. The user owns the result and can change it before running the agent.',
    )
    expect(page.sections[2]?.body[0]).toBe(
      'Eve already organizes agents as files under `agent/` ([Getting started](https://eve.dev/docs/getting-started)). A shadcn registry item can place those files into the expected locations, while the user keeps ownership of the result ([Installation](/docs/installation)).',
    )
    expect(page.sections[2]?.body[1]).toBe(
      'The registry installs the agent files users need to review: instructions, tools, skills, channels, env examples, and evals.',
    )
    expect(page.faqs).toEqual([
      {
        question: 'Why not publish every agent as an npm package?',
        answer:
          'Users often need to inspect and change prompts, tools, schedules, and channel behavior. A registry item installs those files as source.',
      },
      {
        question: 'What makes a registry item good?',
        answer:
          'A clear job, explicit target paths, dependency declarations, setup docs, and files that belong together.',
      },
      {
        question: 'Is customization expected?',
        answer:
          'Yes. The registry gives users a reviewed starting point they can adapt, not a permanent black box.',
      },
    ])

    const html = [page.summary, page.sections[2]?.body[0] ?? '']
      .map(renderInlineMarkdown)
      .join('')
    expect(html).toContain(`href="${SHADCN_REGISTRY_HREF}"`)
    expect(html).toContain(`href="${EVE_GETTING_STARTED_HREF}"`)
    expect(html).toContain('href="/docs/installation"')
    expect(flattenPageText(page)).not.toMatch(INSTALL_COMMAND)
  })
})
