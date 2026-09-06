import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { generateMetadata as generateAgentsMetadata } from '@/app/(main)/agents/page'
import { generateMetadata as generateHomeMetadata } from '@/app/(main)/page'
import {
  createPageMetadata,
  hasListingSearchFilter,
  siteConfig,
} from '@/lib/metadata'

const HOME_DOCUMENT_TITLE =
  'Eve agent registry: install Eve agents for the Eve framework | evex'
const HOME_SOCIAL_TITLE =
  'Eve agent registry: install Eve agents for the Eve framework'
const HOME_DESCRIPTION =
  'Community Eve agent registry for the Eve agent framework. Preview every file, then install with npx shadcn@latest add @evex/<slug>.'
const HOME_H1 = 'Install Eve agents for the Eve agent framework'
const HOME_LEDE =
  'The community Eve agent registry. Preview every file, then install with one shadcn command, including agents you run from MCP-ready editors.'
const HOME_EYEBROW = 'evex · Eve agent registry'
const HOME_H1_TAG = /<h1[^>]*>([\s\S]*?)<\/h1>/

const readJsxElementText = (source: string, tag: RegExp): string =>
  (tag.exec(source)?.[1] ?? '')
    .replaceAll("{' '}", ' ')
    .replaceAll(/<[^>]+>/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim()

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
  it('ships the locked document title as an absolute title', async () => {
    const homeMetadata = await generateHomeMetadata({
      searchParams: Promise.resolve({}),
    })

    expect(homeMetadata.title).toEqual({ absolute: HOME_DOCUMENT_TITLE })
    expect(homeMetadata.description).toBe(HOME_DESCRIPTION)
  })

  it('does not let the root layout append a second brand suffix', () => {
    // The root layout template is `%s · evex`. An absolute title keeps the
    // locked `| evex` document title from becoming `| evex · evex`.
    expect(HOME_DOCUMENT_TITLE).toBe(
      'Eve agent registry: install Eve agents for the Eve framework | evex',
    )
    expect(HOME_DOCUMENT_TITLE.endsWith(`| ${siteConfig.name}`)).toBe(true)
  })

  it('uses the locked title without the brand suffix on social cards', async () => {
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

  it('locks the home hero eyebrow, H1, and lede', () => {
    const source = readFileSync(
      path.join(import.meta.dirname, '../app/(main)/page.tsx'),
      'utf8',
    )
    const collapsed = source.replaceAll(/\s+/g, ' ')

    expect(source).toContain(HOME_EYEBROW)
    expect(readJsxElementText(source, HOME_H1_TAG)).toBe(HOME_H1)
    expect(collapsed).toContain(HOME_LEDE)
    expect(source).toContain('Browse Agents')
    expect(source).toContain("buildInstallCommand('code-reviewer')")
    expect(source).toContain('@evex/<slug>')
    expect(source).not.toContain('\u2014')
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
    expect(withQuery.title).toEqual({ absolute: HOME_DOCUMENT_TITLE })
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
