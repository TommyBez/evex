import { describe, expect, it } from 'vitest'
import {
  buildInstallCommand,
  getAgentUrl,
  getRegistryItemUrl,
  getSiteHost,
  getSiteUrl,
} from '@/lib/site-url'

// With no VERCEL_* / NEXT_PUBLIC_SITE_URL configured (vitest env), the site
// URL falls back to the canonical production host. That host is the www one:
// the apex 308-redirects to it, so a default on the apex would emit canonical
// and sitemap URLs that redirect.
describe('site URL derivation', () => {
  it('falls back to the canonical www host', () => {
    expect(getSiteUrl()).toBe('https://www.evex.sh')
    expect(getSiteHost()).toBe('www.evex.sh')
    expect(new URL(getSiteUrl()).host).toBe('www.evex.sh')
  })

  it('builds agent URLs on the site host', () => {
    expect(getAgentUrl('code-reviewer')).toBe(
      'https://www.evex.sh/agents/code-reviewer',
    )
  })

  it('builds absolute registry item URLs with a JSON extension', () => {
    expect(getRegistryItemUrl('code-reviewer')).toBe(
      'https://www.evex.sh/r/code-reviewer.json',
    )
  })
})

describe('buildInstallCommand', () => {
  it('installs the absolute registry item URL with the eve CLI', () => {
    expect(buildInstallCommand('code-reviewer')).toBe(
      'eve add https://www.evex.sh/r/code-reviewer.json',
    )
  })
})
