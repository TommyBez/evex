import 'server-only'

import { env } from '@/lib/env'

const DEFAULT_SITE_URL = 'https://evex.sh'
const TRAILING_SLASHES = /\/+$/
const URL_PROTOCOL = /^https?:\/\//

// Single source of truth for the public site URL. On Vercel,
// VERCEL_PROJECT_PRODUCTION_URL is set to the production host on every
// deployment — including previews. Prefer it only in production so previews
// resolve to their own deployment URL. This matters for copied install
// commands (`<host>/r/<slug>`): they must point at a host that actually
// serves the agent being viewed, otherwise a not-yet-merged agent 404s when
// installed from a preview.
export function getSiteUrl(): string {
  const productionUrl =
    env.VERCEL_ENV === 'production'
      ? env.VERCEL_PROJECT_PRODUCTION_URL
      : undefined
  const envUrl =
    env.NEXT_PUBLIC_SITE_URL ??
    productionUrl ??
    env.VERCEL_URL ??
    env.V0_RUNTIME_URL ??
    DEFAULT_SITE_URL

  const url = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`

  try {
    const parsed = new URL(url)
    const pathname =
      parsed.pathname === '/'
        ? ''
        : parsed.pathname.replace(TRAILING_SLASHES, '')
    return `${parsed.origin}${pathname}`
  } catch {
    return DEFAULT_SITE_URL
  }
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl())
}

// Bare host (no protocol) for compact display, e.g. OG install hints.
export function getSiteHost(): string {
  return getSiteUrl().replace(URL_PROTOCOL, '')
}

export function buildInstallCommand(slug: string): string {
  return `npx shadcn@latest add @evex/${slug}`
}

export function getAgentUrl(slug: string): string {
  return `${getSiteUrl()}/agents/${slug}`
}

export function getAuthorUrl(githubUsername: string): string {
  return `${getSiteUrl()}/authors/${githubUsername}`
}

export function getLearnUrl(slug: string): string {
  return `${getSiteUrl()}/learn/${slug}`
}
