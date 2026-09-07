export interface DocsCodeBlock {
  code: string
  label?: string
  language: string
}

export interface DocsSection {
  body: readonly string[]
  bullets?: readonly string[]
  code?: readonly DocsCodeBlock[]
  heading: string
}

export interface DocsPage {
  dateModified: string
  datePublished: string
  // Second intro paragraph under H1 when it must differ from description.
  definition?: string
  description: string
  // Optional visible H1 when it must differ from document <title>.
  heading?: string
  sections: readonly DocsSection[]
  shortTitle: string
  slug: string
  summary: string
  title: string
}

const DOCS_INDEX_SLUG = 'introduction'

export const DOCS_PAGES: readonly DocsPage[] = [
  {
    dateModified: '2026-09-07',
    datePublished: '2026-07-04',
    definition:
      'An AI agent registry is a catalog of reusable agents you can audit and install into your project. evex is the open-source registry for Eve agents: each item is code-owned, reviewed by pull request, and installed with npx shadcn@latest add @evex/<slug> through the official shadcn community registry.',
    description:
      'evex is an open-source AI agent registry. Browse Eve agents, inspect every file, then install as source with npx shadcn@latest add @evex/<slug>.',
    heading: 'Open-source AI agent registry: install as source',
    sections: [
      {
        body: [
          'Eve is the TypeScript agent framework you author under agent/ (Vercel-first). It defines how an agent is structured and run.',
          'evex is the catalog on top of that convention. It does not run agents. It packages community Eve agents so you can browse them, preview files and dependencies, install them as source, and keep editing in your own repo.',
        ],
        heading: 'Registry vs framework',
      },
      {
        body: [
          'AWS and GCP ship agent registries aimed at governed deployment inside their clouds: policies, environments, and operational control for agents you already run on their platforms.',
          'evex is a different job. It is an open catalog of installable Eve agent source. You review the files on the agent page, run the install command into your Eve project, and the agent lives in your repository with no runtime dependency on the registry.',
        ],
        heading: 'Not a cloud governance registry',
      },
      {
        body: [
          'agentcn uses the same shadcn install mechanic for Eve agents. evex competes on the full registry loop: catalog UX, file preview, author profiles, favorites, leaderboard, and first-party publishing docs with PR-owned agents.',
          "AgentsKit Registry is a shadcn-style install-as-source catalog for the AgentsKit stack (provider-agnostic agents). evex is Eve-native: agents follow Eve's agent/ layout and install with `npx shadcn@latest add @evex/<slug>`.",
          'For a deeper Eve-vs-agentcn comparison, see [/learn/evex-vs-agentcn](/learn/evex-vs-agentcn).',
        ],
        heading: 'How evex compares to agentcn and AgentsKit',
      },
      {
        body: [
          'Browse the live catalog: [Eve agents](/agents). First-party agents include the [Eve GitHub issue agent](/agents/github-issue-maintainer), the [Eve docs Q&A agent](/agents/docs-knowledge-assistant), and the [Eve support reply agent](/agents/support-reply-draft).',
          'Install walkthrough: [Install an Eve agent](/learn/install-eve-agent).',
          'Browse and install from editors (Cursor, VS Code, Claude Code): [MCP](/docs/mcp).',
          'The [Installation](/docs/installation) page covers prerequisites, the install command, and what to do after the files are written. The [Registry](/docs/registry) page documents the HTTP endpoints behind the catalog, including the machine-readable resources for tools and LLMs. The [Publishing](/docs/publishing) page walks through adding your own agent to the catalog by pull request.',
          'How evex compares to agentcn: [evex vs agentcn](/learn/evex-vs-agentcn).',
        ],
        heading: 'Where to go next',
      },
    ],
    shortTitle: 'Introduction',
    slug: 'introduction',
    summary:
      'Browse community AI agents built for Eve, inspect every file before you trust them, and install as source with one command. You own the files afterward. There is no hosted runtime.',
    title: 'Open-source AI agent registry: install as source',
  },
  {
    dateModified: '2026-09-05',
    datePublished: '2026-07-04',
    description:
      'Add any evex agent to your eve project with npx shadcn add. Prerequisites, what the CLI writes, and how to configure and verify the agent after install.',
    sections: [
      {
        body: [
          'Agents install into an eve project: the CLI writes the agent/ directory layout that the eve framework loads at runtime. If you do not have an eve app yet, create one first and run every install command from its root.',
          'eve requires Node.js 24 or newer. npx, bundled with Node, downloads and runs both the eve and shadcn CLIs on demand, so no global installs are needed.',
        ],
        code: [
          {
            code: 'npx eve@latest init my-agent',
            label: 'Create a new eve project (skip if you already have one)',
            language: 'bash',
          },
          {
            code: 'cd my-agent',
            label: 'Install commands run from the project root',
            language: 'bash',
          },
        ],
        heading: 'Prerequisites: an eve project',
      },
      {
        body: [
          'Every agent installs with a single command. Replace the slug with the agent you picked from the catalog; the exact command is shown on every agent page.',
          'evex is part of the official shadcn community registry, so the @evex namespace resolves without any registry configuration on your side.',
          'How to install: [Install an Eve agent](/learn/install-eve-agent).',
        ],
        code: [
          {
            code: 'npx shadcn@latest add @evex/{slug}',
            label: 'Install an agent',
            language: 'bash',
          },
          {
            code: 'npx shadcn@latest add @evex/code-reviewer',
            label: 'Example',
            language: 'bash',
          },
        ],
        heading: 'Run the install command',
      },
      {
        body: [
          'The CLI fetches the registry item and writes the agent package into your project. You can preview the full file list on the agent page before running anything.',
        ],
        bullets: [
          'agent/ - the agent source: configuration, instructions, skills, tools, and subagents',
          'evals/ - the eval suite the author ships with the agent',
          'README.md - setup and usage notes written by the author',
          '.env.example - present when the agent reads environment variables, listing every variable it needs',
          'npm dependencies declared by the agent, which the CLI prompts you to install',
        ],
        heading: 'What the CLI writes',
      },
      {
        body: ['Three steps take you from installed files to a working agent.'],
        bullets: [
          'Copy .env.example values into your environment and fill in real credentials; the template names every variable the agent reads',
          'Read the installed README.md for agent-specific setup, usage, and caveats',
          'Run the evals under evals/ to confirm the agent behaves as expected in your project',
        ],
        heading: 'After the install',
      },
      {
        body: [
          'If the CLI writes files somewhere unexpected or the agent fails to load, check that you ran the command from the root of an eve app. The installed files assume the eve framework and its AI SDK peer are present: create a project with npx eve@latest init, or run npm install eve@latest ai in an existing package, then rerun the install.',
          'If the CLI prompts you to install npm packages, those are the dependencies the agent declares in its registry item. The list matches the dependencies shown on the agent page, so review it there first and accept the prompt to complete the install.',
        ],
        heading: 'Troubleshooting',
      },
    ],
    shortTitle: 'Installation',
    slug: 'installation',
    summary:
      'Run npx shadcn@latest add @evex/{slug} from the root of your eve app. The CLI writes the agent source into your project and prompts for any npm dependencies.',
    title: 'Install eve agents with the shadcn CLI',
  },
  {
    dateModified: '2026-07-04',
    datePublished: '2026-07-04',
    description:
      'Fetch the evex catalog at /r/registry.json and any agent at /r/{slug}. Endpoints, the @evex shadcn namespace, and machine-readable llms.txt resources.',
    sections: [
      {
        body: [
          'The catalog endpoint returns a descriptor for every published agent: name, title, description, and metadata, without file contents. Use it to list or search the registry from scripts and tools.',
        ],
        code: [
          {
            code: 'curl https://www.evex.sh/r/registry.json',
            label: 'Fetch the catalog',
            language: 'bash',
          },
        ],
        heading: 'The catalog endpoint',
      },
      {
        body: [
          'The registry serves each agent as a complete shadcn registry item at its slug. The item embeds the contents of every file the install will write, plus the declared npm dependencies. This is the same payload the shadcn CLI fetches when you install the agent.',
        ],
        code: [
          {
            code: 'curl https://www.evex.sh/r/{slug}',
            label: 'Fetch one agent',
            language: 'bash',
          },
          {
            code: 'curl https://www.evex.sh/r/code-reviewer',
            label: 'Example',
            language: 'bash',
          },
        ],
        heading: 'Item endpoints',
      },
      {
        body: [
          'evex is part of the official shadcn community registry, so the shadcn CLI resolves @evex/{slug} to these endpoints with no configuration. The namespace works anywhere the CLI does, including editor integrations built on it.',
        ],
        code: [
          {
            code: 'npx shadcn@latest add @evex/{slug}',
            label: 'Install through the @evex namespace',
            language: 'bash',
          },
        ],
        heading: 'The @evex namespace',
      },
      {
        body: [
          'The site publishes plain-text mirrors for LLMs and automation. llms.txt is an annotated index of every agent and guide; llms-full.txt is the entire site content in one markdown document; and appending .md to any agent or guide URL returns that page as markdown.',
        ],
        code: [
          {
            code: 'curl https://www.evex.sh/llms.txt',
            label: 'Index of agents and guides',
            language: 'bash',
          },
          {
            code: 'curl https://www.evex.sh/llms-full.txt',
            label: 'Full content dump',
            language: 'bash',
          },
          {
            code: 'curl https://www.evex.sh/agents/{slug}.md',
            label: 'Markdown mirror of an agent page',
            language: 'bash',
          },
        ],
        heading: 'Machine-readable resources',
      },
    ],
    shortTitle: 'Registry',
    slug: 'registry',
    summary:
      'evex serves every agent as a standard shadcn registry item over HTTPS. Fetch the catalog at /r/registry.json, fetch items at /r/{slug}, or address them as @evex/{slug} in the shadcn CLI.',
    title: 'Registry API: shadcn-compatible endpoints for eve agents',
  },
  {
    dateModified: '2026-07-04',
    datePublished: '2026-07-04',
    description:
      'Browse and install evex agents from Cursor, VS Code, or Claude Code through the shadcn MCP server. Setup steps and example prompts for @evex/{slug} items.',
    sections: [
      {
        body: [
          'The shadcn project ships an MCP server that lets AI-assisted editors discover and install registry items through the Model Context Protocol. Clients such as Cursor, VS Code, and Claude Code can search a registry, inspect items, and run installs from a conversation.',
          'Because evex is part of the shadcn community registry, the MCP server addresses every evex agent as @evex/{slug}. You need no evex-specific server or configuration.',
        ],
        heading: 'What the shadcn MCP server does',
      },
      {
        body: [
          'Configure the shadcn MCP server in your editor by following the official setup guide for your client. Once you register the server, your assistant resolves @evex items the same way the CLI does.',
        ],
        code: [
          {
            code: 'https://ui.shadcn.com/docs/mcp',
            label: 'shadcn MCP setup guide',
            language: 'text',
          },
        ],
        heading: 'Set up the MCP server',
      },
      {
        body: [
          'With the server configured, ask your assistant in plain language. It searches the catalog, shows what an item contains, and runs the install for you.',
        ],
        bullets: [
          'Install @evex/code-reviewer into this project',
          'Find an evex agent that reviews pull requests',
          'Show me the files @evex/{slug} will add before installing it',
          'List evex agents in the devops category',
        ],
        heading: 'Example prompts',
      },
      {
        body: [
          'An MCP-driven install produces the same result as running the shadcn CLI yourself: the agent source lands under agent/ in your project, along with evals, the README, and any .env.example. Review the written files, fill in credentials from the environment template, and run the evals before relying on the agent.',
        ],
        heading: 'What happens on install',
      },
    ],
    shortTitle: 'MCP',
    slug: 'mcp',
    summary:
      'Configure the shadcn MCP server in your editor and your assistant can search the evex catalog and install agents as @evex/{slug} without leaving the chat.',
    title: 'Use evex agents from your editor with the shadcn MCP server',
  },
  {
    dateModified: '2026-09-01',
    datePublished: '2026-07-04',
    description:
      'Add your agent to evex by pull request: scaffold with registry:new, fill in meta.docs, validate with the generator, and pass CODEOWNERS and review.',
    sections: [
      {
        body: [
          'vercel deploy ships your Eve app to Vercel. Publishing an Eve agent to the community registry is a pull request on evex. After merge, people install it with `npx shadcn@latest add @evex/<slug>`. The live catalog is [/agents](/agents).',
        ],
        heading: 'Publish an Eve agent, or vercel deploy?',
      },
      {
        body: [
          'Agents join the catalog through pull requests to the evex repository. Start by scaffolding a complete package skeleton with your agent slug and GitHub username.',
          'The slug becomes the public install name, @evex/{slug}, claimed first-come by the pull request that adds it. Pick a name that describes what the agent does, and treat it as permanent: renaming after merge breaks the install command for everyone who used it.',
        ],
        code: [
          {
            code: 'pnpm --filter @evex/agent-registry registry:new <slug> <github-username>',
            label: 'Scaffold a new agent package',
            language: 'bash',
          },
        ],
        heading: 'Scaffold a new agent',
      },
      {
        body: [
          'Each agent lives under registry/{slug} in the repository. The agent/ directory holds the eve source that installs into a consumer app; repo-only files such as package.json and tsconfig.json are never published.',
        ],
        bullets: [
          'agent/ - the eve agent source installed into consumer projects',
          'evals/ - the eval suite, with evals.config.ts and one or more *.eval.ts files',
          'README.md - installed as the agent readme, so write it for the person running your agent',
          '.env.example - required whenever installed files read process.env, and it must declare every referenced variable with placeholder values',
          'registry.json - the manifest: name, title, description, author, categories, dependencies, the full file list, and meta.docs',
        ],
        heading: 'Package layout',
      },
      {
        body: [
          'registry.json carries a meta.docs block: the editorial documentation rendered on your agent page, covering the overview, how it works, use cases, requirements, and FAQs.',
          'The scaffold seeds placeholder text. Replace every placeholder before opening the pull request, and bump meta.updatedAt whenever the docs change. Agent pages are how consumers evaluate your work, so treat this content as a first-class part of the package.',
        ],
        heading: 'Write meta.docs',
      },
      {
        body: [
          'The generator validates registry.json against a Zod schema and regenerates the catalog artifacts. It enforces the contract mechanically: the declared file list must match the files on disk exactly, registry.json dependencies must stay in sync with package.json, .env.example must cover every environment variable the code reads, and every agent must pin the same eve version.',
          'registry:scaffold generates registry.json from your package sources; review the result, especially categories, before validating. Run the full local pipeline before opening the pull request, since CI runs the same checks.',
        ],
        code: [
          {
            code: 'pnpm --filter @evex/agent-registry registry:scaffold <slug>',
            label: 'Generate registry.json from sources',
            language: 'bash',
          },
          {
            code: 'pnpm --filter @evex/agent-registry generate\npnpm check && pnpm typecheck && pnpm test',
            label: 'Validate before opening a PR',
            language: 'bash',
          },
        ],
        heading: 'Validate locally',
      },
      {
        body: [
          'Running generate also writes .github/CODEOWNERS, with one entry per agent owned by its registry.json author. Commit the CODEOWNERS update with your pull request; CI fails when the committed file is stale.',
          'Automation covers schema shape, file and dependency sync, and environment coverage. Human reviewers focus on what machines cannot judge: that the author field matches your GitHub username, that the agent does what its README and description claim, that the declared dependencies are reasonable, and that .env.example contains placeholders rather than real credentials.',
        ],
        heading: 'CODEOWNERS and review',
      },
    ],
    shortTitle: 'Publishing',
    slug: 'publishing',
    summary:
      'Agents join evex through pull requests. Scaffold a package with registry:new, implement under agent/, write meta.docs, validate with the generator, and open a PR.',
    title: 'Publish your eve agent to the evex registry',
  },
]

export function listDocsPages(): readonly DocsPage[] {
  return DOCS_PAGES
}

export function getDocsPage(slug: string): DocsPage | null {
  return DOCS_PAGES.find((page) => page.slug === slug) ?? null
}

export function getDocsIndexPage(): DocsPage {
  const page = getDocsPage(DOCS_INDEX_SLUG)
  if (!page) {
    throw new Error('Docs index page "introduction" is missing from DOCS_PAGES')
  }
  return page
}

export function listDocsSubPages(): readonly DocsPage[] {
  return DOCS_PAGES.filter((page) => page.slug !== DOCS_INDEX_SLUG)
}

export function getDocsPageHeading(page: DocsPage): string {
  return page.heading ?? page.title
}

export function getDocsPageIntro(page: DocsPage): readonly string[] {
  if (page.definition) {
    return [page.summary, page.definition]
  }

  return [page.description]
}
