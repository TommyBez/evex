import { getSiteUrl, siteConfig } from '@/lib/metadata'
import { listStaticAgents } from '@/lib/static-agents'

function buildLlmsTxt(): string {
  const siteUrl = getSiteUrl()
  const agents = listStaticAgents()
  const agentLines = agents
    .slice(0, 20)
    .map(
      (agent) =>
        `- [${agent.name}](${siteUrl}/agents/${agent.slug}): ${agent.description}`,
    )
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
- [Leaderboard](${siteUrl}/leaderboard): Most installed agents and top authors
- [GitHub repository](https://github.com/TommyBez/evex): Source, issues, and contribution guide
- [eve framework docs](https://eve.dev/docs/introduction): Framework documentation

## Featured agents

${agentLines || '- No agents published yet.'}

## Publishing

Authors add agents by opening a pull request to the evex repository. Each agent lives under \`packages/agent-registry/agents/{slug}\` with a \`registry.json\` manifest.

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
