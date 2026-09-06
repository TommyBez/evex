import { PackageSearch } from 'lucide-react'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AgentCard } from '@/components/agent-card'
import { JsonLd } from '@/components/json-ld'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import { RegistryEmptyState } from '@/components/registry-empty-state'
import type { AgentWithAuthor } from '@/lib/agent-types'
import { applyInstallCounts, getAgentRuntimeState } from '@/lib/data/agents'
import { createPageMetadata, hasListingSearchFilter } from '@/lib/metadata'
import { listStaticAgents } from '@/lib/registry'
import {
  createAgentListSchema,
  createAgentsIndexBreadcrumbSchema,
} from '@/lib/structured-data'

// PMM-locked. Layout template appends ` · evex` — do not include the brand
// suffix here or the rendered <title> doubles it.
export const AGENTS_INDEX_TITLE =
  'Eve agents for the Eve agent framework | browse and install'
export const AGENTS_INDEX_H1 = 'Eve agents for the Eve agent framework'
export const AGENTS_INDEX_DESCRIPTION =
  'Browse and install Eve agents for the Eve agent framework. Preview every file, then run npx shadcn@latest add @evex/<slug>. MCP-ready editors: see /docs/mcp.'
export const AGENTS_INDEX_INTRO = [
  'This catalog lists Eve agents you can inspect and install into an Eve app.',
  'Every agent installs with one command: `npx shadcn@latest add @evex/<slug>`. Replace the slug with the agent you pick.',
  'Open any agent page to preview the files before you install.',
  'Installing or running agents from MCP-ready editors is covered in [/docs/mcp](/docs/mcp).',
] as const
export const AGENTS_INDEX_LEARN_LINKS =
  'How to install from a registry: [Install an Eve agent](/learn/install-eve-agent). How evex differs from agentcn: [evex vs agentcn](/learn/evex-vs-agentcn).'

interface AgentsSearchParams {
  category?: string
  q?: string
  sort?: string
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<AgentsSearchParams>
}): Promise<Metadata> {
  const params = await searchParams
  const filtered = hasListingSearchFilter(params)

  return createPageMetadata({
    title: AGENTS_INDEX_TITLE,
    description: AGENTS_INDEX_DESCRIPTION,
    path: '/agents',
    ...(filtered ? { noIndex: true, follow: true } : {}),
  })
}

export default function AgentsIndexPage() {
  const agents = listStaticAgents()

  return (
    <>
      <JsonLd
        data={[
          createAgentListSchema(agents, {
            description: AGENTS_INDEX_DESCRIPTION,
            name: AGENTS_INDEX_H1,
          }),
          createAgentsIndexBreadcrumbSchema(),
        ]}
      />
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6">
        <header className="max-w-3xl">
          <h1 className="text-balance font-semibold text-3xl text-foreground sm:text-4xl">
            {AGENTS_INDEX_H1}
          </h1>
          <div className="mt-4 flex flex-col gap-3">
            {AGENTS_INDEX_INTRO.map((paragraph) => (
              <p
                className="text-pretty text-base text-muted-foreground leading-relaxed sm:text-lg"
                key={paragraph}
              >
                <LearnInlineMarkdown>{paragraph}</LearnInlineMarkdown>
              </p>
            ))}
            <p className="text-pretty text-base text-muted-foreground leading-relaxed sm:text-lg">
              <LearnInlineMarkdown>
                {AGENTS_INDEX_LEARN_LINKS}
              </LearnInlineMarkdown>
            </p>
          </div>
        </header>

        <section
          aria-label="Agent catalog"
          className="mt-10 flex flex-col gap-4"
        >
          <Suspense fallback={<AgentsIndexGrid agents={agents} />}>
            <AgentCatalog />
          </Suspense>
        </section>
      </main>
    </>
  )
}

export function AgentsIndexGrid({
  agents,
  favoriteAgentIdSet,
  isAuthenticated = false,
}: {
  agents: readonly AgentWithAuthor[]
  favoriteAgentIdSet?: ReadonlySet<string>
  isAuthenticated?: boolean
}) {
  const resultCountLabel =
    agents.length === 1 ? '1 agent' : `${agents.length} agents`

  if (agents.length === 0) {
    return (
      <RegistryEmptyState
        description="Open a pull request to add the first agent to the registry."
        icon={PackageSearch}
        title="No Agents Found"
      />
    )
  }

  return (
    <div className="grid gap-3">
      <p className="mono-label text-muted-foreground">
        {resultCountLabel} available
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard
            agent={agent}
            isAuthenticated={isAuthenticated}
            isFavorite={favoriteAgentIdSet?.has(agent.id) ?? false}
            key={agent.id}
          />
        ))}
      </div>
    </div>
  )
}

async function AgentCatalog() {
  const staticAgents = listStaticAgents()
  const runtimeState = await getAgentRuntimeState(
    staticAgents.map((agent) => agent.id),
  )
  const agents = applyInstallCounts(staticAgents, runtimeState.installCounts)

  return (
    <AgentsIndexGrid
      agents={agents}
      favoriteAgentIdSet={runtimeState.favoriteAgentIdSet}
      isAuthenticated={runtimeState.isAuthenticated}
    />
  )
}
