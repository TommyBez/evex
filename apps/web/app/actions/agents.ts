'use server'

import { sql } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { cacheTags, getAgentTag, getAuthorAgentsTag } from '@/lib/cache-tags'
import { db } from '@/lib/db'
import { agentInstallMetric } from '@/lib/db/schema'
import { getAgentBySlug } from '@/lib/queries'

function revalidateRegistryCaches(slug: string, authorId: string) {
  revalidateTag(cacheTags.agents, 'max')
  revalidateTag(cacheTags.leaderboard, 'max')
  revalidateTag(cacheTags.registryStats, 'max')
  revalidateTag(getAgentTag(slug), 'max')
  revalidateTag(getAuthorAgentsTag(authorId), 'max')
}

// Increment install count. Called from the public registry endpoint, so it is
// intentionally not user-scoped.
export async function incrementInstallCount(slug: string): Promise<void> {
  const agent = await getAgentBySlug(slug)
  if (!agent) {
    return
  }

  await db
    .insert(agentInstallMetric)
    .values({
      slug,
      installCount: 1,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: agentInstallMetric.slug,
      set: {
        installCount: sql`${agentInstallMetric.installCount} + 1`,
        updatedAt: new Date(),
      },
    })

  revalidateRegistryCaches(slug, agent.userId)
}
