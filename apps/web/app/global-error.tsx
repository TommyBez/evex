'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

export default function GlobalError({
  error,
}: Readonly<{
  error: Error & { digest?: string }
}>) {
  useEffect(() => {
    posthog.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <main>
          <h1>Something went wrong</h1>
          <p>Please refresh the page and try again.</p>
        </main>
      </body>
    </html>
  )
}
