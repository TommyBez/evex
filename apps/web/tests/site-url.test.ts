import { describe, expect, it } from 'vitest'
import {
  buildInstallCommand,
  getAgentUrl,
  getSiteHost,
  getSiteUrl,
} from '@/lib/site-url'

// With no VERCEL_* / NEXT_PUBLIC_SITE_URL configured (vitest env), the site
// URL falls back to the canonical production host.
describe('site URL derivation', () => {
  it('falls back to the canonical host', () => {
    expect(getSiteUrl()).toBe('https://evex.sh')
    expect(getSiteHost()).toBe('evex.sh')
  })

  it('builds agent URLs on the site host', () => {
    expect(getAgentUrl('code-reviewer')).toBe(
      'https://evex.sh/agents/code-reviewer',
    )
  })
})

describe('buildInstallCommand', () => {
  it('targets the @evex shadcn namespace', () => {
    expect(buildInstallCommand('code-reviewer')).toBe(
      'npx shadcn@latest add @evex/code-reviewer',
    )
  })
})
