import { ArrowLeft, Download, Package } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AgentCard } from '@/components/agent-card'
import { AgentFileViewer } from '@/components/agent-file-viewer'
import { AuthorAvatar } from '@/components/author-avatar'
import { FavoriteButton } from '@/components/favorite-button'
import { InstallCommand } from '@/components/install-command'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { applyInstallCounts, getAgentRuntimeState } from '@/lib/agent-runtime'
import type { AgentWithAuthor } from '@/lib/agent-types'
import { parseDependencies } from '@/lib/agents'
import { createPageMetadata, getSiteUrl, siteConfig } from '@/lib/metadata'
import {
  buildInstallCommand,
  buildNamespacedInstallCommand,
  buildNamespaceSetupCommand,
} from '@/lib/site-url'
import {
  getStaticAgentBySlug,
  getStaticAgentFiles,
  getStaticAgentsByUser,
  listStaticAgents,
} from '@/lib/static-agents'

export function generateStaticParams() {
  const agents = listStaticAgents()
  return agents.map((agent) => ({ slug: agent.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const agent = getStaticAgentBySlug(slug)
  if (!agent) {
    return createPageMetadata({
      title: 'Agent not found',
      description: 'This evex-new registry item is no longer available.',
      path: `/agents/${slug}`,
      noIndex: true,
    })
  }

  const path = `/agents/${agent.slug}`

  return {
    title: agent.name,
    description: agent.description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: agent.name,
      description: agent.description,
      url: path,
      siteName: siteConfig.name,
      locale: 'en_US',
      type: 'article',
      publishedTime: agent.createdAt.toISOString(),
      modifiedTime: agent.updatedAt.toISOString(),
      authors: [agent.authorName],
      section: agent.category,
      tags: [agent.category, 'eve agent', 'evex-new'],
    },
    twitter: {
      card: 'summary_large_image',
      title: agent.name,
      description: agent.description,
    },
  }
}

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense fallback={<AgentDetailSkeleton />}>
      {params.then(({ slug }) => (
        <AgentDetailContent slug={slug} />
      ))}
    </Suspense>
  )
}

function AgentDetailContent({ slug }: { slug: string }) {
  const agent = getStaticAgentBySlug(slug)
  if (!agent) {
    notFound()
  }

  const files = getStaticAgentFiles(agent.slug)
  const baseUrl = getSiteUrl()
  const authorAgents = getStaticAgentsByUser(agent.userId)
  const directCommand = buildInstallCommand(baseUrl, agent.slug)
  const namespaceSetupCommand = buildNamespaceSetupCommand(baseUrl)
  const namespacedInstallCommand = buildNamespacedInstallCommand(agent.slug)
  const deps = parseDependencies(agent.dependencies)
  const moreFromAuthor = authorAgents.filter((a) => a.id !== agent.id)

  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10">
      <Link
        className="inline-flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
        href="/"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Registry
      </Link>

      <div className="mt-6 flex min-w-0 items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-foreground">
          <Package aria-hidden="true" className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-balance font-semibold text-2xl text-foreground">
              {agent.name}
            </h1>
            <Badge className="capitalize" variant="secondary">
              {agent.category}
            </Badge>
            <Suspense fallback={<AgentDetailRuntimeFallback />}>
              <AgentDetailRuntimeControls agentId={agent.id} />
            </Suspense>
          </div>
          <p className="mt-1 text-pretty text-muted-foreground">
            {agent.title}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm">
            <Link
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
              href={`/authors/${agent.userId}`}
            >
              <AuthorAvatar
                className="size-5"
                name={agent.authorName}
                src={agent.authorAvatarUrl}
              />
              by {agent.authorName}
            </Link>
            <span className="flex items-center gap-1.5">
              <Package aria-hidden="true" className="size-4" />
              {files.length} files
            </span>
          </div>
        </div>
      </div>

      <Card className="mt-8 w-full min-w-0 rounded-md border border-border p-5 shadow-[var(--shadow-card)] ring-0">
        <h2 className="font-medium text-foreground text-sm">
          Install with @evex-new
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Set up the namespace once, then add this agent by name. Run the
          command from the existing Eve app where you want the agent installed.
        </p>
        <div className="mt-3 grid gap-3">
          <div className="grid gap-1.5">
            <span className="mono-label text-muted-foreground">Setup once</span>
            <InstallCommand command={namespaceSetupCommand} />
          </div>
          <div className="grid gap-1.5">
            <span className="mono-label text-muted-foreground">
              Install agent
            </span>
            <InstallCommand command={namespacedInstallCommand} />
          </div>
          <div className="grid gap-1.5">
            <span className="mono-label text-muted-foreground">
              Direct install
            </span>
            <InstallCommand command={directCommand} />
          </div>
        </div>
      </Card>

      <section className="mt-8">
        <h2 className="font-semibold text-foreground text-lg">About</h2>
        <p className="mt-2 whitespace-pre-wrap text-pretty text-muted-foreground leading-relaxed">
          {agent.description}
        </p>
        {deps.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">Dependencies:</span>
            {deps.map((dep) => (
              <Badge className="font-mono" key={dep} variant="outline">
                {dep}
              </Badge>
            ))}
          </div>
        )}
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="mb-4 font-semibold text-foreground text-lg">Files</h2>
        <AgentFileViewer files={files} />
      </section>

      {moreFromAuthor.length > 0 && (
        <Suspense fallback={<MoreFromAuthorSkeleton />}>
          <MoreFromAuthorSection
            agents={moreFromAuthor}
            authorId={agent.userId}
            authorName={agent.authorName}
          />
        </Suspense>
      )}
    </main>
  )
}

function AgentDetailRuntimeFallback() {
  return (
    <>
      <Skeleton className="h-8 w-20 rounded-md" />
      <span className="flex items-center gap-1.5">
        <Download aria-hidden="true" className="size-4" />
        <Skeleton className="h-4 w-16" />
      </span>
    </>
  )
}

async function AgentDetailRuntimeControls({ agentId }: { agentId: string }) {
  const runtimeState = await getAgentRuntimeState([agentId])
  const installCount = runtimeState.installCounts.get(agentId) ?? 0

  return (
    <>
      <FavoriteButton
        agentId={agentId}
        initialIsFavorite={runtimeState.favoriteAgentIdSet.has(agentId)}
        isAuthenticated={runtimeState.isAuthenticated}
        showLabel
      />
      <span className="flex items-center gap-1.5">
        <Download aria-hidden="true" className="size-4" />
        {installCount} installs
      </span>
    </>
  )
}

function MoreFromAuthorSkeleton() {
  return (
    <>
      <Separator className="my-8" />
      <section>
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          {(['more-from-author-a', 'more-from-author-b'] as const).map((id) => (
            <Skeleton
              className="h-44 rounded-md border border-border"
              key={id}
            />
          ))}
        </div>
      </section>
    </>
  )
}

async function MoreFromAuthorSection({
  agents,
  authorId,
  authorName,
}: {
  agents: readonly AgentWithAuthor[]
  authorId: string
  authorName: string
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
      <Separator className="my-8" />
      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h2 className="font-semibold text-foreground text-lg">
            More From {authorName}
          </h2>
          <Link
            className="text-muted-foreground text-sm transition-colors hover:text-foreground"
            href={`/authors/${authorId}`}
          >
            View Author →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {agentsWithInstalls.map((agent) => (
            <AgentCard
              agent={agent}
              isAuthenticated={runtimeState.isAuthenticated}
              isFavorite={runtimeState.favoriteAgentIdSet.has(agent.id)}
              key={agent.id}
            />
          ))}
        </div>
      </section>
    </>
  )
}

function AgentDetailSkeleton() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10">
      <Skeleton className="h-5 w-32" />
      <div className="mt-6 flex min-w-0 items-start gap-4">
        <Skeleton className="size-14 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-8 w-full max-w-56" />
          <Skeleton className="h-4 w-full max-w-72" />
          <Skeleton className="h-4 w-full max-w-48" />
        </div>
      </div>
      <Skeleton className="mt-8 h-28 rounded-md border border-border" />
      <Skeleton className="mt-8 h-32 rounded-md border border-border" />
      <Skeleton className="mt-8 h-64 rounded-md border border-border" />
    </main>
  )
}
