import type { Metadata } from 'next'

export const siteConfig = {
  name: 'evex',
  title: 'evex: Vercel eve Agent Registry | Install with One Command',
  description:
    "evex is the community registry for eve agents, reusable agents built on eve, Vercel's agent framework. Browse configurations, preview every file before install, and add agents with one shadcn command.",
}

export const siteTwitterHandle = '@TommyBez85'

export const defaultOpenGraphImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'evex - the eve agent registry',
}

export const defaultTwitterImage = {
  url: '/twitter-image',
  width: 1200,
  height: 630,
  alt: 'evex - the eve agent registry',
}

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  markdownPath,
}: {
  title: string
  description: string
  path: string
  noIndex?: boolean
  markdownPath?: string
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
      ...(markdownPath ? { types: { 'text/markdown': markdownPath } } : {}),
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
      site: siteTwitterHandle,
      creator: siteTwitterHandle,
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
