import { getRegistryCatalog } from '@evex/agent-registry/catalog'
import { type NextRequest, NextResponse } from 'next/server'
import { listLearnPages } from '@/lib/learn-content'

// With cacheComponents enabled, unknown dynamic params cannot produce a real
// 404: the prerendered fallback shell is streamed with a 200 before
// notFound() runs (and on Next 16.2.x that path even 500s). The catalog is
// baked into the build, so the valid slugs are known here and unknown ones
// can be rejected with a real 404 status before the route renders.

const catalogItems = getRegistryCatalog().items
const AGENT_SLUGS = new Set(catalogItems.map((item) => item.meta.slug))
const AUTHOR_KEYS = new Set(
  catalogItems.map((item) => item.author.toLowerCase()),
)
const LEARN_SLUGS = new Set(listLearnPages().map((page) => page.slug))

const MD_SUFFIX = /\.md$/

function isKnownPath(section: string, slug: string): boolean {
  switch (section) {
    case 'agents':
      return AGENT_SLUGS.has(slug)
    case 'learn':
      return LEARN_SLUGS.has(slug)
    case 'authors':
      // Author lookups are case-insensitive (see lib/github.ts).
      return AUTHOR_KEYS.has(slug.toLowerCase())
    default:
      return true
  }
}

export default function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split('/')
  const [, section, rawSlug] = segments

  // Only guard /{section}/{slug} and its .md mirror; deeper paths (OG
  // images, the internal /md route) resolve against the same slug set via
  // their own handlers.
  if (!rawSlug || segments.length > 3) {
    return NextResponse.next()
  }

  const slug = decodeURIComponent(rawSlug).replace(MD_SUFFIX, '')
  if (isKnownPath(section, slug)) {
    return NextResponse.next()
  }

  return NextResponse.rewrite(new URL('/404', request.url), { status: 404 })
}

export const config = {
  matcher: ['/agents/:path*', '/learn/:path*', '/authors/:path*'],
}
