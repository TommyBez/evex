import { getAgentPlainDescription } from '@/lib/agent-detail'
import type { AgentWithAuthor } from '@/lib/agent-types'
import { parseDependencies } from '@/lib/agents'
import { listLearnPages } from '@/lib/learn-content'
import { buildLearnPageMarkdown } from '@/lib/markdown-content'
import { siteConfig } from '@/lib/metadata'
import { listStaticAgents } from '@/lib/registry'
import { buildInstallCommand, getAgentUrl, getSiteUrl } from '@/lib/site-url'

// Compact per-agent section: metadata plus a pointer to the agent's .md
// mirror, which carries the full file contents. Keeps this dump readable
// for LLMs without inlining every registry file.
function buildAgentSection(agent: AgentWithAuthor): string {
  const deps = parseDependencies(agent.dependencies)
  const agentUrl = getAgentUrl(agent.slug)
  const description = getAgentPlainDescription(agent)

  const overview = agent.docs ? `\n${agent.docs.overview.join('\n\n')}\n` : ''

  return `## ${agent.name}

${description}
${overview}
- Install: \`${buildInstallCommand(agent.slug)}\`
- Category: ${agent.category}
- Author: ${agent.authorName}
- Updated: ${agent.updatedAt.toISOString().slice(0, 10)}
- Dependencies: ${deps.length > 0 ? deps.join(', ') : 'none'}
- Web page: ${agentUrl}
- Full source (markdown): ${agentUrl}.md`
}

function buildLlmsFullTxt(): string {
  const siteUrl = getSiteUrl()
  const agents = listStaticAgents()
  const guides = listLearnPages()

  const agentSections = agents.map(buildAgentSection).join('\n\n')
  const guideSections = guides.map(buildLearnPageMarkdown).join('\n\n---\n\n')

  return `# ${siteConfig.name} — full content

> ${siteConfig.description}

This document contains every agent in the registry and every learning guide.
The short index lives at ${siteUrl}/llms.txt.

# Agents

${agentSections || 'No agents published yet.'}

---

# Guides

${guideSections || 'No guides published yet.'}
`
}

export function GET() {
  return new Response(buildLlmsFullTxt(), {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
