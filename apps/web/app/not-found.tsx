import Link from 'next/link'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Page not found',
  description: 'The page you are looking for does not exist on evex.',
  path: '/',
  noIndex: true,
})

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <p className="font-pixel text-muted-foreground text-sm">404</p>
      <h1 className="text-balance font-semibold text-2xl text-foreground">
        Page not found
      </h1>
      <p className="max-w-md text-pretty text-muted-foreground">
        The page you are looking for does not exist or is no longer available.
      </p>
      <Link
        className="text-brand text-sm underline underline-offset-4 hover:no-underline"
        href="/"
      >
        Back to the registry
      </Link>
    </main>
  )
}
