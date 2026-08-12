import { Button } from '@evex/ui/button'
import { Skeleton } from '@evex/ui/skeleton'
import { ArrowLeft, Globe } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { type ReactNode, Suspense } from 'react'
import { AgentCard } from '@/components/agent-card'
import { AuthorAvatar } from '@/components/author-avatar'
import { GitHubIcon } from '@/components/github-icon'
import { JsonLd } from '@/components/json-ld'
import { LinkedInIcon } from '@/components/linkedin-icon'
import { XIcon } from '@/components/x-icon'
import type { AgentWithAuthor, StaticAuthorProfile } from '@/lib/agent-types'
import {
  getAuthorMetaDescription,
  getAuthorMetadataTitle,
} from '@/lib/author-detail'
import { applyInstallCounts, getAgentRuntimeState } from '@/lib/data/agents'
import { getAuthorProfile } from '@/lib/data/authors'
import {
  defaultOpenGraphImage,
  defaultTwitterImage,
  siteConfig,
  siteTwitterHandle,
} from '@/lib/metadata'
import {
  getStaticAgentsByAuthorUsername,
  listStaticAgents,
} from '@/lib/registry'
import {
  createAuthorBreadcrumbSchema,
  createAuthorProfileSchema,
} from '@/lib/structured-data'

export function generateStaticParams() {
  const agents = listStaticAgents()
  return [
    ...new Set(
      agents
        .map((agent) => agent.authorUsername)
        .filter((username): username is string => Boolean(username)),
    ),
  ].map((githubUsername) => ({
    githubUsername,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ githubUsername: string }>
}): Promise<Metadata> {
  const { githubUsername } = await params
  const author = await getAuthorProfile(githubUsername)
  if (!author) {
    // Unknown authors render the not-found page. With cacheComponents the
    // fallback shell still streams a 200, but Next injects a robots noindex
    // meta into that response, keeping arbitrary URLs out of the index.
    notFound()
  }

  const title = getAuthorMetadataTitle(author)
  const description = getAuthorMetaDescription(author)
  const path = `/authors/${author.githubUsername}`

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: 'en_US',
      type: 'website',
      images: [defaultOpenGraphImage],
    },
    twitter: {
      card: 'summary_large_image',
      site: siteTwitterHandle,
      creator: siteTwitterHandle,
      title,
      description,
      images: [defaultTwitterImage],
    },
  }
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ githubUsername: string }>
}) {
  const { githubUsername } = await params

  // An author page exists only for authors with agents in the static
  // registry (same condition getAuthorProfile uses). Checking it before the
  // Suspense boundary renders the not-found page (with its noindex meta)
  // instead of streaming the author skeleton first.
  if (getStaticAgentsByAuthorUsername(githubUsername).length === 0) {
    notFound()
  }

  return (
    <Suspense fallback={<AuthorSkeleton />}>
      <AuthorContent githubUsername={githubUsername} />
    </Suspense>
  )
}

async function AuthorContent({ githubUsername }: { githubUsername: string }) {
  const author = await getAuthorProfile(githubUsername)
  const agents = getStaticAgentsByAuthorUsername(githubUsername)
  if (!author) {
    notFound()
  }

  return (
    <>
      <JsonLd
        data={[
          createAuthorProfileSchema(
            {
              agentCount: author.agentCount,
              bio: author.bio,
              githubUsername: author.githubUsername,
              name: author.name,
              totalInstalls: author.totalInstalls,
            },
            agents,
          ),
          createAuthorBreadcrumbSchema({
            githubUsername: author.githubUsername,
            name: author.name,
          }),
        ]}
      />
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
            <p className="mt-1 text-muted-foreground text-sm">
              @{author.githubUsername}
            </p>
            {author.bio ? (
              <p className="mt-3 max-w-xl whitespace-pre-wrap text-pretty text-muted-foreground leading-relaxed">
                {author.bio}
              </p>
            ) : null}
            <p className="mt-3 max-w-xl text-pretty text-muted-foreground leading-relaxed">
              {author.agentCount} {author.agentCount === 1 ? 'agent' : 'agents'}{' '}
              published on evex with {author.totalInstalls} total installs.
            </p>
            <AuthorProfileLinks author={author} />
          </div>
        </header>

        <section className="mt-10">
          <h2 className="font-semibold text-foreground text-lg">
            Agents{' '}
            <span className="font-pixel text-muted-foreground tabular-nums">
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
    </>
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

function AuthorProfileLinks({ author }: { author: StaticAuthorProfile }) {
  const links: { href: string; icon: ReactNode; label: string }[] = []

  if (author.githubUrl) {
    links.push({
      href: author.githubUrl,
      icon: <GitHubIcon className="size-4" />,
      label: 'GitHub',
    })
  }

  if (author.websiteUrl) {
    links.push({
      href: author.websiteUrl,
      icon: <Globe aria-hidden="true" className="size-4" />,
      label: 'Website',
    })
  }

  if (author.twitterUrl) {
    links.push({
      href: author.twitterUrl,
      icon: <XIcon className="size-4" />,
      label: 'X',
    })
  }

  if (author.linkedinUrl) {
    links.push({
      href: author.linkedinUrl,
      icon: <LinkedInIcon className="size-4" />,
      label: 'LinkedIn',
    })
  }

  if (links.length === 0) {
    return null
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {links.map((link) => (
        <Button
          key={link.label}
          render={
            <a href={link.href} rel="noreferrer noopener" target="_blank">
              {link.icon}
              {link.label}
            </a>
          }
          size="sm"
          variant="outline"
        />
      ))}
    </div>
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
