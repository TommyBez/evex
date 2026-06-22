import { ArrowLeft, Globe } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AgentCard } from '@/components/agent-card'
import { AuthorAvatar } from '@/components/author-avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  applyInstallCounts,
  getAgentRuntimeState,
  sumInstallCounts,
} from '@/lib/agent-runtime'
import type { AgentWithAuthor } from '@/lib/agent-types'
import { createPageMetadata, siteConfig } from '@/lib/metadata'
import {
  getStaticAgentsByUser,
  getStaticAuthorProfile,
  listStaticAgents,
} from '@/lib/static-agents'

export function generateStaticParams() {
  const agents = listStaticAgents()
  return [...new Set(agents.map((agent) => agent.userId))].map((authorId) => ({
    authorId,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ authorId: string }>
}): Promise<Metadata> {
  const { authorId } = await params
  const author = getStaticAuthorProfile(authorId)
  if (!author) {
    return createPageMetadata({
      title: 'Author not found',
      description: 'This evex-new author is no longer available.',
      path: `/authors/${authorId}`,
      noIndex: true,
    })
  }

  const description = `${author.name}'s eve agents on evex-new`
  const path = `/authors/${author.userId}`

  return {
    title: author.name,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: author.name,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: author.name,
      description,
    },
  }
}

export default function AuthorPage({
  params,
}: {
  params: Promise<{ authorId: string }>
}) {
  return (
    <Suspense fallback={<AuthorSkeleton />}>
      {params.then(({ authorId }) => (
        <AuthorContent authorId={authorId} />
      ))}
    </Suspense>
  )
}

function AuthorContent({ authorId }: { authorId: string }) {
  const author = getStaticAuthorProfile(authorId)
  const agents = getStaticAgentsByUser(authorId)
  if (!author) {
    notFound()
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10">
      <Link
        className="inline-flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
        href="/"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Registry
      </Link>

      <header className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <AuthorAvatar
          className="size-20 text-3xl"
          name={author.name}
          src={author.avatarUrl}
        />
        <div className="w-full min-w-0">
          <h1 className="text-balance font-semibold text-2xl text-foreground">
            {author.name}
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-muted-foreground leading-relaxed">
            {author.agentCount} {author.agentCount === 1 ? 'agent' : 'agents'}{' '}
            published on evex-new
            <Suspense fallback={<span>.</span>}>
              <AuthorInstallSummary agents={agents} />
            </Suspense>
          </p>
          {author.url ? (
            <Button
              className="mt-4"
              render={
                <a href={author.url} rel="noreferrer noopener" target="_blank">
                  <Globe aria-hidden="true" className="size-4" />
                  Website
                </a>
              }
              size="sm"
              variant="outline"
            />
          ) : null}
        </div>
      </header>

      <section className="mt-10">
        <h2 className="font-semibold text-foreground text-lg">
          Agents{' '}
          <span className="font-normal text-muted-foreground tabular-nums">
            ({agents.length})
          </span>
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<AuthorAgentGridSkeleton />}>
            <AuthorAgentGrid agents={agents} />
          </Suspense>
        </div>
      </section>
    </main>
  )
}

async function AuthorInstallSummary({
  agents,
}: {
  agents: readonly AgentWithAuthor[]
}) {
  const runtimeState = await getAgentRuntimeState(
    agents.map((agent) => agent.id),
  )
  return (
    <> with {sumInstallCounts(runtimeState.installCounts)} total installs.</>
  )
}

async function AuthorAgentGrid({
  agents,
}: {
  agents: readonly AgentWithAuthor[]
}) {
  const runtimeState = await getAgentRuntimeState(
    agents.map((agent) => agent.id),
  )
  const agentsWithInstalls = applyInstallCounts(
    agents,
    runtimeState.installCounts,
  )

  return (
    <>
      {agentsWithInstalls.map((agent) => (
        <AgentCard
          agent={agent}
          isAuthenticated={runtimeState.isAuthenticated}
          isFavorite={runtimeState.favoriteAgentIdSet.has(agent.id)}
          key={agent.id}
        />
      ))}
    </>
  )
}

function AuthorAgentGridSkeleton() {
  return (
    <>
      {(['author-card-a', 'author-card-b', 'author-card-c'] as const).map(
        (id) => (
          <Skeleton className="h-44 rounded-md border border-border" key={id} />
        ),
      )}
    </>
  )
}

function AuthorSkeleton() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10">
      <Skeleton className="h-5 w-32" />
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <Skeleton className="size-20 shrink-0 rounded-full" />
        <div className="w-full min-w-0 space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full max-w-72" />
          <Skeleton className="h-9 w-full max-w-28" />
        </div>
      </div>
      <div className="mt-10 space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(['author-card-a', 'author-card-b', 'author-card-c'] as const).map(
            (id) => (
              <Skeleton
                className="h-44 rounded-md border border-border"
                key={id}
              />
            ),
          )}
        </div>
      </div>
    </main>
  )
}
