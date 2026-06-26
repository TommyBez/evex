import { Skeleton } from '@evex/ui/skeleton'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth-form'
import { auth } from '@/lib/auth'
import { createPageMetadata } from '@/lib/metadata'
import { getSafeRedirectPath } from '@/lib/utils'

export const metadata = createPageMetadata({
  title: 'Sign in',
  description: 'Sign in to save and manage eve agents on evex.',
  path: '/sign-in',
  noIndex: true,
})

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <SignInContent searchParams={searchParams} />
    </Suspense>
  )
}

async function SignInContent({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const [requestHeaders, { redirect: redirectParam }] = await Promise.all([
    headers(),
    searchParams,
  ])
  const session = await auth.api.getSession({ headers: requestHeaders })
  const redirectTo = getSafeRedirectPath(redirectParam)
  if (session?.user) {
    redirect(redirectTo)
  }
  return <AuthForm mode="sign-in" redirectTo={redirectTo} />
}

function AuthPageSkeleton() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-4 rounded-md border border-border p-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </main>
  )
}
