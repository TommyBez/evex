import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import { getLearnPage, type LearnPage } from '@/lib/learn-content'

const CITED_SLUGS = [
  'mcp-server-for-ai-agents',
  'agentic-workflows',
  'ai-agent-frameworks',
  'ai-agent-tools',
  'mcp-vs-skills',
  'agent-registry',
  'shadcn-registry-for-agents',
] as const

const MCP_INTRO_HREF = 'https://modelcontextprotocol.io/introduction'
const MCP_ARCHITECTURE_HREF =
  'https://modelcontextprotocol.io/docs/concepts/architecture'
const EVE_CONNECTIONS_HREF = 'https://eve.dev/docs/connections'
const EVE_GETTING_STARTED_HREF = 'https://eve.dev/docs/getting-started'
const EVE_TOOLS_HREF = 'https://eve.dev/docs/tools'
const EVE_SKILLS_HREF = 'https://eve.dev/docs/skills'
const LANGGRAPH_HREF = 'https://docs.langchain.com/oss/python/langgraph/'
const CREWAI_HREF = 'https://docs.crewai.com/en/introduction'
const AUTOGEN_HREF = 'https://microsoft.github.io/autogen/stable//index.html'
const SHADCN_REGISTRY_HREF = 'https://ui.shadcn.com/docs/registry'

const MARKDOWN_HREF = /\[[^\]]+\]\(([^)]+)\)/g
const AS_OF_STAMP = /as of/i
const CHECKED_DATE_STAMP = /checked \d/i
const AUTOGEN_SUCCESSOR =
  /autogen.*microsoft\.github\.io\/autogen-core|ag2\.ai/i
const MASTRA_LINK = /\[Mastra\]\(/
const SHADCN_INSTALL_COMMAND = /npx shadcn@latest add/

const LOCKED_HREFS_BY_SLUG: Record<
  (typeof CITED_SLUGS)[number],
  readonly string[]
> = {
  'mcp-server-for-ai-agents': [
    MCP_INTRO_HREF,
    MCP_ARCHITECTURE_HREF,
    EVE_CONNECTIONS_HREF,
  ],
  'agentic-workflows': [EVE_GETTING_STARTED_HREF],
  'ai-agent-frameworks': [
    LANGGRAPH_HREF,
    CREWAI_HREF,
    AUTOGEN_HREF,
    EVE_GETTING_STARTED_HREF,
    '/agents',
  ],
  'ai-agent-tools': [EVE_TOOLS_HREF],
  'mcp-vs-skills': [MCP_INTRO_HREF, MCP_ARCHITECTURE_HREF, EVE_SKILLS_HREF],
  'agent-registry': ['/agents', '/docs/publishing'],
  'shadcn-registry-for-agents': [
    SHADCN_REGISTRY_HREF,
    EVE_GETTING_STARTED_HREF,
    '/docs/installation',
  ],
}

const renderInlineMarkdown = (markdown: string): string =>
  renderToStaticMarkup(createElement(LearnInlineMarkdown, null, markdown))

function requireLearnPage(slug: string): LearnPage {
  const page = getLearnPage(slug)
  if (!page) {
    throw new Error(`Missing learn page: ${slug}`)
  }
  return page
}

function collectPageText(page: LearnPage): string {
  return [
    page.summary,
    page.description,
    page.sections.flatMap((section) => [
      section.heading,
      ...section.body,
      ...(section.bullets ?? []),
    ]),
    page.faqs.flatMap((faq) => [faq.question, faq.answer]),
    page.examples.map((example) => example.body),
    page.decisionRows.flatMap((row) => [
      row.choice,
      row.useWhen,
      row.avoidWhen,
    ]),
  ]
    .flat()
    .join('\n')
}

function collectMarkdownHrefs(page: LearnPage): string[] {
  const hrefs: string[] = []
  for (const match of collectPageText(page).matchAll(MARKDOWN_HREF)) {
    const href = match[1]
    if (href) {
      hrefs.push(href)
    }
  }
  return hrefs
}

describe('learn citation + light voice: seven pages', () => {
  it('stamps dateModified 2026-09-05 and keeps titles and section order', () => {
    const expectedHeadings: Record<
      (typeof CITED_SLUGS)[number],
      readonly string[]
    > = {
      'mcp-server-for-ai-agents': [
        'MCP solves integration sprawl',
        'What an MCP server actually exposes',
        'Keep access separate from agent behavior',
        'The risk is assuming protocol equals policy',
        'How to evaluate an MCP server before using it',
      ],
      'agentic-workflows': [
        'Do not make everything agentic',
        'Use agents for ambiguity',
        'Hybrid workflows are the default',
        'Design for the second run',
      ],
      'ai-agent-frameworks': [
        'Start with the job the agent must survive',
        'The seven checks that actually matter',
        'Where the popular options tend to fit',
        'Use the failure-path prototype',
        'When distribution is part of the decision',
      ],
      'ai-agent-tools': [
        'A tool is not just a helper function',
        'Narrow tools beat clever tools',
        'Give every tool a reviewable file',
        'What to include in a tool contract',
      ],
      'mcp-vs-skills': [
        'The common confusion',
        'MCP is an interface to capabilities',
        'Skills are playbooks',
        'Use both when capability needs a method',
      ],
      'agent-registry': [
        'The registry problem is trust',
        'Registry, catalog, marketplace',
        'What a registry item needs',
        'Why source ownership matters',
      ],
      'shadcn-registry-for-agents': [
        'A reusable agent is not just a dependency',
        'What the registry must show before install',
        'Why it pairs well with Eve',
        'When not to use a registry item',
      ],
    }

    const expectedTitles = {
      'mcp-server-for-ai-agents':
        'MCP server for AI agents: what it gives you and what it does not',
      'agentic-workflows':
        'Agentic workflows: when software should decide the next step',
      'ai-agent-frameworks':
        'AI agent frameworks: the practical checklist before you choose',
      'ai-agent-tools': 'AI agent tools: the safe way to give models actions',
      'mcp-vs-skills': 'MCP vs skills: do you need a connection or a playbook?',
      'agent-registry':
        'Agent registry: discovery without trust is just a list',
      'shadcn-registry-for-agents':
        'Shadcn registry for agents: installing workflows as source files',
    } as const

    for (const slug of CITED_SLUGS) {
      const page = requireLearnPage(slug)
      expect(page.dateModified).toBe('2026-09-05')
      expect(page.datePublished).toBe('2026-07-01')
      expect(page.title).toBe(expectedTitles[slug])
      expect(page.sections.map((section) => section.heading)).toEqual(
        expectedHeadings[slug],
      )
    }
  })

  it('locks the citation/voice fields on mcp-server-for-ai-agents', () => {
    const page = requireLearnPage('mcp-server-for-ai-agents')

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

  it('locks the citation/voice fields on agentic-workflows', () => {
    const page = requireLearnPage('agentic-workflows')

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
  })

  it('locks the citation/voice fields on ai-agent-frameworks', () => {
    const page = requireLearnPage('ai-agent-frameworks')
    const fit = page.sections.find(
      (section) => section.heading === 'Where the popular options tend to fit',
    )

    expect(fit?.body).toEqual([
      '[LangGraph](https://docs.langchain.com/oss/python/langgraph/) is strongest when explicit workflow state is the center of the problem. If you need branches, loops, retries, and human interruptions that are easy to reason about, graph structure helps. The tradeoff is that simple workflows can feel heavy when forced into graph terms.',
      '[CrewAI](https://docs.crewai.com/en/introduction) is strongest when the work naturally maps to roles: researcher, analyst, writer, reviewer. It can be fast for prototypes and internal workflows where role collaboration is the clearest way to describe the task. CrewAI also has flow-style orchestration, but if exact state recovery and side-effect boundaries are the main concern, compare those flow primitives directly against graph-first options.',
      '[AutoGen](https://microsoft.github.io/autogen/stable//index.html)-style systems are strongest when the work is conversational collaboration between agents, especially code or research loops where one agent proposes and another critiques. The risk is that long conversations can hide control flow unless you add strong stop conditions and tracing.',
      '[Eve](https://eve.dev/docs/getting-started) is strongest when the agent should be a TypeScript backend project with inspectable files: instructions, tools, skills, channels, schedules, and env requirements. That makes it a better fit for source-owned agents distributed through a registry than for every possible orchestration problem.',
    ])
    expect(page.sections[4]?.body[1]).toBe(
      'That is where evex is relevant. It does not make Eve the best framework for every workflow. It makes Eve’s source-owned file model easier to discover, preview, and install when that model is the right fit. Browse [/agents](/agents).',
    )
    expect(page.faqs).toEqual([
      {
        question: 'What is the best AI agent framework?',
        answer:
          'Start with state, tools, approvals, deployment, observability, evals, and source ownership. There is no universal best.',
      },
      {
        question: 'Should I choose based on programming language?',
        answer:
          'Language matters because your team has to maintain the agent, but it should not override runtime fit, recovery, and tool safety.',
      },
      {
        question: 'How do I compare frameworks quickly?',
        answer:
          'Build one failure-path prototype in each candidate framework. Include a tool error, a duplicate event, and one user-visible output.',
      },
    ])
    expect(collectPageText(page)).toContain('Mastra')
    expect(collectPageText(page)).not.toMatch(MASTRA_LINK)
    expect(collectPageText(page)).not.toMatch(AUTOGEN_SUCCESSOR)
  })

  it('locks the citation/voice fields on ai-agent-tools', () => {
    const page = requireLearnPage('ai-agent-tools')

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
  })

  it('locks the citation/voice fields on mcp-vs-skills', () => {
    const page = requireLearnPage('mcp-vs-skills')

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
          'Safety comes from scopes, validation, approvals, and logs — not from choosing MCP or skills alone.',
      },
    ])
  })

  it('locks the citation/voice fields on agent-registry', () => {
    const page = requireLearnPage('agent-registry')

    expect(page.examples).toEqual([
      {
        label: 'evex-style registry',
        body: 'An agent page on [/agents](/agents) shows files, dependencies, author, and install command. Agents enter through a reviewed pull request ([Publishing](/docs/publishing)).',
      },
      {
        label: 'Enterprise registry',
        body: 'A company registry may track approved MCP servers, internal agents, policy status, owners, and deployment state.',
      },
    ])
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
  })

  it('locks the citation/voice fields on shadcn-registry-for-agents', () => {
    const page = requireLearnPage('shadcn-registry-for-agents')

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
        question: 'Why not publish every agent as a package?',
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
  })

  it('uses only locked primary URLs and renders them as crawlable anchors', () => {
    for (const slug of CITED_SLUGS) {
      const page = requireLearnPage(slug)
      const hrefs = collectMarkdownHrefs(page)
      expect(new Set(hrefs)).toEqual(new Set(LOCKED_HREFS_BY_SLUG[slug]))

      const html = [
        page.summary,
        ...page.sections.flatMap((section) => section.body),
        ...page.examples.map((example) => example.body),
      ]
        .map(renderInlineMarkdown)
        .join('')

      for (const href of LOCKED_HREFS_BY_SLUG[slug]) {
        expect(html).toContain(`href="${href}"`)
      }
    }
  })

  it('keeps the seven pages free of date stamps, successor AutoGen links, and removed registry paths', () => {
    for (const slug of CITED_SLUGS) {
      const pageText = collectPageText(requireLearnPage(slug))
      expect(pageText).not.toMatch(AS_OF_STAMP)
      expect(pageText).not.toMatch(CHECKED_DATE_STAMP)
      expect(pageText).not.toContain('/learn/eve-agent-registry')
      expect(pageText).not.toContain('eve-agent-registry')
      expect(pageText).not.toContain('@evex/{slug}')
      expect(pageText).not.toMatch(SHADCN_INSTALL_COMMAND)
    }
  })

  it('does not rework install-eve-agent, evex-vs-agentcn, or langgraph-vs-crewai', () => {
    const install = requireLearnPage('install-eve-agent')
    const vsAgentcn = requireLearnPage('evex-vs-agentcn')
    const vsCrewai = requireLearnPage('langgraph-vs-crewai')

    expect(install.dateModified).toBe('2026-09-04')
    expect(install.summary).toBe(
      'The install command depends on the source. evex and agentcn copy an agent into an existing Eve app. bergside/awesome-eve-agents creates a standalone agent directory.',
    )
    expect(vsAgentcn.dateModified).toBe('2026-09-04')
    expect(vsAgentcn.title).toBe('Eve agent registries: evex vs agentcn')
    expect(vsCrewai.dateModified).toBe('2026-09-05')
    expect(vsCrewai.title).toBe(
      'LangGraph vs CrewAI: graph control or role-based crews?',
    )
    expect(getLearnPage('eve-agent-registry')).toBeNull()
  })
})
