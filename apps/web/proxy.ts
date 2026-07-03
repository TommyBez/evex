import { getRegistry } from '@evex/agent-registry'
import { type NextRequest, NextResponse } from 'next/server'
import { listLearnPages } from '@/lib/learn-content'

// Under `cacheComponents`, `dynamicParams = false` is not supported and a
// `notFound()` thrown while rendering an unknown param either streams a
// 200 soft 404 (when thrown inside Suspense) or crashes the request with
// "Invalid revalidate configuration provided: 0 < 1" (when thrown from the
// static shell). Validating params here — against the same build-time
// registry the pages read — is the only way to serve crawlers a real 404.
const catalogItems = getRegistry().items
const agentSlugs = new Set(catalogItems.map((item) => item.name))
const authorKeys = new Set(
  catalogItems.map((item) => item.author.trim().toLowerCase()),
)
const learnSlugs = new Set(listLearnPages().map((page) => page.slug))

// Client-side navigation fetches flight payloads at suffixed paths such as
// `/agents/{slug}.rsc`; validate the underlying slug, not the raw segment.
const RSC_PATH_SUFFIX = /\.rsc$/

function isKnownPath(section: string, rawValue: string): boolean {
  let value = rawValue.replace(RSC_PATH_SUFFIX, '')
  try {
    value = decodeURIComponent(value)
  } catch {
    return false
  }

  switch (section) {
    case 'agents':
      return agentSlugs.has(value)
    case 'learn':
      return learnSlugs.has(value)
    case 'authors':
      return authorKeys.has(value.trim().toLowerCase())
    default:
      return false
  }
}

export default function proxy(request: NextRequest) {
  const [, section = '', value = ''] = request.nextUrl.pathname.split('/')

  if (isKnownPath(section, value)) {
    return NextResponse.next()
  }

  // Rewrite to a path no route matches: Next.js renders the global
  // not-found page with a real 404 status code.
  const url = request.nextUrl.clone()
  url.pathname = '/404'
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/agents/:slug', '/learn/:slug', '/authors/:githubUsername'],
}
