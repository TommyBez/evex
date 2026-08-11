import { describe, expect, it } from 'vitest'
import { metadata as homeMetadata } from '@/app/(main)/page'
import { createPageMetadata, siteConfig } from '@/lib/metadata'

// The home page ranks for "vercel eve", so its SEO title is frozen. Social
// cards get a dedicated title that leads with the evex brand instead.
const HOME_SEO_TITLE =
  'Vercel eve Agent Registry: Install eve Agents with One Command'
const HOME_SOCIAL_TITLE =
  'evex: the eve Agent Registry. Install eve Agents with One Command'

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

  it('marks pages as noindex when they opt out', () => {
    const metadata = createPageMetadata({
      description: 'Your evex profile.',
      noIndex: true,
      path: '/profile',
      title: 'Profile',
    })

    expect('robots' in metadata).toBe(true)
    expect(metadata.robots).toEqual({
      follow: false,
      googleBot: {
        follow: false,
        index: false,
      },
      index: false,
    })
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

describe('home page metadata', () => {
  it('keeps the seo title unchanged', () => {
    expect(homeMetadata.title).toBe(HOME_SEO_TITLE)
  })

  it('renders the seo title with the root layout suffix', () => {
    // The root layout template is `%s · evex`, so this is the <title> the
    // page ships today and it must stay that way.
    expect(`${HOME_SEO_TITLE} · ${siteConfig.name}`).toBe(
      'Vercel eve Agent Registry: Install eve Agents with One Command · evex',
    )
  })

  it('leads with evex on the social cards', () => {
    expect(homeMetadata.openGraph?.title).toBe(HOME_SOCIAL_TITLE)
    expect(homeMetadata.twitter?.title).toBe(HOME_SOCIAL_TITLE)
  })

  it('keeps the layout title suffix out of the social title', () => {
    const socialTitle = String(homeMetadata.openGraph?.title)

    expect(socialTitle).not.toContain(` · ${siteConfig.name}`)
    expect(socialTitle).not.toContain(`| ${siteConfig.name}`)
  })
})
