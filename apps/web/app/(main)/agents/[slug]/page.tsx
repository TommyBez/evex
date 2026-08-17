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
import { JsonLd } from '@/components/json-ld'
import { MobileInstallBar } from '@/components/mobile-install-bar'
import { StickyInstallCta } from '@/components/sticky-install-cta'
import {
  compareRelatedAgents,
  countFilesByKind,
  getAgentDefinitionBlock,
  getAgentInstallSummaryDescription,
  getAgentMetaDescription,
  getAgentMetadataTitle,
  getAgentOgImageAlt,
  pluralize,
} from '@/lib/agent-detail'
import type { AgentRegistryFile, AgentWithAuthor } from '@/lib/agent-types'
import { parseDependencies } from '@/lib/agents'
import { getCurrentUserIdentity } from '@/lib/current-user'
import { applyInstallCounts, getAgentRuntimeState } from '@/lib/data/agents'
import { isSameGithubUsername } from '@/lib/github'
import { siteConfig, siteTwitterHandle } from '@/lib/metadata'
import {
  getStaticAgentBySlug,
  getStaticAgentFiles,
  getStaticAgentsByAuthorUsername,
  listStaticAgents,
} from '@/lib/registry'
import {
  createAgentBreadcrumbSchema,
  createAgentFaqSchema,
  createAgentSoftwareSchema,
} from '@/lib/structured-data'

export function generateStaticParams() {
  const agents = listStaticAgents()
  return agents.map((agent) => ({ slug: agent.slug }))
}

const MAX_RELATED_AGENTS = 3
const UPDATED_DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatUpdatedDate(date: Date): string {
  return UPDATED_DATE_FORMATTER.format(date)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const agent = getStaticAgentBySlug(slug)
  if (!agent) {
    // Unknown slugs render the not-found page. With cacheComponents the
    // fallback shell still streams a 200, but Next injects a robots noindex
    // meta into that response, keeping arbitrary URLs out of the index.
    notFound()
  }

  const path = `/agents/${agent.slug}`
  const title = getAgentMetadataTitle(agent)
  const description = getAgentMetaDescription(agent)
  const ogImage = {
    url: `${path}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: getAgentOgImageAlt(agent),
  }

  return {
    title,
    description,
    keywords: [
      agent.name,
      `@evex/${agent.slug}`,
      agent.category,
      'eve agent',
      'vercel eve',
      'shadcn registry',
    ],
    alternates: {
      canonical: path,
      types: {
        'text/markdown': `${path}.md`,
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: 'en_US',
      type: 'article',
      publishedTime: agent.createdAt.toISOString(),
      modifiedTime: agent.updatedAt.toISOString(),
      authors: [agent.authorName],
      section: agent.category,
      tags: [agent.category, 'eve agent', 'evex'],
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      site: siteTwitterHandle,
      creator: siteTwitterHandle,
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // Resolve the agent before the Suspense boundary so unknown slugs render
  // the not-found page (with its noindex meta) instead of streaming the
  // agent skeleton first.
  const { slug } = await params
  const agent = getStaticAgentBySlug(slug)
  if (!agent) {
    notFound()
  }

  return (
    <Suspense fallback={<AgentDetailSkeleton />}>
      <AgentDetailContent agent={agent} />
    </Suspense>
  )
}

async function AgentDetailContent({ agent }: { agent: AgentWithAuthor }) {
  // Resolve the viewer alongside the files (not after) so the author check
  // costs one round trip, not two. The verified GitHub username lives on the
  // user row, not the session payload, hence getCurrentUserIdentity.
  const [files, viewer] = await Promise.all([
    getStaticAgentFiles(agent.slug),
    getCurrentUserIdentity(),
  ])
  // Installs by the agent's own author are not demand. Every install-intent
  // event on this page carries this flag so the north star metric can exclude
  // them. Null when authorship cannot be resolved (signed out, or either
  // username missing): unknown is never reported as a verified non-author.
  const viewerIsAuthor = isSameGithubUsername(
    viewer?.githubUsername,
    agent.authorUsername,
  )
  const authorAgents = agent.authorUsername
    ? getStaticAgentsByAuthorUsername(agent.authorUsername)
    : []
  const relatedCandidates = listStaticAgents().filter((a) => a.id !== agent.id)
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
            <Link
              aria-label={`Browse ${agent.category} agents`}
              href={`/?category=${agent.category}`}
            >
              <Badge
                className="capitalize transition-colors hover:bg-muted hover:text-foreground"
                variant="secondary"
              >
                {agent.category}
              </Badge>
            </Link>
            <Suspense fallback={<AgentDetailRuntimeFallback />}>
              <AgentDetailRuntimeSection
                agent={agent}
                viewerIsAuthor={viewerIsAuthor}
              />
            </Suspense>
          </div>
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

      <StickyInstallCta
        agentAuthor={agent.authorUsername}
        className="mt-6"
        slug={agent.slug}
        viewerIsAuthor={viewerIsAuthor}
      />

      <AgentDefinitionSection agent={agent} />
      <p className="mt-1 max-w-2xl text-pretty text-muted-foreground">
        <AgentDescription>{agent.description}</AgentDescription>
      </p>

      <Card className="mt-8 w-full min-w-0 rounded-md border border-border p-5 shadow-[var(--shadow-card)] ring-0">
        <h2 className="font-medium text-foreground text-sm">
          Other package managers
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Prefer pnpm, yarn, or bun? Copy the matching install command.
        </p>
        <div className="mt-4">
          <InstallCommand
            agentAuthor={agent.authorUsername}
            label={`${agent.name} install command`}
            slug={agent.slug}
            viewerIsAuthor={viewerIsAuthor}
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

      <AgentDocsSection agent={agent} />

      <Separator className="my-8" />

      <section>
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
            viewerGithubUsername={viewer?.githubUsername ?? null}
          />
        </Suspense>
      )}

      <MobileInstallBar
        agentAuthor={agent.authorUsername}
        label={`${agent.name} install command (quick copy)`}
        slug={agent.slug}
        viewerIsAuthor={viewerIsAuthor}
      />
    </main>
  )
}

function AgentDefinitionSection({ agent }: { agent: AgentWithAuthor }) {
  const definition = getAgentDefinitionBlock(agent)

  return (
    <section className="mt-4 max-w-2xl">
      <h2 className="font-semibold text-foreground text-lg">
        {definition.heading}
      </h2>
      <p className="mt-2 text-pretty text-muted-foreground leading-relaxed">
        {definition.beforeCommand}
        <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground">
          {definition.installCommand}
        </code>
        {definition.afterCommand}
      </p>
    </section>
  )
}

function AgentDocsSection({ agent }: { agent: AgentWithAuthor }) {
  const { docs } = agent
  if (!docs) {
    return null
  }

  const faqSchema = createAgentFaqSchema(agent)

  return (
    <>
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
      <Separator className="my-8" />
      <section>
        <h2 className="font-semibold text-foreground text-lg">
          About {agent.name}
        </h2>
        <div className="mt-3 grid gap-3 text-muted-foreground leading-relaxed">
          {docs.overview.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-foreground text-lg">How it works</h2>
        <ol className="mt-3 grid list-decimal gap-2 pl-5 text-muted-foreground leading-relaxed">
          {docs.howItWorks.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-foreground text-lg">Use cases</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {docs.useCases.map((useCase) => (
            <div
              className="rounded-md border border-border bg-background p-4"
              key={useCase.title}
            >
              <h3 className="font-medium text-foreground">{useCase.title}</h3>
              <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                {useCase.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {docs.requirements.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold text-foreground text-lg">
            Requirements
          </h2>
          <dl className="mt-3 grid gap-px overflow-hidden rounded-md border border-border bg-border">
            {docs.requirements.map((requirement) => (
              <div className="bg-background p-3" key={requirement.name}>
                <dt className="font-medium font-mono text-foreground text-sm">
                  {requirement.name}
                </dt>
                <dd className="mt-1 text-muted-foreground text-sm leading-relaxed">
                  {requirement.body}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-semibold text-foreground text-lg">FAQ</h2>
        <div className="mt-3 divide-y divide-border rounded-md border border-border">
          {docs.faqs.map((faq) => (
            <div className="p-4" key={faq.question}>
              <h3 className="font-medium text-foreground">{faq.question}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

async function AgentDetailRuntimeSection({
  agent,
  viewerIsAuthor,
}: {
  agent: AgentWithAuthor
  viewerIsAuthor: boolean | null
}) {
  const runtimeState = await getAgentRuntimeState([agent.id])
  const installCount = runtimeState.installCounts.get(agent.id) ?? 0

  return (
    <>
      <JsonLd
        data={[
          createAgentSoftwareSchema(agent, installCount),
          createAgentBreadcrumbSchema(agent),
        ]}
      />
      <FavoriteButton
        agentAuthor={agent.authorUsername}
        agentId={agent.id}
        initialIsFavorite={runtimeState.favoriteAgentIdSet.has(agent.id)}
        isAuthenticated={runtimeState.isAuthenticated}
        key={`${agent.id}:${runtimeState.favoriteAgentIdSet.has(agent.id)}`}
        showLabel
        viewerIsAuthor={viewerIsAuthor}
      />
      <span className="flex items-center gap-1.5">
        <Download aria-hidden="true" className="size-4" />
        <span className="font-pixel tabular-nums">{installCount}</span> installs
      </span>
    </>
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
  viewerGithubUsername,
}: {
  agents: readonly AgentWithAuthor[]
  authorName: string
  authorUsername: string
  currentAgent: AgentWithAuthor
  moreFromAuthorCount: number
  viewerGithubUsername: string | null
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
              viewerIsAuthor={isSameGithubUsername(
                viewerGithubUsername,
                agent.authorUsername,
              )}
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
      <Skeleton className="mt-6 h-28 rounded-md border border-border" />
      <Skeleton className="mt-8 h-28 rounded-md border border-border" />
      <Skeleton className="mt-8 h-32 rounded-md border border-border" />
      <Skeleton className="mt-8 h-64 rounded-md border border-border" />
    </main>
  )
}
