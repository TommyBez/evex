import 'server-only'

import {
  getRegistry,
  getRegistryItem,
  type RegistryItem,
  RegistryItemNotFoundError,
} from '@evex/agent-registry'
import type {
  AgentRegistryFile,
  AgentWithAuthor,
  CatalogAgentAuthor,
} from '@/lib/agent-types'
import { githubProfileUrl, githubUsernameKey } from '@/lib/github'

// The registry package validates every item against its Zod schema at
// generation time, so catalog access here is fully typed: author, title,
// description, and meta (slug/category/dates) are guaranteed present.

export interface VerifiedAuthorProfile {
  avatarUrl: string | null
  bio: string | null
  githubUrl: string
  linkedinUrl: string | null
  name: string
  twitterUrl: string | null
  websiteUrl: string | null
}

export function getCatalogAgents(): readonly RegistryItem[] {
  return getRegistry().items
}

export function getCatalogAgentBySlug(slug: string): RegistryItem | null {
  return getCatalogAgents().find((agent) => agent.name === slug) ?? null
}

export function readAuthor(item: RegistryItem): CatalogAgentAuthor {
  return {
    githubUsername: item.author,
    name: item.author,
    url: githubProfileUrl(item.author),
  }
}

export function toAgentWithAuthor(
  item: RegistryItem,
  installCounts?: ReadonlyMap<string, number>,
  verifiedAuthors?: ReadonlyMap<string, VerifiedAuthorProfile>,
): AgentWithAuthor {
  const registryAuthor = readAuthor(item)
  const verifiedAuthor = verifiedAuthors?.get(
    githubUsernameKey(registryAuthor.githubUsername),
  )
  const author = {
    ...registryAuthor,
    avatarUrl: verifiedAuthor?.avatarUrl ?? registryAuthor.avatarUrl,
    name: verifiedAuthor?.name ?? registryAuthor.name,
    url: verifiedAuthor?.githubUrl ?? registryAuthor.url,
  }
  const { slug } = item.meta

  return {
    author,
    authorAvatarUrl: author.avatarUrl ?? null,
    authorName: author.name,
    authorUsername: registryAuthor.githubUsername,
    category: item.meta.category,
    createdAt: new Date(item.meta.createdAt),
    dependencies: (item.dependencies ?? []).join(','),
    description: item.description,
    id: slug,
    installCount: installCounts?.get(slug) ?? 0,
    name: item.title,
    slug,
    title: item.title,
    updatedAt: new Date(item.meta.updatedAt),
  }
}

function compareByCreatedAt(left: AgentWithAuthor, right: AgentWithAuthor) {
  return right.createdAt.getTime() - left.createdAt.getTime()
}

function matchesSearch(item: RegistryItem, search: string): boolean {
  const term = search.trim().toLowerCase()
  if (!term) {
    return true
  }

  return [item.name, item.title, item.description, item.author].some((value) =>
    value.toLowerCase().includes(term),
  )
}

export function listStaticAgents(opts?: {
  search?: string
  category?: string
}): AgentWithAuthor[] {
  const filtered = getCatalogAgents().filter((item) => {
    if (
      opts?.category &&
      opts.category !== 'all' &&
      item.meta.category !== opts.category
    ) {
      return false
    }
    if (opts?.search && !matchesSearch(item, opts.search)) {
      return false
    }
    return true
  })

  return filtered
    .map((item) => toAgentWithAuthor(item))
    .sort(compareByCreatedAt)
}

export function getStaticAgentBySlug(slug: string): AgentWithAuthor | null {
  const item = getCatalogAgentBySlug(slug)
  return item ? toAgentWithAuthor(item) : null
}

function normalizeRegistryFilePath(file: {
  path: string
  target?: string | undefined
}): string {
  const rawPath = file.target ?? file.path
  return rawPath.startsWith('~/') ? rawPath.slice(2) : rawPath
}

export function getStaticAgentFiles(slug: string): AgentRegistryFile[] {
  try {
    const item = getRegistryItem(slug)
    return item.files.map((file) => {
      const path = normalizeRegistryFilePath(file)
      return {
        content: file.content ?? '',
        id: `${slug}:${path}`,
        path,
        type: file.type,
      }
    })
  } catch (error) {
    if (error instanceof RegistryItemNotFoundError) {
      return []
    }
    throw error
  }
}

export function getStaticAgentsByAuthorUsername(
  githubUsername: string,
): AgentWithAuthor[] {
  const authorKey = githubUsernameKey(githubUsername)
  return listStaticAgents()
    .filter((agent) => githubUsernameKey(agent.authorUsername) === authorKey)
    .sort(compareByCreatedAt)
}

export function getStaticRegistryStats() {
  const agents = listStaticAgents()
  const authorKeys = agents.flatMap((agent) => {
    const authorKey = githubUsernameKey(agent.authorUsername)
    return authorKey ? [authorKey] : []
  })

  return {
    total: agents.length,
    authors: new Set(authorKeys).size,
  }
}
