import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getProfile } from '@/app/actions/profile'
import { ProfileForm } from '@/components/profile-form'
import { Skeleton } from '@/components/ui/skeleton'
import { auth } from '@/lib/auth'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Profile',
  description: 'Edit your public profile, social links, and avatar.',
  path: '/profile',
  noIndex: true,
})

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileContentSkeleton />}>
      <ProfileContent />
    </Suspense>
  )
}

async function ProfileContent() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    redirect('/sign-in')
  }

  const profile = await getProfile()

  return (
    <main className="mx-auto w-full min-w-0 max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-balance font-semibold text-3xl text-foreground">
          Your Profile
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          Add an avatar, a short bio, and links to your website and social
          accounts.
        </p>
      </div>
      <ProfileForm
        email={session.user.email}
        key={JSON.stringify(profile)}
        name={session.user.name || session.user.email}
        profile={profile}
      />
    </main>
  )
}

function ProfileContentSkeleton() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-2xl px-4 py-10">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full max-w-80" />
      </div>
      <div className="space-y-4 rounded-md border border-border p-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
    </main>
  )
}
