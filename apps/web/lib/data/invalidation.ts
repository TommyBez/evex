import 'server-only'

import { revalidatePath, revalidateTag, updateTag } from 'next/cache'
import {
  cacheTags,
  getAgentTag,
  getAuthorAgentsTag,
  getProfileTag,
} from '@/lib/cache-tags'

// Cache invalidation policy, in one place:
//
// - Install counts feed the `'use cache'` entries (agent detail, leaderboard,
//   author profile), so install writes refresh by TAG via `revalidateTag`.
//   They run inside `after()` on a route handler, where `updateTag` is not
//   available.
// - Favorite state is read uncached per request inside Suspense boundaries,
//   so favorite toggles refresh the affected PATHS instead of tags.
// - Profile edits run in a server action, so they use `updateTag` to refresh
//   the caller's own view within the same request.

export function invalidateAgentRuntimeCaches(
  slug: string,
  authorUsername: string | null,
): void {
  revalidateTag(cacheTags.agents, 'max')
  revalidateTag(cacheTags.leaderboard, 'max')
  revalidateTag(cacheTags.registryStats, 'max')
  revalidateTag(getAgentTag(slug), 'max')
  if (authorUsername) {
    revalidateTag(getAuthorAgentsTag(authorUsername), 'max')
  }
}

export function invalidateFavoriteViews(
  slug: string,
  authorUsername: string | null,
): void {
  revalidatePath('/')
  revalidatePath('/favorites')
  revalidatePath(`/agents/${slug}`)
  if (authorUsername) {
    revalidatePath(`/authors/${authorUsername}`)
  }
}

export function invalidateProfileCaches(
  userId: string,
  githubUsername: string | null,
): void {
  updateTag(getProfileTag(userId))
  updateTag(cacheTags.agents)
  updateTag(cacheTags.leaderboard)
  if (githubUsername) {
    updateTag(getAuthorAgentsTag(githubUsername))
    revalidatePath(`/authors/${githubUsername}`)
  }
  revalidatePath('/profile')
}
