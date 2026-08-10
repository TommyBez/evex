import 'server-only'

import { eq, inArray, sql } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'
import type { StaticAuthorProfile } from '@/lib/agent-types'
import { cacheTags, getAuthorAgentsTag } from '@/lib/cache-tags'
import { getInstallCountMap } from '@/lib/data/install-metrics'
import { db } from '@/lib/db'
import { profile, user } from '@/lib/db/schema'
import {
  githubProfileUrl,
  githubUsernameKey,
  readGithubUsername,
} from '@/lib/github'
import {
  getCatalogAgents,
  readAuthor,
  type VerifiedAuthorProfile,
} from '@/lib/registry'

export async function getVerifiedAuthorProfileMap(
  githubUsernames: readonly (string | null)[],
): Promise<Map<string, VerifiedAuthorProfile>> {
  const usernameKeys = [
    ...new Set(
      githubUsernames.flatMap((username) => {
        const usernameKey = githubUsernameKey(username)
        return usernameKey ? [usernameKey] : []
      }),
    ),
  ]

  if (usernameKeys.length === 0) {
    return new Map()
  }

  try {
    const rows = await db
      .select({
        name: user.name,
        image: user.image,
        githubUsername: user.githubUsername,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        websiteUrl: profile.websiteUrl,
        twitterUrl: profile.twitterUrl,
        linkedinUrl: profile.linkedinUrl,
      })
      .from(user)
      .leftJoin(profile, eq(profile.userId, user.id))
      .where(inArray(sql<string>`lower(${user.githubUsername})`, usernameKeys))

    const profileMap = new Map<string, VerifiedAuthorProfile>()

    for (const row of rows) {
      const githubUsername = readGithubUsername(row.githubUsername)

      if (!githubUsername) {
        continue
      }

      profileMap.set(githubUsernameKey(githubUsername), {
        avatarUrl: row.avatarUrl ?? row.image ?? null,
        bio: row.bio ?? null,
        githubUrl: githubProfileUrl(githubUsername),
        linkedinUrl: row.linkedinUrl ?? null,
        name: row.name,
        twitterUrl: row.twitterUrl ?? null,
        websiteUrl: row.websiteUrl ?? null,
      })
    }

    return profileMap
  } catch (error) {
    console.error(
      'Failed to load verified author profiles; rendering registry authors only',
      error,
    )
    return new Map()
  }
}

export async function getAuthorProfile(
  githubUsername: string,
): Promise<StaticAuthorProfile | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(cacheTags.agents)
  cacheTag(getAuthorAgentsTag(githubUsernameKey(githubUsername)))

  const authorKey = githubUsernameKey(githubUsername)
  const agents = getCatalogAgents().filter(
    (agent) => githubUsernameKey(agent.author) === authorKey,
  )
  const [firstAgent] = agents

  if (!firstAgent) {
    return null
  }

  const author = readAuthor(firstAgent)
  const verifiedAuthor = (
    await getVerifiedAuthorProfileMap([author.githubUsername])
  ).get(authorKey)
  const installCounts = await getInstallCountMap(
    agents.map((agent) => agent.meta.slug),
  )

  return {
    agentCount: agents.length,
    avatarUrl: verifiedAuthor?.avatarUrl ?? author.avatarUrl ?? null,
    bio: verifiedAuthor?.bio ?? null,
    githubUsername: author.githubUsername ?? githubUsername,
    githubUrl: verifiedAuthor?.githubUrl ?? author.url ?? null,
    isVerified: Boolean(verifiedAuthor),
    linkedinUrl: verifiedAuthor?.linkedinUrl ?? null,
    name: verifiedAuthor?.name ?? author.name,
    totalInstalls: [...installCounts.values()].reduce(
      (sum, installCount) => sum + installCount,
      0,
    ),
    twitterUrl: verifiedAuthor?.twitterUrl ?? null,
    url: verifiedAuthor?.websiteUrl ?? author.url ?? null,
    websiteUrl: verifiedAuthor?.websiteUrl ?? null,
  }
}
