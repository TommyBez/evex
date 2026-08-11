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
  socialTitle,
}: {
  title: string
  description: string
  path: string
  noIndex?: boolean
  markdownPath?: string
  // Overrides og:title and twitter:title when the social card should read
  // differently from the SEO title. The rendered <title> is untouched.
  socialTitle?: string
}): Metadata {
  const cardTitle = socialTitle ?? title

  return {
    title,
    description,
    alternates: {
      canonical: path,
      ...(markdownPath ? { types: { 'text/markdown': markdownPath } } : {}),
    },
    openGraph: {
      title: cardTitle,
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
      title: cardTitle,
      description,
      images: [defaultTwitterImage],
    },
    // Only add `robots` when the page opts out of indexing. Passing the key
    // with an `undefined` value still overrides the root layout robots block
    // when Next merges metadata, which drops `index, follow` plus the
    // googleBot preview directives from every page built with this helper.
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: {
              index: false,
              follow: false,
            },
          },
        }
      : {}),
  }
}
