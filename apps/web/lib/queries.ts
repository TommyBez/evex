import 'server-only'

import { EVEX_REGISTRY_NAME, getRegistry } from '@evex/agent-registry'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'
import type {
  AgentWithAuthor,
  CatalogAgentAuthor,
  StaticAuthorProfile,
} from '@/lib/agent-types'
import { cacheTags, getAgentTag, getAuthorAgentsTag } from '@/lib/cache-tags'
import { db } from '@/lib/db'
import {
  agentFavorite,
  agentInstallMetric,
  profile,
  user,
} from '@/lib/db/schema'
import {
  githubProfileUrl,
  githubUsernameKey,
  readGithubUsername,
} from '@/lib/github'

type RegistryCatalogItem = ReturnType<typeof getRegistry>['items'][number]

interface RegistryAgentMeta {
  category?: unknown
  createdAt?: unknown
  dependencies?: unknown
  slug?: unknown
  updatedAt?: unknown
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : []
}

function readMeta(item: RegistryCatalogItem): RegistryAgentMeta {
  return (item.meta ?? {}) as RegistryAgentMeta
}

function readAuthor(item: RegistryCatalogItem): CatalogAgentAuthor {
  const githubUsername = readString(item.author)

  return {
    githubUsername,
    name: githubUsername ?? EVEX_REGISTRY_NAME,
    url: githubUsername ? githubProfileUrl(githubUsername) : undefined,
  }
}

function readCategory(item: RegistryCatalogItem): string {
  const meta = readMeta(item)
  return (
    readString(meta.category) ??
    item.categories?.find((category) => category.length > 0) ??
    'general'
  )
}

function readDate(value: unknown): Date {
  const date = new Date(readString(value) ?? 0)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function readDependencies(item: RegistryCatalogItem): string[] {
  const meta = readMeta(item)
  const dependencies = readStringArray(item.dependencies)
  return dependencies.length > 0
    ? dependencies
    : readStringArray(meta.dependencies)
}

function getCatalogAgents(): readonly RegistryCatalogItem[] {
  const registry = getRegistry()
  return registry.items
}

function getCatalogAgentBySlug(slug: string): RegistryCatalogItem | null {
  const agents = getCatalogAgents()
  return agents.find((agent) => agent.name === slug) ?? null
}

function compareByInstalls(left: AgentWithAuthor, right: AgentWithAuthor) {
  if (right.installCount !== left.installCount) {
    return right.installCount - left.installCount
  }
  return right.createdAt.getTime() - left.createdAt.getTime()
}

export async function getInstallCountMap(
  slugs?: string[],
): Promise<Map<string, number>> {
  if (slugs && slugs.length === 0) {
    return new Map()
  }

  try {
    const rows = slugs
      ? await db
          .select({
            installCount: agentInstallMetric.installCount,
            slug: agentInstallMetric.slug,
          })
          .from(agentInstallMetric)
          .where(inArray(agentInstallMetric.slug, slugs))
      : await db
          .select({
            installCount: agentInstallMetric.installCount,
            slug: agentInstallMetric.slug,
          })
          .from(agentInstallMetric)

    return new Map(rows.map((row) => [row.slug, row.installCount]))
  } catch {
    return new Map()
  }
}

interface VerifiedAuthorProfile {
  avatarUrl: string | null
  bio: string | null
  githubUrl: string
  linkedinUrl: string | null
  name: string
  twitterUrl: string | null
  websiteUrl: string | null
}

async function getVerifiedAuthorProfileMap(
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
  } catch {
    return new Map()
  }
}

function toAgentWithAuthor(
  agent: RegistryCatalogItem,
  installCounts: Map<string, number>,
  verifiedAuthors: Map<string, VerifiedAuthorProfile>,
): AgentWithAuthor {
  const meta = readMeta(agent)
  const registryAuthor = readAuthor(agent)
  const verifiedAuthor = verifiedAuthors.get(
    githubUsernameKey(registryAuthor.githubUsername),
  )
  const author = {
    ...registryAuthor,
    avatarUrl: verifiedAuthor?.avatarUrl ?? registryAuthor.avatarUrl,
    name: verifiedAuthor?.name ?? registryAuthor.name,
    url: verifiedAuthor?.githubUrl ?? registryAuthor.url,
  }
  const slug = readString(meta.slug) ?? agent.name
  const title = agent.title ?? agent.name

  return {
    author,
    authorAvatarUrl: author.avatarUrl ?? null,
    authorName: author.name,
    category: readCategory(agent),
    createdAt: readDate(meta.createdAt),
    dependencies: readDependencies(agent).join(','),
    description: agent.description ?? title,
    id: slug,
    installCount: installCounts.get(slug) ?? 0,
    name: title,
    slug,
    title,
    updatedAt: readDate(meta.updatedAt),
    authorUsername: registryAuthor.githubUsername,
  }
}

async function hydrateAgents(agents: readonly RegistryCatalogItem[]) {
  const [installCounts, verifiedAuthors] = await Promise.all([
    getInstallCountMap(
      agents.map((agent) => readString(readMeta(agent).slug) ?? agent.name),
    ),
    getVerifiedAuthorProfileMap(
      agents.map((agent) => readAuthor(agent).githubUsername),
    ),
  ])

  return agents.map((agent) =>
    toAgentWithAuthor(agent, installCounts, verifiedAuthors),
  )
}

export async function getAgentBySlug(
  slug: string,
): Promise<AgentWithAuthor | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(cacheTags.agents)
  cacheTag(getAgentTag(slug))

  const agent = getCatalogAgentBySlug(slug)
  if (!agent) {
    return null
  }
  const [hydrated] = await hydrateAgents([agent])
  return hydrated ?? null
}

export async function getAuthorProfile(
  githubUsername: string,
): Promise<StaticAuthorProfile | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(cacheTags.agents)
  cacheTag(getAuthorAgentsTag(githubUsernameKey(githubUsername)))

  const catalogAgents = getCatalogAgents()
  const authorKey = githubUsernameKey(githubUsername)
  const agents = catalogAgents.filter(
    (agent) =>
      githubUsernameKey(readAuthor(agent).githubUsername) === authorKey,
  )
  const author = catalogAgents
    .map((agent) => readAuthor(agent))
    .find(
      (candidate) =>
        githubUsernameKey(candidate.githubUsername) ===
        githubUsernameKey(githubUsername),
    )

  if (!author?.githubUsername) {
    return null
  }

  const verifiedAuthor = (
    await getVerifiedAuthorProfileMap([author.githubUsername])
  ).get(githubUsernameKey(author.githubUsername))
  const installCounts = await getInstallCountMap(
    agents.map((agent) => readString(readMeta(agent).slug) ?? agent.name),
  )

  return {
    agentCount: agents.length,
    avatarUrl: verifiedAuthor?.avatarUrl ?? author.avatarUrl ?? null,
    bio: verifiedAuthor?.bio ?? null,
    githubUsername: author.githubUsername,
    githubUrl: verifiedAuthor
      ? githubProfileUrl(author.githubUsername)
      : (author.url ?? null),
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

export async function getFavoriteAgentIds(
  userId: string,
  agentIds?: string[],
): Promise<string[]> {
  if (agentIds && agentIds.length === 0) {
    return []
  }

  const rows = agentIds
    ? await db
        .select({ agentSlug: agentFavorite.agentSlug })
        .from(agentFavorite)
        .where(
          and(
            eq(agentFavorite.userId, userId),
            inArray(agentFavorite.agentSlug, agentIds),
          ),
        )
    : await db
        .select({ agentSlug: agentFavorite.agentSlug })
        .from(agentFavorite)
        .where(eq(agentFavorite.userId, userId))

  const agentSlugSet = new Set(getCatalogAgents().map((agent) => agent.name))

  return rows.flatMap((row) =>
    agentSlugSet.has(row.agentSlug) ? [row.agentSlug] : [],
  )
}

export async function getFavoriteAgents(
  userId: string,
): Promise<AgentWithAuthor[]> {
  const rows = await db
    .select({ agentSlug: agentFavorite.agentSlug })
    .from(agentFavorite)
    .where(eq(agentFavorite.userId, userId))
    .orderBy(desc(agentFavorite.createdAt))

  const catalogAgentBySlug = new Map(
    getCatalogAgents().map((agent) => [agent.name, agent]),
  )
  const favoriteAgents = rows.flatMap((row) => {
    const agent = catalogAgentBySlug.get(row.agentSlug)
    return agent ? [agent] : []
  })

  return await hydrateAgents(favoriteAgents)
}

export async function getTopAgents(limit = 20): Promise<AgentWithAuthor[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(cacheTags.leaderboard)

  return (await hydrateAgents(getCatalogAgents()))
    .sort(compareByInstalls)
    .slice(0, limit)
}

interface AuthorRanking {
  agentCount: number
  authorName: string
  authorUsername: string
  avatarUrl: string | null
  totalInstalls: number
}

export async function getTopAuthors(limit = 20): Promise<AuthorRanking[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(cacheTags.leaderboard)

  const agents = await hydrateAgents(getCatalogAgents())
  const authorMap = new Map<string, AuthorRanking>()

  for (const agent of agents) {
    if (!agent.authorUsername) {
      continue
    }

    const authorKey = githubUsernameKey(agent.authorUsername)
    const existing = authorMap.get(authorKey) ?? {
      agentCount: 0,
      authorName: agent.authorName,
      authorUsername: agent.authorUsername,
      avatarUrl: agent.authorAvatarUrl,
      totalInstalls: 0,
    }
    existing.agentCount += 1
    existing.totalInstalls += agent.installCount
    authorMap.set(authorKey, existing)
  }

  return Array.from(authorMap.values())
    .toSorted((left, right) => {
      if (right.totalInstalls !== left.totalInstalls) {
        return right.totalInstalls - left.totalInstalls
      }
      return right.agentCount - left.agentCount
    })
    .slice(0, limit)
}
