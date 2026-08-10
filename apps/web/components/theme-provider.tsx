'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import posthog from 'posthog-js'
import { useEffect } from 'react'
import { authClient } from '@/lib/auth-client'

function PostHogIdentity() {
  const { data: session } = authClient.useSession()
  const user = session?.user

  useEffect(() => {
    if (!user) {
      return
    }

    posthog.identify(user.id, {
      email: user.email,
      name: user.name,
    })
  }, [user?.email, user?.id, user?.name, user])

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
