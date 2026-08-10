import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import type { AgentWithAuthor } from '@/lib/agent-types'
import { cacheTags } from '@/lib/cache-tags'
import { hydrateAgents } from '@/lib/data/hydrate'
import { githubUsernameKey } from '@/lib/github'
import { getCatalogAgents } from '@/lib/registry'

function compareByInstalls(left: AgentWithAuthor, right: AgentWithAuthor) {
  if (right.installCount !== left.installCount) {
    return right.installCount - left.installCount
  }
  return right.createdAt.getTime() - left.createdAt.getTime()
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
