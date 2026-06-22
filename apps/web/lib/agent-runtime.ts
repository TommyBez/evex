import 'server-only'

import type { AgentWithAuthor } from '@/lib/agent-types'
import { getCurrentUser } from '@/lib/current-user'
import { getFavoriteAgentIds, getInstallCountMap } from '@/lib/queries'

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
