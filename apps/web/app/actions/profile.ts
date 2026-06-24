'use server'

import { del, put } from '@vercel/blob'
import { eq } from 'drizzle-orm'
import { revalidatePath, updateTag } from 'next/cache'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { checkHuman } from '@/lib/bot-id'
import { cacheTags, getAuthorAgentsTag, getProfileTag } from '@/lib/cache-tags'
import { db } from '@/lib/db'
import { profile, user } from '@/lib/db/schema'
import { githubProfileUrl } from '@/lib/github'

async function getCurrentUserIdentity() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const [row] = await db
    .select({ githubUsername: user.githubUsername })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  return {
    githubUsername: row?.githubUsername ?? null,
    id: session.user.id,
  }
}

export interface ProfileData {
  avatarUrl: string | null
  bio: string
  githubUrl: string | null
  githubUsername: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  websiteUrl: string | null
}

const MAX_AVATAR_BYTES = 4 * 1024 * 1024 // 4MB
const HTTP_URL_PREFIX = /^https?:\/\//i
type AllowedAvatarType = 'image/gif' | 'image/jpeg' | 'image/png' | 'image/webp'

function isAllowedAvatarType(value: string): value is AllowedAvatarType {
  return (
    value === 'image/png' ||
    value === 'image/jpeg' ||
    value === 'image/webp' ||
    value === 'image/gif'
  )
}

// Normalize an optional URL: trim, drop empties, and ensure a protocol.
function normalizeUrl(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  if (HTTP_URL_PREFIX.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

export async function getProfile(): Promise<ProfileData> {
  const currentUser = await getCurrentUserIdentity()
  const [row] = await db
    .select({
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      githubUrl: profile.githubUrl,
      githubUsername: user.githubUsername,
      linkedinUrl: profile.linkedinUrl,
      twitterUrl: profile.twitterUrl,
      websiteUrl: profile.websiteUrl,
    })
    .from(user)
    .leftJoin(profile, eq(profile.userId, user.id))
    .where(eq(user.id, currentUser.id))
    .limit(1)

  const githubUsername = row?.githubUsername ?? currentUser.githubUsername

  return {
    bio: row?.bio ?? '',
    avatarUrl: row?.avatarUrl ?? null,
    websiteUrl: row?.websiteUrl ?? null,
    githubUsername,
    githubUrl: githubUsername
      ? githubProfileUrl(githubUsername)
      : (row?.githubUrl ?? null),
    twitterUrl: row?.twitterUrl ?? null,
    linkedinUrl: row?.linkedinUrl ?? null,
  }
}

export type SaveProfileResult = { ok: true } | { ok: false; error: string }

export async function saveProfile(
  formData: FormData,
): Promise<SaveProfileResult> {
  const botCheck = await checkHuman()
  if (!botCheck.ok) {
    return { ok: false, error: botCheck.error }
  }

  const currentUser = await getCurrentUserIdentity()
  const userId = currentUser.id

  const bio = (formData.get('bio') as string | null)?.trim().slice(0, 500) ?? ''
  const websiteUrl = normalizeUrl(formData.get('websiteUrl'))
  const githubUrl = currentUser.githubUsername
    ? githubProfileUrl(currentUser.githubUsername)
    : normalizeUrl(formData.get('githubUrl'))
  const twitterUrl = normalizeUrl(formData.get('twitterUrl'))
  const linkedinUrl = normalizeUrl(formData.get('linkedinUrl'))

  const [existing] = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1)

  let avatarUrl = existing?.avatarUrl ?? null

  const file = formData.get('avatar')
  if (file instanceof File && file.size > 0) {
    if (!isAllowedAvatarType(file.type)) {
      return { ok: false, error: 'Avatar must be a PNG, JPEG, WEBP, or GIF.' }
    }
    if (file.size > MAX_AVATAR_BYTES) {
      return { ok: false, error: 'Avatar must be smaller than 4MB.' }
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const blob = await put(`avatars/${userId}-${Date.now()}.${ext}`, file, {
      access: 'public',
      contentType: file.type,
    })
    // Best-effort cleanup of the previous avatar.
    if (existing?.avatarUrl) {
      try {
        await del(existing.avatarUrl)
      } catch {
        // ignore — orphaned blob is not fatal
      }
    }
    avatarUrl = blob.url
  }

  const values = {
    userId,
    bio,
    avatarUrl,
    websiteUrl,
    githubUrl,
    twitterUrl,
    linkedinUrl,
    updatedAt: new Date(),
  }

  await db
    .insert(profile)
    .values(values)
    .onConflictDoUpdate({ target: profile.userId, set: values })

  updateTag(getProfileTag(userId))
  updateTag(cacheTags.agents)
  updateTag(cacheTags.leaderboard)
  if (currentUser.githubUsername) {
    updateTag(getAuthorAgentsTag(currentUser.githubUsername))
    revalidatePath(`/authors/${currentUser.githubUsername}`)
  }
  revalidatePath('/profile')
  return { ok: true }
}
