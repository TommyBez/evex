import type { MetadataRoute } from 'next'
import { listDocsPages, listDocsSubPages } from '@/lib/docs-content'
import { listLearnPages } from '@/lib/learn-content'
import { listStaticAgents } from '@/lib/registry'
import { getAuthorUrl, getLearnUrl, getSiteUrl } from '@/lib/site-url'

function getAuthorLastModified(
  githubUsername: string,
  agents: ReturnType<typeof listStaticAgents>,
): Date {
  const authorAgents = agents.filter(
    (agent) => agent.authorUsername === githubUsername,
  )

  if (authorAgents.length === 0) {
    return new Date(0)
  }

  return authorAgents.reduce(
    (latest, agent) =>
      agent.updatedAt.getTime() > latest.getTime() ? agent.updatedAt : latest,
    authorAgents[0].updatedAt,
  )
}

function latestDate(dates: readonly Date[]): Date {
  return dates.reduce(
    (latest, date) => (date.getTime() > latest.getTime() ? date : latest),
    new Date(0),
  )
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const agents = listStaticAgents()
  const learnPages = listLearnPages()
  const docsPages = listDocsPages()
  const latestDocsUpdate = latestDate(
    docsPages.map((page) => new Date(page.dateModified)),
  )
  // Stable lastmod values: a build timestamp changes on every deploy and
  // teaches crawlers to distrust the field. Derive dates from content.
  const latestAgentUpdate = latestDate(agents.map((agent) => agent.updatedAt))
  const latestLearnUpdate = latestDate(
    learnPages.map((page) => new Date(page.dateModified)),
  )
  const authorUsernames = [
    ...new Set(
      agents
        .map((agent) => agent.authorUsername)
        .filter((username): username is string => Boolean(username)),
    ),
  ]

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: latestAgentUpdate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/leaderboard`,
      lastModified: latestAgentUpdate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/learn`,
      lastModified: latestLearnUpdate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/docs`,
      lastModified: latestDocsUpdate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const agentRoutes: MetadataRoute.Sitemap = agents.map((agent) => ({
    url: `${siteUrl}/agents/${agent.slug}`,
    lastModified: agent.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const authorRoutes: MetadataRoute.Sitemap = authorUsernames.map(
    (githubUsername) => ({
      url: getAuthorUrl(githubUsername),
      lastModified: getAuthorLastModified(githubUsername, agents),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }),
  )

  const learnRoutes: MetadataRoute.Sitemap = learnPages.map((page) => ({
    url: getLearnUrl(page.slug),
    lastModified: new Date(page.dateModified),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const docsRoutes: MetadataRoute.Sitemap = listDocsSubPages().map((page) => ({
    url: `${siteUrl}/docs/${page.slug}`,
    lastModified: new Date(page.dateModified),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...agentRoutes,
    ...authorRoutes,
    ...learnRoutes,
    ...docsRoutes,
  ]
}
