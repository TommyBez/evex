import { PackageSearch } from 'lucide-react'
import { Suspense } from 'react'
import { AgentCard } from '@/components/agent-card'
import { BrowseFilters } from '@/components/browse-filters'
import { RegistryEmptyState } from '@/components/registry-empty-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  applyInstallCounts,
  getAgentRuntimeState,
  sumInstallCounts,
} from '@/lib/agent-runtime'
import { getInstallCountMap } from '@/lib/queries'
import { getStaticRegistryStats, listStaticAgents } from '@/lib/static-agents'

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  return (
    <>
      <Hero />
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-20" id="agents">
        <section className="flex flex-col gap-6">
          <Suspense fallback={<FiltersSkeleton />}>
            <BrowseFilters />
          </Suspense>
          <Suspense fallback={<AgentGridSkeleton />}>
            <AgentResults searchParams={searchParams} />
          </Suspense>
        </section>
      </main>
    </>
  )
}

function Hero() {
  return (
    <section className="w-full min-w-0">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-16">
        <div className="min-w-0">
          <span className="mono-label inline-flex items-center gap-2 text-muted-foreground">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-brand"
            />
            evex · the eve agent registry
          </span>
          <h1 className="mt-5 text-balance font-semibold text-4xl text-foreground leading-[1.05] sm:text-5xl">
            Install Community Agents with One Command
          </h1>
          <p className="mt-5 max-w-md text-pretty text-base text-muted-foreground leading-relaxed sm:text-lg">
            Browse agent configurations built for the eve framework, then add
            any of them to your project. Add your own by opening a pull request.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8">
            <Button
              className="h-10 rounded-md px-4"
              render={<a href="#agents">Browse Agents</a>}
              size="lg"
            />
            <a
              className="inline-flex items-center gap-1.5 font-medium text-foreground text-sm underline-offset-4 transition-colors hover:text-brand hover:underline"
              href="https://github.com/TommyBez/evex"
              rel="noreferrer noopener"
              target="_blank"
            >
              Open Repository
            </a>
            <a
              className="inline-flex items-center gap-1.5 font-medium text-foreground text-sm underline-offset-4 transition-colors hover:text-brand hover:underline"
              href="https://eve.dev/docs/introduction"
              rel="noreferrer noopener"
              target="_blank"
            >
              Read Docs →
            </a>
          </div>
          <Suspense>
            <Stats />
          </Suspense>
        </div>

        <HeroDemo />
      </div>
    </section>
  )
}

async function Stats() {
  const stats = getStaticRegistryStats()
  const agentIds = listStaticAgents().map((agent) => agent.id)
  const installCounts = await getInstallCountMap(agentIds)
  const items = [
    { label: 'Agents', value: stats.total },
    {
      label: 'Installs',
      value: sumInstallCounts(installCounts),
    },
    { label: 'Authors', value: stats.authors },
  ]

  return (
    <dl className="mt-8 flex items-center gap-8 border-border border-t pt-5 sm:mt-12 sm:gap-10 sm:pt-6">
      {items.map((item) => (
        <div className="flex flex-col gap-1" key={item.label}>
          <dd className="font-semibold text-2xl text-foreground tabular-nums">
            {item.value}
          </dd>
          <dt className="mono-label text-muted-foreground">{item.label}</dt>
        </div>
      ))}
    </dl>
  )
}

function HeroDemo() {
  return (
    <div className="graphite-band w-full min-w-0 overflow-hidden rounded-md border border-white/10 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-white/10 border-b px-4 py-2.5">
        <span className="mono-label text-graphite-foreground/70">
          ~/my-eve-app
        </span>
        <span className="mono-label rounded-md bg-white/10 px-2 py-0.5 text-brand">
          200 OK
        </span>
      </div>
      <pre className="max-h-40 whitespace-pre-wrap break-words px-4 py-4 font-mono text-xs leading-relaxed sm:max-h-none sm:whitespace-pre sm:py-5 sm:text-sm">
        <code>
          <span className="text-brand">$</span>{' '}
          <span className="text-graphite-foreground">
            {
              'npx shadcn@latest registry add @evex=https://evex.sh/r/{name}.json'
            }
          </span>
          {'\n'}
          <span className="text-graphite-foreground/50">
            {'> added @evex registry'}
          </span>
          {'\n'}
          <span className="text-brand">$</span>{' '}
          <span className="text-graphite-foreground">
            npx shadcn@latest add @evex/code-reviewer
          </span>
          {'\n'}
          <span className="text-graphite-foreground/50">
            {'> resolving @evex/code-reviewer...'}
          </span>
          {'\n'}
          <span className="text-brand">✓</span>{' '}
          <span className="text-graphite-foreground">
            created agent/agent.ts
          </span>
          {'\n'}
          <span className="text-brand">✓</span>{' '}
          <span className="text-graphite-foreground">
            created agent/instructions.md
          </span>
        </code>
      </pre>
    </div>
  )
}

function getResultContext({
  category,
  query,
}: {
  category?: string
  query?: string
}): string {
  if (query) {
    return `for "${query}"`
  }
  if (category && category !== 'all') {
    return `in ${category}`
  }
  return 'available'
}

async function AgentResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const { q, category } = await searchParams
  const staticAgents = listStaticAgents({ search: q, category })
  const runtimeState = await getAgentRuntimeState(
    staticAgents.map((agent) => agent.id),
  )
  const agents = applyInstallCounts(staticAgents, runtimeState.installCounts)
  const hasActiveFilter = Boolean(q || (category && category !== 'all'))
  const resultCountLabel =
    agents.length === 1 ? '1 agent' : `${agents.length} agents`
  const resultContext = getResultContext({ category, query: q })

  if (agents.length === 0) {
    return (
      <RegistryEmptyState
        description={
          q || (category && category !== 'all')
            ? 'Try adjusting your search or filters.'
            : 'Open a pull request to add the first agent to the registry.'
        }
        icon={PackageSearch}
        title="No Agents Found"
      >
        <Button
          render={
            <a
              href="https://github.com/TommyBez/evex"
              rel="noreferrer noopener"
              target="_blank"
            >
              Open Repository
            </a>
          }
        />
      </RegistryEmptyState>
    )
  }

  return (
    <div className="grid gap-3">
      <p className="mono-label text-muted-foreground">
        {resultCountLabel} {hasActiveFilter ? resultContext : 'available'}
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

function FiltersSkeleton() {
  const chipIds = [
    'filter-chip-a',
    'filter-chip-b',
    'filter-chip-c',
    'filter-chip-d',
    'filter-chip-e',
  ] as const

  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 border border-border" />
      <div className="flex flex-wrap gap-2">
        {chipIds.map((id) => (
          <Skeleton className="h-8 w-20 border border-border" key={id} />
        ))}
      </div>
    </div>
  )
}

function AgentGridSkeleton() {
  const cardIds = [
    'agent-card-a',
    'agent-card-b',
    'agent-card-c',
    'agent-card-d',
    'agent-card-e',
    'agent-card-f',
  ] as const

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cardIds.map((id) => (
        <Skeleton className="h-44 rounded-md border border-border" key={id} />
      ))}
    </div>
  )
}
