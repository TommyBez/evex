import { PackageSearch } from 'lucide-react'
import type { Metadata } from 'next'
import { AgentCard } from '@/components/agent-card'
import { JsonLd } from '@/components/json-ld'
import { RegistryEmptyState } from '@/components/registry-empty-state'
import { createPageMetadata } from '@/lib/metadata'
import { listStaticAgents } from '@/lib/registry'
import {
  createAgentListSchema,
  createAgentsIndexBreadcrumbSchema,
} from '@/lib/structured-data'

// PMM-locked. Layout template appends ` · evex` — do not include the brand
// suffix here or the rendered <title> doubles it.
const AGENTS_INDEX_TITLE = 'Eve agents - install with @evex/<slug>'
const AGENTS_INDEX_DESCRIPTION =
  'Browse community Eve agents, inspect the files, install with npx shadcn@latest add @evex/<slug>.'

export const metadata: Metadata = createPageMetadata({
  title: AGENTS_INDEX_TITLE,
  description: AGENTS_INDEX_DESCRIPTION,
  path: '/agents',
})

export default function AgentsIndexPage() {
  const agents = listStaticAgents()
  const resultCountLabel =
    agents.length === 1 ? '1 agent' : `${agents.length} agents`

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
            Browse Eve agents.
          </h1>
        </header>

        <section
          aria-label="Agent catalog"
          className="mt-10 flex flex-col gap-4"
        >
          {agents.length === 0 ? (
            <RegistryEmptyState
              description="Open a pull request to add the first agent to the registry."
              icon={PackageSearch}
              title="No Agents Found"
            />
          ) : (
            <div className="grid gap-3">
              <p className="mono-label text-muted-foreground">
                {resultCountLabel} available
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <AgentCard agent={agent} key={agent.id} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
