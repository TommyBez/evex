import { describe, expect, it } from 'vitest'
import { createPageMetadata } from '@/lib/metadata'

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
})
