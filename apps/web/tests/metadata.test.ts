import { describe, expect, it } from 'vitest'
import { generateMetadata as generateAgentsMetadata } from '@/app/(main)/agents/page'
import { generateMetadata as generateHomeMetadata } from '@/app/(main)/page'
import {
  createPageMetadata,
  hasListingSearchFilter,
  siteConfig,
} from '@/lib/metadata'

// The home page ranks for "vercel eve", so its SEO title is frozen. Social
// cards get a dedicated title that leads with the evex brand instead.
const HOME_SEO_TITLE =
  'Vercel eve Agent Registry: Install eve Agents with One Command'
const HOME_SOCIAL_TITLE =
  'evex: the eve Agent Registry. Install eve Agents with One Command'

const NOINDEX_NOFOLLOW = {
  follow: false,
  googleBot: {
    follow: false,
    index: false,
  },
  index: false,
} as const

const NOINDEX_FOLLOW = {
  follow: true,
  googleBot: {
    follow: true,
    index: false,
  },
  index: false,
} as const

// Next merges page metadata over the root layout metadata key by key. A
// `robots` key present with an `undefined` value still wins the merge, so an
// indexable page must not declare the key at all.
describe('createPageMetadata', () => {
  it('omits the robots key for indexable pages', () => {
    const metadata = createPageMetadata({
      description: 'Publish an agent to the evex registry.',
      path: '/docs/publishing',
      title: 'Publishing',
    })

    expect('robots' in metadata).toBe(false)
    expect(metadata.alternates?.canonical).toBe('/docs/publishing')
  })

  it('marks pages as noindex, nofollow when they opt out', () => {
    const metadata = createPageMetadata({
      description: 'Your evex profile.',
      noIndex: true,
      path: '/profile',
      title: 'Profile',
    })

    expect('robots' in metadata).toBe(true)
    expect(metadata.robots).toEqual(NOINDEX_NOFOLLOW)
  })

  it('emits noindex, follow when follow is requested with noIndex', () => {
    const metadata = createPageMetadata({
      description: 'Filtered listing.',
      follow: true,
      noIndex: true,
      path: '/',
      title: 'Home',
    })

    expect(metadata.robots).toEqual(NOINDEX_FOLLOW)
  })

  it('ignores follow when the page is indexable', () => {
    const metadata = createPageMetadata({
      description: 'Clean listing.',
      follow: true,
      path: '/',
      title: 'Home',
    })

    expect('robots' in metadata).toBe(false)
  })

  it('reuses the page title on social cards by default', () => {
    const metadata = createPageMetadata({
      description: 'Publish an agent to the evex registry.',
      path: '/docs/publishing',
      title: 'Publishing',
    })

    expect(metadata.openGraph?.title).toBe('Publishing')
    expect(metadata.twitter?.title).toBe('Publishing')
  })

  it('lets a page override the social card title', () => {
    const metadata = createPageMetadata({
      description: 'Publish an agent to the evex registry.',
      path: '/docs/publishing',
      socialTitle: 'Publish an agent on evex',
      title: 'Publishing',
    })

    expect(metadata.title).toBe('Publishing')
    expect(metadata.openGraph?.title).toBe('Publish an agent on evex')
    expect(metadata.twitter?.title).toBe('Publish an agent on evex')
  })
})

describe('hasListingSearchFilter', () => {
  it('treats empty and category=all as not filtered', () => {
    expect(hasListingSearchFilter({})).toBe(false)
    expect(hasListingSearchFilter({ category: 'all' })).toBe(false)
    expect(hasListingSearchFilter({ sort: 'popular' })).toBe(false)
  })

  it('treats q or a real category as filtered', () => {
    expect(hasListingSearchFilter({ q: 'review' })).toBe(true)
    expect(hasListingSearchFilter({ category: 'devops' })).toBe(true)
  })
})

describe('home page metadata', () => {
  it('keeps the seo title unchanged on the clean URL', async () => {
    const homeMetadata = await generateHomeMetadata({
      searchParams: Promise.resolve({}),
    })

    expect(homeMetadata.title).toBe(HOME_SEO_TITLE)
  })

  it('renders the seo title with the root layout suffix', () => {
    // The root layout template is `%s · evex`, so this is the <title> the
    // page ships today and it must stay that way.
    expect(`${HOME_SEO_TITLE} · ${siteConfig.name}`).toBe(
      'Vercel eve Agent Registry: Install eve Agents with One Command · evex',
    )
  })

  it('leads with evex on the social cards', async () => {
    const homeMetadata = await generateHomeMetadata({
      searchParams: Promise.resolve({}),
    })

    expect(homeMetadata.openGraph?.title).toBe(HOME_SOCIAL_TITLE)
    expect(homeMetadata.twitter?.title).toBe(HOME_SOCIAL_TITLE)
  })

  it('keeps the layout title suffix out of the social title', async () => {
    const homeMetadata = await generateHomeMetadata({
      searchParams: Promise.resolve({}),
    })
    const socialTitle = String(homeMetadata.openGraph?.title)

    expect(socialTitle).not.toContain(` · ${siteConfig.name}`)
    expect(socialTitle).not.toContain(`| ${siteConfig.name}`)
  })

  it('stays indexable on the clean URL and with sort alone', async () => {
    const clean = await generateHomeMetadata({
      searchParams: Promise.resolve({}),
    })
    const sortOnly = await generateHomeMetadata({
      searchParams: Promise.resolve({ sort: 'popular' }),
    })
    const categoryAll = await generateHomeMetadata({
      searchParams: Promise.resolve({ category: 'all' }),
    })

    expect('robots' in clean).toBe(false)
    expect('robots' in sortOnly).toBe(false)
    expect('robots' in categoryAll).toBe(false)
    expect(clean.alternates?.canonical).toBe('/')
  })

  it('noindexes filtered home URLs with follow', async () => {
    const withQuery = await generateHomeMetadata({
      searchParams: Promise.resolve({ q: 'review' }),
    })
    const withCategory = await generateHomeMetadata({
      searchParams: Promise.resolve({ category: 'devops' }),
    })

    expect(withQuery.robots).toEqual(NOINDEX_FOLLOW)
    expect(withCategory.robots).toEqual(NOINDEX_FOLLOW)
    expect(withQuery.alternates?.canonical).toBe('/')
    expect(withQuery.title).toBe(HOME_SEO_TITLE)
  })
})

describe('agents index metadata', () => {
  it('stays indexable on the clean URL', async () => {
    const metadata = await generateAgentsMetadata({
      searchParams: Promise.resolve({}),
    })

    expect('robots' in metadata).toBe(false)
    expect(metadata.alternates?.canonical).toBe('/agents')
  })

  it('noindexes filtered agents URLs with follow', async () => {
    const withQuery = await generateAgentsMetadata({
      searchParams: Promise.resolve({ q: 'review' }),
    })
    const withCategory = await generateAgentsMetadata({
      searchParams: Promise.resolve({ category: 'devops' }),
    })

    expect(withQuery.robots).toEqual(NOINDEX_FOLLOW)
    expect(withCategory.robots).toEqual(NOINDEX_FOLLOW)
    expect(withQuery.alternates?.canonical).toBe('/agents')
  })
})
