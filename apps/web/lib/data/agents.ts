import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import type { AgentWithAuthor } from '@/lib/agent-types'
import { cacheTags, getAgentTag } from '@/lib/cache-tags'
import { getCurrentUser } from '@/lib/current-user'
import { getFavoriteAgentIds } from '@/lib/data/favorites'
import { hydrateAgents } from '@/lib/data/hydrate'
import { getInstallCountMap } from '@/lib/data/install-metrics'
import { getCatalogAgentBySlug } from '@/lib/registry'

export async function getAgentBySlug(
  slug: string,
): Promise<AgentWithAuthor | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(cacheTags.agents)
  cacheTag(getAgentTag(slug))

  const item = getCatalogAgentBySlug(slug)
  if (!item) {
    return null
  }
  const [hydrated] = await hydrateAgents([item])
  return hydrated ?? null
}

export interface AgentRuntimeState {
  favoriteAgentIdSet: Set<string>
  installCounts: Map<string, number>
  isAuthenticated: boolean
}

export async function getAgentRuntimeState(
  agentIds: readonly string[],
): Promise<AgentRuntimeState> {
  const uniqueAgentIds = [...new Set(agentIds)]
  const [user, installCounts] = await Promise.all([
    getCurrentUser(),
    getInstallCountMap(uniqueAgentIds),
  ])

  if (!user || uniqueAgentIds.length === 0) {
    return {
      favoriteAgentIdSet: new Set<string>(),
      installCounts,
      isAuthenticated: Boolean(user),
    }
  }

  const favoriteAgentIds = await getFavoriteAgentIds(user.id, uniqueAgentIds)
  return {
    favoriteAgentIdSet: new Set(favoriteAgentIds),
    installCounts,
    isAuthenticated: true,
  }
}

export function applyInstallCounts(
  agents: readonly AgentWithAuthor[],
  installCounts: Map<string, number>,
): AgentWithAuthor[] {
  return agents.map((agent) => ({
    ...agent,
    installCount: installCounts.get(agent.id) ?? 0,
  }))
}

export function sumInstallCounts(installCounts: Map<string, number>): number {
  return [...installCounts.values()].reduce((sum, count) => sum + count, 0)
}
