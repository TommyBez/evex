import { Skeleton } from '@evex/ui/skeleton'
import { PackageSearch } from 'lucide-react'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AgentCard } from '@/components/agent-card'
import { JsonLd } from '@/components/json-ld'
import { RegistryEmptyState } from '@/components/registry-empty-state'
import { applyInstallCounts, getAgentRuntimeState } from '@/lib/data/agents'
import { createPageMetadata } from '@/lib/metadata'
import { listStaticAgents } from '@/lib/registry'
import {
  createAgentListSchema,
  createAgentsIndexBreadcrumbSchema,
} from '@/lib/structured-data'

// PMM-locked. Layout template appends ` · evex` — do not include the brand
// suffix here or the rendered <title> doubles it.
const AGENTS_INDEX_TITLE = 'Eve agents for the Eve agent framework'
const AGENTS_INDEX_DESCRIPTION =
  'Open registry of Eve agents for Cursor and shadcn. These are Vercel Eve agents, not the game or the TV show. Inspect the files and install with npx shadcn@latest add @evex/<slug>.'
const AGENTS_INDEX_LEDE =
  'This is the open registry for Eve agents on Cursor and the shadcn CLI. These are Vercel Eve agents you can inspect and install, not the game and not the TV show. Install with npx shadcn@latest add @evex/<slug>.'

export const metadata: Metadata = createPageMetadata({
  title: AGENTS_INDEX_TITLE,
  description: AGENTS_INDEX_DESCRIPTION,
  path: '/agents',
})

const AGENT_GRID_SKELETON_CARD_IDS = [
  'agents-index-card-a',
  'agents-index-card-b',
  'agents-index-card-c',
  'agents-index-card-d',
  'agents-index-card-e',
  'agents-index-card-f',
] as const

export default function AgentsIndexPage() {
  const agents = listStaticAgents()

  return (
    <>
      <JsonLd
        data={[
          createAgentListSchema(agents),
          createAgentsIndexBreadcrumbSchema(),
        ]}
      />
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6">
        <header className="max-w-3xl">
          <h1 className="text-balance font-semibold text-3xl text-foreground sm:text-4xl">
            Eve agents
          </h1>
          <p className="mt-4 text-pretty text-base text-muted-foreground leading-relaxed sm:text-lg">
            {AGENTS_INDEX_LEDE}
          </p>
        </header>

        <section
          aria-label="Agent catalog"
          className="mt-10 flex flex-col gap-4"
        >
          <Suspense fallback={<AgentGridSkeleton />}>
            <AgentCatalog />
          </Suspense>
        </section>
      </main>
    </>
  )
}

async function AgentCatalog() {
  const staticAgents = listStaticAgents()
  const runtimeState = await getAgentRuntimeState(
    staticAgents.map((agent) => agent.id),
  )
  const agents = applyInstallCounts(staticAgents, runtimeState.installCounts)
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
            isAuthenticated={runtimeState.isAuthenticated}
            isFavorite={runtimeState.favoriteAgentIdSet.has(agent.id)}
            key={agent.id}
          />
        ))}
      </div>
    </div>
  )
}

function AgentGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {AGENT_GRID_SKELETON_CARD_IDS.map((id) => (
        <Skeleton className="h-44 rounded-md border border-border" key={id} />
      ))}
    </div>
  )
}
