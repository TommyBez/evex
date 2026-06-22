import 'server-only'

import {
  EVEX_REGISTRY_NAME,
  getRegistry,
  getRegistryItem,
} from '@evex-new/agent-registry'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'
import type {
  AgentRegistryFile,
  AgentWithAuthor,
  CatalogAgentAuthor,
  StaticAuthorProfile,
} from '@/lib/agent-types'
import {
  cacheTags,
  getAgentTag,
  getAuthorAgentsTag,
  getProfileTag,
} from '@/lib/cache-tags'
import { db } from '@/lib/db'
import {
  agentFavorite,
  agentInstallMetric,
  profile,
  user,
} from '@/lib/db/schema'

type RegistryCatalogItem = ReturnType<typeof getRegistry>['items'][number]

interface RegistryAuthorMeta {
  avatarUrl?: unknown
  id?: unknown
  name?: unknown
  url?: unknown
}

interface RegistryAgentMeta {
  author?: RegistryAuthorMeta
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
  const meta = readMeta(item)
  const author = meta.author ?? {}
  const fallbackAuthorName = item.author ?? EVEX_REGISTRY_NAME

  return {
    id: readString(author.id) ?? EVEX_REGISTRY_NAME,
    name: readString(author.name) ?? fallbackAuthorName,
    url: readString(author.url) ?? undefined,
    avatarUrl: readString(author.avatarUrl) ?? undefined,
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

function matchesSearch(agent: RegistryCatalogItem, search: string): boolean {
  const term = search.trim().toLowerCase()
  if (!term) {
    return true
  }

  const author = readAuthor(agent)
  return [
    agent.name,
    agent.title ?? '',
    agent.description ?? '',
    author.name,
  ].some((value) => value.toLowerCase().includes(term))
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

function toAgentWithAuthor(
  agent: RegistryCatalogItem,
  installCounts: Map<string, number>,
): AgentWithAuthor {
  const meta = readMeta(agent)
  const author = readAuthor(agent)
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
    userId: author.id,
  }
}

async function hydrateAgents(agents: readonly RegistryCatalogItem[]) {
  const installCounts = await getInstallCountMap(
    agents.map((agent) => readString(readMeta(agent).slug) ?? agent.name),
  )
  return agents.map((agent) => toAgentWithAuthor(agent, installCounts))
}

export async function listAgents(opts?: {
  search?: string
  category?: string
}): Promise<AgentWithAuthor[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(cacheTags.agents)

  const catalogAgents = getCatalogAgents()
  const filtered = catalogAgents.filter((agent) => {
    if (
      opts?.category &&
      opts.category !== 'all' &&
      readCategory(agent) !== opts.category
    ) {
      return false
    }
    if (opts?.search && !matchesSearch(agent, opts.search)) {
      return false
    }
    return true
  })

  return (await hydrateAgents(filtered)).sort(compareByInstalls)
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

function normalizeRegistryFilePath(file: {
  path: string
  target?: string | undefined
}): string {
  const rawPath = file.target ?? file.path
  return rawPath.startsWith('~/') ? rawPath.slice(2) : rawPath
}

export function getAgentFiles(slug: string): AgentRegistryFile[] {
  try {
    const item = getRegistryItem(slug)
    return (
      item.files?.map((file) => {
        const path = normalizeRegistryFilePath(file)
        return {
          content: file.content ?? '',
          id: `${slug}:${path}`,
          path,
          type: file.type,
        }
      }) ?? []
    )
  } catch {
    return []
  }
}

export async function getAgentsByUser(
  userId: string,
): Promise<AgentWithAuthor[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(cacheTags.agents)
  cacheTag(getAuthorAgentsTag(userId))

  const catalogAgents = getCatalogAgents()
  return (
    await hydrateAgents(
      catalogAgents.filter((agent) => readAuthor(agent).id === userId),
    )
  ).sort(compareByInstalls)
}

export async function getStaticAuthorProfile(
  authorId: string,
): Promise<StaticAuthorProfile | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(cacheTags.agents)
  cacheTag(getAuthorAgentsTag(authorId))

  const catalogAgents = getCatalogAgents()
  const agents = await getAgentsByUser(authorId)
  const author = catalogAgents
    .map((agent) => readAuthor(agent))
    .find((candidate) => candidate.id === authorId)

  if (!author) {
    return null
  }

  return {
    agentCount: agents.length,
    avatarUrl: author.avatarUrl ?? null,
    name: author.name,
    totalInstalls: agents.reduce((sum, agent) => sum + agent.installCount, 0),
    url: author.url ?? null,
    userId: author.id,
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

  return rows
    .map((row) => row.agentSlug)
    .filter((slug) => agentSlugSet.has(slug))
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
  const favoriteAgents = rows
    .map((row) => catalogAgentBySlug.get(row.agentSlug))
    .filter((agent): agent is RegistryCatalogItem => Boolean(agent))

  return await hydrateAgents(favoriteAgents)
}

export interface PublicProfile {
  avatarUrl: string | null
  bio: string
  githubUrl: string | null
  linkedinUrl: string | null
  name: string
  twitterUrl: string | null
  userId: string
  websiteUrl: string | null
}

// Account profile data remains dynamic; agent authorship comes from the
// source-owned shadcn registry metadata.
export async function getPublicProfile(
  userId: string,
): Promise<PublicProfile | null> {
  'use cache'
  cacheLife('hours')
  cacheTag(getProfileTag(userId))

  const [row] = await db
    .select({
      userId: user.id,
      name: user.name,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      websiteUrl: profile.websiteUrl,
      githubUrl: profile.githubUrl,
      twitterUrl: profile.twitterUrl,
      linkedinUrl: profile.linkedinUrl,
    })
    .from(user)
    .leftJoin(profile, eq(profile.userId, user.id))
    .where(eq(user.id, userId))
    .limit(1)

  if (!row) {
    return null
  }
  return {
    userId: row.userId,
    name: row.name,
    bio: row.bio ?? '',
    avatarUrl: row.avatarUrl ?? null,
    websiteUrl: row.websiteUrl ?? null,
    githubUrl: row.githubUrl ?? null,
    twitterUrl: row.twitterUrl ?? null,
    linkedinUrl: row.linkedinUrl ?? null,
  }
}

export async function getTopAgents(limit = 20): Promise<AgentWithAuthor[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(cacheTags.leaderboard)

  return (await hydrateAgents(getCatalogAgents()))
    .sort(compareByInstalls)
    .slice(0, limit)
}

export interface AuthorRanking {
  agentCount: number
  authorName: string
  avatarUrl: string | null
  totalInstalls: number
  userId: string
}

export async function getTopAuthors(limit = 20): Promise<AuthorRanking[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(cacheTags.leaderboard)

  const agents = await hydrateAgents(getCatalogAgents())
  const authorMap = new Map<string, AuthorRanking>()

  for (const agent of agents) {
    const existing = authorMap.get(agent.userId) ?? {
      agentCount: 0,
      authorName: agent.authorName,
      avatarUrl: agent.authorAvatarUrl,
      totalInstalls: 0,
      userId: agent.userId,
    }
    existing.agentCount += 1
    existing.totalInstalls += agent.installCount
    authorMap.set(agent.userId, existing)
  }

  return [...authorMap.values()]
    .sort((left, right) => {
      if (right.totalInstalls !== left.totalInstalls) {
        return right.totalInstalls - left.totalInstalls
      }
      return right.agentCount - left.agentCount
    })
    .slice(0, limit)
}

export async function getRegistryStats() {
  'use cache'
  cacheLife('minutes')
  cacheTag(cacheTags.registryStats)

  const agents = await hydrateAgents(getCatalogAgents())
  return {
    total: agents.length,
    installs: agents.reduce((sum, agent) => sum + agent.installCount, 0),
    authors: new Set(agents.map((agent) => agent.userId)).size,
  }
}
