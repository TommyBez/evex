import { sql } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { cacheTags, getAgentTag, getAuthorAgentsTag } from '@/lib/cache-tags'
import { db } from '@/lib/db'
import { agentInstallMetric } from '@/lib/db/schema'
import { getAgentBySlug } from '@/lib/queries'

const CACHE_EXPIRE_IMMEDIATELY = { expire: 0 } as const

function revalidateRegistryCaches(slug: string, authorUsername: string | null) {
  revalidateTag(cacheTags.agents, CACHE_EXPIRE_IMMEDIATELY)
  revalidateTag(cacheTags.leaderboard, CACHE_EXPIRE_IMMEDIATELY)
  revalidateTag(cacheTags.registryStats, CACHE_EXPIRE_IMMEDIATELY)
  revalidateTag(getAgentTag(slug), CACHE_EXPIRE_IMMEDIATELY)
  if (authorUsername) {
    revalidateTag(getAuthorAgentsTag(authorUsername), CACHE_EXPIRE_IMMEDIATELY)
  }
}

// Called from the public registry endpoint, so install tracking is intentionally
// not user-scoped.
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

  revalidateRegistryCaches(slug, agent.authorUsername)
}
