import { Badge } from '@evex/ui/badge'
import { Card } from '@evex/ui/card'
import { Separator } from '@evex/ui/separator'
import { Skeleton } from '@evex/ui/skeleton'
import { ArrowLeft, Download, Package } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AgentCard } from '@/components/agent-card'
import { AgentDescription } from '@/components/agent-description'
import { AgentFileViewer } from '@/components/agent-file-viewer'
import { AuthorAvatar } from '@/components/author-avatar'
import { FavoriteButton } from '@/components/favorite-button'
import { InstallCommand } from '@/components/install-command'
import { MobileInstallBar } from '@/components/mobile-install-bar'
import { applyInstallCounts, getAgentRuntimeState } from '@/lib/agent-runtime'
import type { AgentRegistryFile, AgentWithAuthor } from '@/lib/agent-types'
import { parseDependencies } from '@/lib/agents'
import { createPageMetadata, siteConfig } from '@/lib/metadata'
import { buildInstallCommand } from '@/lib/site-url'
import {
  getStaticAgentBySlug,
  getStaticAgentFiles,
  getStaticAgentsByAuthorUsername,
  listStaticAgents,
} from '@/lib/static-agents'

export function generateStaticParams() {
  const agents = listStaticAgents()
  return agents.map((agent) => ({ slug: agent.slug }))
}

const MAX_RELATED_AGENTS = 3
const METADATA_TITLE_MAX_LENGTH = 60
const SUBAGENT_PATH_REGEX = /^agent\/subagents\/([^/]+)/
const SKILL_PATH_REGEX = /\/skills\//
const TOOL_PATH_REGEX = /\/tools\//
const UPDATED_DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

function formatUpdatedDate(date: Date): string {
  return UPDATED_DATE_FORMATTER.format(date)
}

function countFilesByKind(files: readonly AgentRegistryFile[]) {
  const subagentNames = new Set<string>()
  let skills = 0
  let tools = 0

  for (const file of files) {
    const subagentMatch = file.path.match(SUBAGENT_PATH_REGEX)
    if (subagentMatch?.[1]) {
      subagentNames.add(subagentMatch[1])
      continue
    }

    if (SKILL_PATH_REGEX.test(file.path)) {
      skills += 1
      continue
    }

    if (TOOL_PATH_REGEX.test(file.path)) {
      tools += 1
    }
  }

  return {
    skills,
    subagents: subagentNames.size,
    tools,
  }
}

function getAgentInstallSummaryDescription({
  deps,
  fileKinds,
}: {
  deps: readonly string[]
  fileKinds: ReturnType<typeof countFilesByKind>
}) {
  const fileParts = [
    fileKinds.subagents > 0 ? pluralize(fileKinds.subagents, 'subagent') : null,
    fileKinds.skills > 0 ? pluralize(fileKinds.skills, 'skill file') : null,
    fileKinds.tools > 0 ? pluralize(fileKinds.tools, 'tool') : null,
  ].filter((part): part is string => Boolean(part))

  return {
    installs:
      fileParts.length > 0 ? fileParts.join(' · ') : 'Core agent files only',
    requires: deps.length > 0 ? deps.join(', ') : 'Runs on the eve baseline',
  }
}

function getAgentMetadataTitle(agent: AgentWithAuthor): string {
  const installTitle = `${agent.name} - install @evex/${agent.slug}`
  if (installTitle.length <= METADATA_TITLE_MAX_LENGTH) {
    return installTitle
  }

  const compactTitle = `${agent.name} - @evex/${agent.slug}`
  if (compactTitle.length <= METADATA_TITLE_MAX_LENGTH) {
    return compactTitle
  }

  return `${agent.name} | evex`
}

function compareRelatedAgents(
  currentAgent: AgentWithAuthor,
  installCounts: ReadonlyMap<string, number>,
) {
  return (left: AgentWithAuthor, right: AgentWithAuthor) => {
    const leftCategoryMatch = left.category === currentAgent.category ? 1 : 0
    const rightCategoryMatch = right.category === currentAgent.category ? 1 : 0

    if (leftCategoryMatch !== rightCategoryMatch) {
      return rightCategoryMatch - leftCategoryMatch
    }

    const leftInstalls = installCounts.get(left.id) ?? 0
    const rightInstalls = installCounts.get(right.id) ?? 0
    if (leftInstalls !== rightInstalls) {
      return rightInstalls - leftInstalls
    }

    const leftUpdatedAt = left.updatedAt.getTime()
    const rightUpdatedAt = right.updatedAt.getTime()
    if (leftUpdatedAt !== rightUpdatedAt) {
      return rightUpdatedAt - leftUpdatedAt
    }

    const currentAuthor = currentAgent.authorUsername?.toLowerCase() ?? ''
    const leftAuthorMatch =
      left.authorUsername?.toLowerCase() === currentAuthor ? 1 : 0
    const rightAuthorMatch =
      right.authorUsername?.toLowerCase() === currentAuthor ? 1 : 0
    if (leftAuthorMatch !== rightAuthorMatch) {
      return rightAuthorMatch - leftAuthorMatch
    }

    return left.name.localeCompare(right.name)
  }
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
      description: 'This evex registry item is no longer available.',
      path: `/agents/${slug}`,
      noIndex: true,
    })
  }

  const path = `/agents/${agent.slug}`
  const title = getAgentMetadataTitle(agent)

  return {
    title,
    description: agent.description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description: agent.description,
      url: path,
      siteName: siteConfig.name,
      locale: 'en_US',
      type: 'article',
      publishedTime: agent.createdAt.toISOString(),
      modifiedTime: agent.updatedAt.toISOString(),
      authors: [agent.authorName],
      section: agent.category,
      tags: [agent.category, 'eve agent', 'evex'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
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
  const authorAgents = agent.authorUsername
    ? getStaticAgentsByAuthorUsername(agent.authorUsername)
    : []
  const relatedCandidates = listStaticAgents().filter((a) => a.id !== agent.id)
  const installCommand = buildInstallCommand(agent.slug)
  const deps = parseDependencies(agent.dependencies)
  const fileKinds = countFilesByKind(files)
  const moreFromAuthorCount = authorAgents.filter(
    (a) => a.id !== agent.id,
  ).length

  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl px-4 pt-10 pb-28 sm:pb-10">
      <Link
        className="inline-flex min-h-9 items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
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
          <p className="mt-1 max-w-2xl text-pretty text-muted-foreground">
            <AgentDescription>{agent.description}</AgentDescription>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm">
            {agent.authorUsername ? (
              <Link
                className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                href={`/authors/${agent.authorUsername}`}
              >
                <AuthorAvatar
                  className="size-5"
                  name={agent.authorName}
                  src={agent.authorAvatarUrl}
                />
                by {agent.authorName}
              </Link>
            ) : (
              <span className="flex items-center gap-1.5">
                <AuthorAvatar
                  className="size-5"
                  name={agent.authorName}
                  src={agent.authorAvatarUrl}
                />
                by {agent.authorName}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Package aria-hidden="true" className="size-4" />
              {files.length} files
            </span>
          </div>
        </div>
      </div>

      <Card className="mt-8 w-full min-w-0 rounded-md border border-border p-5 shadow-[var(--shadow-card)] ring-0">
        <h2 className="font-medium text-foreground text-sm">Install</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Run this command in your eve app to add the agent.
        </p>
        <div className="mt-4">
          <InstallCommand
            command={installCommand}
            label={`${agent.name} install command`}
          />
        </div>
        <AgentInstallSummary agent={agent} deps={deps} files={files} />
      </Card>

      <section className="mt-8">
        <h2 className="font-semibold text-foreground text-lg">
          What&apos;s included
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{pluralize(files.length, 'file')}</Badge>
          {fileKinds.subagents > 0 ? (
            <Badge variant="outline">
              {pluralize(fileKinds.subagents, 'subagent')}
            </Badge>
          ) : null}
          {fileKinds.skills > 0 ? (
            <Badge variant="outline">
              {pluralize(fileKinds.skills, 'skill file')}
            </Badge>
          ) : null}
          {fileKinds.tools > 0 ? (
            <Badge variant="outline">
              {pluralize(fileKinds.tools, 'tool')}
            </Badge>
          ) : null}
        </div>
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
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-semibold text-foreground text-lg">Files</h2>
          <span className="mono-label font-pixel text-muted-foreground/70 tabular-nums">
            {files.length}
          </span>
        </div>
        <AgentFileViewer files={files} />
      </section>

      {relatedCandidates.length > 0 && (
        <Suspense fallback={<RelatedAgentsSkeleton />}>
          <RelatedAgentsSection
            agents={relatedCandidates}
            authorName={agent.authorName}
            authorUsername={agent.authorUsername ?? ''}
            currentAgent={agent}
            moreFromAuthorCount={moreFromAuthorCount}
          />
        </Suspense>
      )}

      <MobileInstallBar
        command={installCommand}
        label={`${agent.name} install command (quick copy)`}
      />
    </main>
  )
}

function AgentInstallSummary({
  agent,
  deps,
  files,
}: {
  agent: AgentWithAuthor
  deps: readonly string[]
  files: readonly AgentRegistryFile[]
}) {
  const fileKinds = countFilesByKind(files)
  const descriptions = getAgentInstallSummaryDescription({ deps, fileKinds })
  const summaryItems = [
    {
      label: 'Category',
      value: agent.category,
      description: `${agent.category} agents and workflows`,
    },
    {
      label: 'Files',
      value: pluralize(files.length, 'file'),
      description: descriptions.installs,
    },
    {
      label: 'Requires',
      value:
        deps.length > 0
          ? pluralize(deps.length, 'dependency', 'dependencies')
          : 'No extras',
      description: descriptions.requires,
    },
    {
      label: 'Updated',
      value: formatUpdatedDate(agent.updatedAt),
      description: 'Source-owned registry metadata',
    },
  ]

  return (
    <dl className="mt-4 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
      {summaryItems.map((item) => (
        <div className="min-w-0 bg-background p-3" key={item.label}>
          <dt className="mono-label text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 font-medium text-foreground text-sm capitalize">
            {item.value}
          </dd>
          <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
            {item.description}
          </p>
        </div>
      ))}
    </dl>
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
        key={`${agentId}:${runtimeState.favoriteAgentIdSet.has(agentId)}`}
        showLabel
      />
      <span className="flex items-center gap-1.5">
        <Download aria-hidden="true" className="size-4" />
        <span className="font-pixel tabular-nums">{installCount}</span> installs
      </span>
    </>
  )
}

function RelatedAgentsSkeleton() {
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

async function RelatedAgentsSection({
  agents,
  authorName,
  authorUsername,
  currentAgent,
  moreFromAuthorCount,
}: {
  agents: readonly AgentWithAuthor[]
  authorName: string
  authorUsername: string
  currentAgent: AgentWithAuthor
  moreFromAuthorCount: number
}) {
  const runtimeState = await getAgentRuntimeState(
    agents.map((agent) => agent.id),
  )
  const agentsWithInstalls = applyInstallCounts(
    agents,
    runtimeState.installCounts,
  )
    .sort(compareRelatedAgents(currentAgent, runtimeState.installCounts))
    .slice(0, MAX_RELATED_AGENTS)

  return (
    <>
      <Separator className="my-8" />
      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h2 className="font-semibold text-foreground text-lg">
            Related Agents
          </h2>
          {authorUsername ? (
            <Link
              className="text-muted-foreground text-sm transition-colors hover:text-foreground"
              href={`/authors/${authorUsername}`}
            >
              {moreFromAuthorCount > MAX_RELATED_AGENTS
                ? `View all ${moreFromAuthorCount} by ${authorName} →`
                : `View ${authorName} →`}
            </Link>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
