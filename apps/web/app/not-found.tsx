import { Button } from '@evex/ui/button'
import Link from 'next/link'

// Self-contained 404 page. It must not depend on search params, auth, or
// the database: notFound() renders this during static generation and for
// unknown slugs, and any dynamic dependency here turns the 404 into a 500
// (previously every unknown URL responded 500 or a soft 200).
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="mono-label text-muted-foreground">404</p>
      <h1 className="font-display font-semibold text-2xl text-foreground">
        Page not found
      </h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist or is no longer available.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button render={<Link href="/">Browse agents</Link>} />
        <Button
          render={<Link href="/learn">Read the guides</Link>}
          variant="outline"
        />
      </div>
    </main>
  )
}
