import type { Metadata } from 'next'

const DEFAULT_SITE_URL = 'https://evex-new.sh'
const TRAILING_SLASHES = /\/+$/

export const siteConfig = {
  name: 'evex-new',
  title: 'evex-new - Install eve agents',
  description:
    'Discover, contribute, and install eve agents with a single shadcn command.',
}

export const defaultOpenGraphImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'evex-new - the eve agent registry',
}

export const defaultTwitterImage = {
  url: '/twitter-image',
  alt: 'evex-new - the eve agent registry',
}

export function getSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
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
