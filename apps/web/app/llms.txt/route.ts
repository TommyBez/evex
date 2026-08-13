import { getAgentPlainDescription } from '@/lib/agent-detail'
import { listDocsPages } from '@/lib/docs-content'
import { listLearnPages } from '@/lib/learn-content'
import { siteConfig } from '@/lib/metadata'
import { listStaticAgents } from '@/lib/registry'
import {
  buildInstallCommand,
  getAgentUrl,
  getLearnUrl,
  getSiteUrl,
} from '@/lib/site-url'

function escapeMarkdownLinkText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/[[\]]/g, '\\$&')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildLlmsTxt(): string {
  const siteUrl = getSiteUrl()
  const agents = listStaticAgents()
  const guides = listLearnPages()
  const agentLines = agents
    .map((agent) => {
      const name = escapeMarkdownLinkText(agent.name)
      const description = escapeMarkdownLinkText(
        getAgentPlainDescription(agent),
      )
      const install = buildInstallCommand(agent.slug)
      return `- [${name}](${getAgentUrl(agent.slug)}.md): ${description}\n  - Install: \`${install}\``
    })
    .join('\n')
  const docsLines = listDocsPages()
    .map((page) => {
      const title = escapeMarkdownLinkText(page.shortTitle)
      const description = escapeMarkdownLinkText(page.description)
      const url =
        page.slug === 'introduction'
          ? `${siteUrl}/docs.md`
          : `${siteUrl}/docs/${page.slug}.md`
      return `- [${title}](${url}): ${description}`
    })
    .join('\n')
  const guideLines = guides
    .map((guide) => {
      const title = escapeMarkdownLinkText(guide.title)
      const description = escapeMarkdownLinkText(guide.description)
      return `- [${title}](${getLearnUrl(guide.slug)}.md): ${description}`
    })
    .join('\n')

  return `# ${siteConfig.name}

> ${siteConfig.description}

evex is the community registry for reusable eve agent configurations. Developers browse agents, preview every file an install will write, and add agents to eve projects with a single shadcn command.

## What is evex?

evex is a shadcn-compatible registry for eve agents. Each registry item packages an agent's config, instructions, skills, tools, and subagents under the standard \`agent/\` directory layout used by the eve framework.

## How to install an agent

1. Run \`npx shadcn@latest add @evex/{slug}\` from your eve app root.
2. Review the generated files and configure any required credentials before running the agent.

## Key pages

- [Browse agents](${siteUrl}/): Search and filter the full agent catalog
- [Docs](${siteUrl}/docs): How to install agents, use the registry API, and publish your own agent
- [Learn](${siteUrl}/learn): Decision guides for Eve, AI agents, MCP, shadcn registries, and framework comparisons
- [Leaderboard](${siteUrl}/leaderboard): Most installed agents and top authors
- [GitHub repository](https://github.com/TommyBez/evex): Source, issues, and contribution guide
- [eve framework docs](https://eve.dev/docs/introduction): Framework documentation

## Docs

${docsLines}

## Guides

${guideLines || '- No guides published yet.'}

## Agents

${agentLines || '- No agents published yet.'}

## Machine-readable resources

- [Full content dump](${siteUrl}/llms-full.txt): Every guide and agent in one markdown document
- Markdown mirrors: append \`.md\` to any agent or guide URL for a text/markdown version
- [shadcn registry catalog](${siteUrl}/r/registry.json): Machine-readable agent catalog
- Registry items: \`${siteUrl}/r/{slug}\` serves each agent as a shadcn registry item

## Publishing

Authors add agents by opening a pull request to the evex repository. Each agent lives under \`registry/{slug}\` with a \`registry.json\` manifest.

## Contact

- GitHub: https://github.com/TommyBez/evex
- Site: ${siteUrl}
`
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
