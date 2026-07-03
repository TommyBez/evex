import 'server-only'

import { inArray, sql } from 'drizzle-orm'
import { invalidateAgentRuntimeCaches } from '@/lib/data/invalidation'
import { db } from '@/lib/db'
import { agentInstallMetric } from '@/lib/db/schema'
import { getCatalogAgentBySlug } from '@/lib/registry'

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
  } catch (error) {
    console.error(
      'Failed to load install counts; rendering without them',
      error,
    )
    return new Map()
  }
}

// Called from the public registry endpoint, so install tracking is
// intentionally not user-scoped.
export async function incrementInstallCount(slug: string): Promise<void> {
  const agent = getCatalogAgentBySlug(slug)
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

  invalidateAgentRuntimeCaches(slug, agent.author)
}
