'use server'

import { checkHuman } from '@/lib/bot-id'
import { getCurrentUserIdentity } from '@/lib/current-user'
import type { ProfileData, SaveProfileResult } from '@/lib/data/profiles'
import { getProfileData, saveProfileData } from '@/lib/data/profiles'

export type { ProfileData, SaveProfileResult } from '@/lib/data/profiles'

export async function getProfile(): Promise<ProfileData> {
  const currentUser = await getCurrentUserIdentity()
  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  return await getProfileData(currentUser)
}

export async function saveProfile(
  formData: FormData,
): Promise<SaveProfileResult> {
  const botCheck = await checkHuman()
  if (!botCheck.ok) {
    return { ok: false, error: botCheck.error }
  }

  const currentUser = await getCurrentUserIdentity()
  if (!currentUser) {
    return { ok: false, error: 'Sign in to edit your profile.' }
  }

  return await saveProfileData(currentUser, formData)
}
