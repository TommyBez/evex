import 'server-only'

import type { RegistryItem } from '@evex/agent-registry'
import type { AgentWithAuthor } from '@/lib/agent-types'
import { getVerifiedAuthorProfileMap } from '@/lib/data/authors'
import { getInstallCountMap } from '@/lib/data/install-metrics'
import { toAgentWithAuthor } from '@/lib/registry'

// Folds runtime state (install counts, verified author profiles) into the
// static catalog items.
export async function hydrateAgents(
  items: readonly RegistryItem[],
): Promise<AgentWithAuthor[]> {
  const [installCounts, verifiedAuthors] = await Promise.all([
    getInstallCountMap(items.map((item) => item.meta.slug)),
    getVerifiedAuthorProfileMap(items.map((item) => item.author)),
  ])

  return items.map((item) =>
    toAgentWithAuthor(item, installCounts, verifiedAuthors),
  )
}
