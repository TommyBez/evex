import type { Metadata } from 'next'

const DEFAULT_SITE_URL = 'https://evex.sh'
const TRAILING_SLASHES = /\/+$/
const URL_PROTOCOL = /^https?:\/\//

export const siteConfig = {
  name: 'evex',
  title: 'evex - Install eve agents',
  description: 'Discover and install eve agents with a single shadcn command.',
}

const defaultOpenGraphImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'evex - the eve agent registry',
}

const defaultTwitterImage = {
  url: '/twitter-image',
  alt: 'evex - the eve agent registry',
}

export function getSiteUrl(): string {
  // On Vercel, VERCEL_PROJECT_PRODUCTION_URL is set to the production host on
  // every deployment — including previews. Prefer it only in production so
  // previews resolve to their own deployment URL. This matters for copied
  // install commands (`<host>/r/<slug>`): they must point at a host that
  // actually serves the agent being viewed, otherwise a not-yet-merged agent
  // 404s when installed from a preview.
  const productionUrl =
    process.env.VERCEL_ENV === 'production'
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : undefined
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    productionUrl ??
    process.env.VERCEL_URL ??
    process.env.V0_RUNTIME_URL ??
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

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string
  description: string
  path: string
  noIndex?: boolean
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: 'en_US',
      type: 'website',
      images: [defaultOpenGraphImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [defaultTwitterImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : undefined,
  }
}
