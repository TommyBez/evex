import { Button } from '@evex/ui/button'
import { Skeleton } from '@evex/ui/skeleton'
import { Heart, PackageSearch } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { AgentCard } from '@/components/agent-card'
import { RegistryEmptyState } from '@/components/registry-empty-state'
import { getCurrentUser } from '@/lib/current-user'
import { createPageMetadata } from '@/lib/metadata'
import { getFavoriteAgents } from '@/lib/queries'

export const metadata = createPageMetadata({
  title: 'Favorites',
  description: 'Your saved eve agents on evex.',
  path: '/favorites',
  noIndex: true,
})

const FAVORITE_SKELETON_CARD_IDS = [
  'favorite-card-a',
  'favorite-card-b',
  'favorite-card-c',
  'favorite-card-d',
  'favorite-card-e',
  'favorite-card-f',
] as const

export default function FavoritesPage() {
  return (
    <Suspense fallback={<FavoritesSkeleton />}>
      <FavoritesContent />
    </Suspense>
  )
}

async function FavoritesContent() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  const agents = await getFavoriteAgents(user.id)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-col gap-3">
        <span className="mono-label inline-flex items-center gap-2 text-muted-foreground">
          <Heart aria-hidden="true" className="size-4 text-brand" />
          favorites
        </span>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-semibold text-3xl text-foreground">
              Saved Agents
            </h1>
            <p className="mt-1 text-muted-foreground">
              Agents you have saved for later.
            </p>
          </div>
          <Button
            className="w-fit"
            render={<Link href="/">Browse Agents</Link>}
            variant="outline"
          />
        </div>
      </header>

      {agents.length === 0 ? (
        <RegistryEmptyState
          className="mt-10"
          description="Save agents from the registry to build your shortlist."
          icon={PackageSearch}
          title="No Favorites Yet"
        >
          <Button render={<Link href="/">Browse Agents</Link>} />
        </RegistryEmptyState>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              agent={agent}
              isAuthenticated
              isFavorite
              key={agent.id}
            />
          ))}
        </div>
      )}
    </main>
  )
}

function FavoritesSkeleton() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
      <div className="w-full min-w-0 space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-full max-w-64" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FAVORITE_SKELETON_CARD_IDS.map((id) => (
          <Skeleton className="h-44 rounded-md border border-border" key={id} />
        ))}
      </div>
    </main>
  )
}
