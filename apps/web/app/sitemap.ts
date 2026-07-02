import type { MetadataRoute } from 'next'
import { listLearnPages } from '@/lib/learn-content'
import { getSiteUrl } from '@/lib/metadata'
import { getAuthorUrl, getLearnUrl } from '@/lib/site-url'
import { listStaticAgents } from '@/lib/static-agents'

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

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const now = new Date()
  const agents = listStaticAgents()
  const learnPages = listLearnPages()
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
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/leaderboard`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/learn`,
      lastModified: now,
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
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...agentRoutes, ...authorRoutes, ...learnRoutes]
}
