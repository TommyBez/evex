'use server'

import { checkHuman } from '@/lib/bot-id'
import { getCurrentUser } from '@/lib/current-user'
import { setFavorite } from '@/lib/data/favorites'

export type ToggleFavoriteResult =
  | { ok: true; isFavorite: boolean }
  | { ok: false; error: string }

export async function toggleFavorite(
  agentId: string,
  shouldFavorite: boolean,
): Promise<ToggleFavoriteResult> {
  const botCheck = await checkHuman()
  if (!botCheck.ok) {
    return { ok: false, error: botCheck.error }
  }

  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, error: 'Sign in to save favorites.' }
  }

  const agentSlug = agentId.trim()
  if (!agentSlug) {
    return { ok: false, error: 'Invalid agent id.' }
  }

  if (typeof shouldFavorite !== 'boolean') {
    return { ok: false, error: 'Invalid favorite state.' }
  }

  return await setFavorite(user.id, agentSlug, shouldFavorite)
}
