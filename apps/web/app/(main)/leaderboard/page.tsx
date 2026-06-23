import { Download, Trophy } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { AuthorAvatar } from '@/components/author-avatar'
import { RegistryEmptyMessage } from '@/components/registry-empty-state'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import { createPageMetadata } from '@/lib/metadata'
import { getTopAgents, getTopAuthors } from '@/lib/queries'

export const metadata: Metadata = createPageMetadata({
  title: 'Leaderboard',
  description:
    'The most installed agents and top authors on the evex registry.',
  path: '/leaderboard',
})

export default function LeaderboardPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-10">
      <header className="flex flex-col gap-3">
        <span className="mono-label inline-flex items-center gap-2 text-muted-foreground">
          <Trophy aria-hidden="true" className="size-4 text-brand" />
          leaderboard
        </span>
        <h1 className="text-balance font-semibold text-3xl text-foreground">
          Top Agents and Authors
        </h1>
        <p className="max-w-xl text-pretty text-muted-foreground leading-relaxed">
          The most installed agents on the registry and the authors driving the
          most installs across everything they&apos;ve published.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-foreground text-lg">
            Top Agents
          </h2>
          <Suspense fallback={<ListSkeleton />}>
            <TopAgents />
          </Suspense>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-foreground text-lg">
            Top Authors
          </h2>
          <Suspense fallback={<ListSkeleton />}>
            <TopAuthors />
          </Suspense>
        </section>
      </div>
    </main>
  )
}

function Rank({ position }: { position: number }) {
  const isTop = position <= 3
  return (
    <span
      aria-hidden="true"
      className={[
        'flex size-8 shrink-0 items-center justify-center rounded-md font-pixel text-sm tabular-nums',
        isTop
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground',
      ].join(' ')}
    >
      {position}
    </span>
  )
}

async function TopAgents() {
  const agents = await getTopAgents()

  if (agents.length === 0) {
    return <RegistryEmptyMessage message="No agents published yet." />
  }

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-md border border-border">
      <ItemGroup className="gap-0">
        {agents.map((agent, i) => (
          <Item
            className="min-w-0 rounded-none border-0 border-border border-b last:border-b-0"
            key={agent.id}
            render={<Link href={`/agents/${agent.slug}`} />}
            variant="default"
          >
            <ItemMedia>
              <Rank position={i + 1} />
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle className="w-full min-w-0">{agent.name}</ItemTitle>
              <ItemDescription>
                {agent.authorName} · {agent.category}
              </ItemDescription>
            </ItemContent>
            <ItemActions className="shrink-0">
              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                <Download aria-hidden="true" className="size-3.5" />
                <span className="font-pixel text-foreground tabular-nums">
                  {agent.installCount}
                </span>
              </span>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}

async function TopAuthors() {
  const authors = await getTopAuthors()

  if (authors.length === 0) {
    return <RegistryEmptyMessage message="No authors yet." />
  }

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-md border border-border">
      <ItemGroup className="gap-0">
        {authors.map((author, i) => (
          <Item
            className="min-w-0 rounded-none border-0 border-border border-b last:border-b-0"
            key={author.authorUsername}
            render={<Link href={`/authors/${author.authorUsername}`} />}
            variant="default"
          >
            <ItemMedia className="gap-3">
              <Rank position={i + 1} />
              <AuthorAvatar
                className="size-9"
                name={author.authorName}
                src={author.avatarUrl}
              />
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle className="w-full min-w-0">
                {author.authorName}
              </ItemTitle>
              <ItemDescription>
                {author.agentCount}{' '}
                {author.agentCount === 1 ? 'agent' : 'agents'}
              </ItemDescription>
            </ItemContent>
            <ItemActions className="shrink-0">
              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                <Download aria-hidden="true" className="size-3.5" />
                <span className="font-pixel text-foreground tabular-nums">
                  {author.totalInstalls}
                </span>
              </span>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}

function ListSkeleton() {
  const rowIds = [
    'leaderboard-row-a',
    'leaderboard-row-b',
    'leaderboard-row-c',
    'leaderboard-row-d',
    'leaderboard-row-e',
    'leaderboard-row-f',
  ] as const

  return (
    <div className="flex flex-col gap-px overflow-hidden rounded-md border border-border">
      {rowIds.map((id) => (
        <Skeleton className="h-16 rounded-none" key={id} />
      ))}
    </div>
  )
}
