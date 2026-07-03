import type { Metadata } from 'next'

export const siteConfig = {
  name: 'evex',
  title: 'evex | Install eve Agents with One Command',
  description:
    'evex is the community registry for eve agents. Browse configurations, preview files before install, and add agents with one shadcn command.',
}

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
