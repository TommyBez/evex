import 'server-only'

import {
  EVEX_REGISTRY_NAME,
  getRegistry,
  getRegistryItem,
} from '@evex-new/agent-registry'
import type {
  AgentRegistryFile,
  AgentWithAuthor,
  CatalogAgentAuthor,
  StaticAuthorProfile,
} from '@/lib/agent-types'

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

function compareByCreatedAt(left: AgentWithAuthor, right: AgentWithAuthor) {
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

function getCatalogAgents(): readonly RegistryCatalogItem[] {
  return getRegistry().items
}

function getCatalogAgentBySlug(slug: string): RegistryCatalogItem | null {
  return getCatalogAgents().find((agent) => agent.name === slug) ?? null
}

function normalizeRegistryFilePath(file: {
  path: string
  target?: string | undefined
}): string {
  const rawPath = file.target ?? file.path
  return rawPath.startsWith('~/') ? rawPath.slice(2) : rawPath
}

function toStaticAgent(agent: RegistryCatalogItem): AgentWithAuthor {
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
    installCount: 0,
    name: title,
    slug,
    title,
    updatedAt: readDate(meta.updatedAt),
    userId: author.id,
  }
}

export function listStaticAgents(opts?: {
  search?: string
  category?: string
}): AgentWithAuthor[] {
  const filtered = getCatalogAgents().filter((agent) => {
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

  return filtered.map(toStaticAgent).sort(compareByCreatedAt)
}

export function getStaticAgentBySlug(slug: string): AgentWithAuthor | null {
  const agent = getCatalogAgentBySlug(slug)
  return agent ? toStaticAgent(agent) : null
}

export function getStaticAgentFiles(slug: string): AgentRegistryFile[] {
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

export function getStaticAgentsByUser(userId: string): AgentWithAuthor[] {
  return listStaticAgents()
    .filter((agent) => agent.userId === userId)
    .sort(compareByCreatedAt)
}

export function getStaticAuthorProfile(
  authorId: string,
): StaticAuthorProfile | null {
  const agents = getStaticAgentsByUser(authorId)
  const author = agents.at(0)?.author

  if (!author) {
    return null
  }

  return {
    agentCount: agents.length,
    avatarUrl: author.avatarUrl ?? null,
    name: author.name,
    totalInstalls: 0,
    url: author.url ?? null,
    userId: author.id,
  }
}

export function getStaticRegistryStats() {
  const agents = listStaticAgents()
  return {
    total: agents.length,
    authors: new Set(agents.map((agent) => agent.userId)).size,
  }
}
