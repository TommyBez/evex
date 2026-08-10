import 'server-only'

import { and, desc, eq, inArray } from 'drizzle-orm'
import type { AgentWithAuthor } from '@/lib/agent-types'
import { hydrateAgents } from '@/lib/data/hydrate'
import { invalidateFavoriteViews } from '@/lib/data/invalidation'
import { db } from '@/lib/db'
import { agentFavorite } from '@/lib/db/schema'
import { getCatalogAgentBySlug, getCatalogAgents } from '@/lib/registry'

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

export type SetFavoriteResult =
  | { ok: true; isFavorite: boolean }
  | { ok: false; error: string }

export async function setFavorite(
  userId: string,
  agentSlug: string,
  shouldFavorite: boolean,
): Promise<SetFavoriteResult> {
  const agent = getCatalogAgentBySlug(agentSlug)
  if (!agent) {
    return { ok: false, error: 'Agent not found.' }
  }

  if (shouldFavorite) {
    await db
      .insert(agentFavorite)
      .values({ userId, agentSlug })
      .onConflictDoNothing()
  } else {
    await db
      .delete(agentFavorite)
      .where(
        and(
          eq(agentFavorite.userId, userId),
          eq(agentFavorite.agentSlug, agentSlug),
        ),
      )
  }

  invalidateFavoriteViews(agentSlug, agent.author)
  return { ok: true, isFavorite: shouldFavorite }
}
