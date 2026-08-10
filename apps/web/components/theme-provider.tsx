'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import posthog from 'posthog-js'
import { useEffect, useRef } from 'react'
import { authClient } from '@/lib/auth-client'

function PostHogIdentity() {
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const hadAuthenticatedUserRef = useRef(false)

  useEffect(() => {
    if (isPending) {
      return
    }

    if (user) {
      hadAuthenticatedUserRef.current = true
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
      })
      return
    }

    if (hadAuthenticatedUserRef.current) {
      hadAuthenticatedUserRef.current = false
      posthog.reset()
    }
  }, [isPending, user?.email, user?.id, user?.name, user])

  return null
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <PostHogIdentity />
      {children}
    </NextThemesProvider>
  )
}
