import 'server-only'

import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'

// The single place that resolves "who is the current user". Pages, server
// actions, and data functions must use these helpers instead of calling
// auth.api.getSession directly.

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

// For pages that require authentication: resolves the user or redirects to
// the sign-in page.
export async function requireUser() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/sign-in')
  }
  return currentUser
}

export interface CurrentUserIdentity {
  githubUsername: string | null
  id: string
}

// Identity for profile/authorship flows. githubUsername is the verified
// OAuth username column, which is not exposed on the session payload.
export async function getCurrentUserIdentity(): Promise<CurrentUserIdentity | null> {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return null
  }

  const [row] = await db
    .select({ githubUsername: user.githubUsername })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1)

  return {
    githubUsername: row?.githubUsername ?? null,
    id: currentUser.id,
  }
}
