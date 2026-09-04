import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { GET as getLlmsTxt } from '@/app/llms.txt/route'
import { GET as getLlmsFullTxt } from '@/app/llms-full.txt/route'
import sitemap from '@/app/sitemap'
import { getLearnPage, listLearnPages } from '@/lib/learn-content'

const REMOVED_SLUG = 'eve-agent-registry'
const REMOVED_PATH = '/learn/eve-agent-registry'
const REMOVED_URL = 'https://www.evex.sh/learn/eve-agent-registry'

function readWebSource(relativePath: string): string {
  return readFileSync(
    path.join(import.meta.dirname, '..', relativePath),
    'utf8',
  )
}

describe('killed learn page: eve-agent-registry', () => {
  it('is removed from the learn catalog', () => {
    expect(getLearnPage(REMOVED_SLUG)).toBeNull()
    expect(listLearnPages().some((entry) => entry.slug === REMOVED_SLUG)).toBe(
      false,
    )

    const sibling = getLearnPage('agent-registry')
    expect(sibling).not.toBeNull()
    expect(sibling?.title).toBe(
      'Agent registry: discovery without trust is just a list',
    )
  })

  it('permanently redirects /learn/eve-agent-registry and its .md mirror to /docs', () => {
    const source = readWebSource('next.config.ts')

    expect(source).toContain('redirects()')
    expect(source).toContain("source: '/learn/eve-agent-registry'")
    expect(source).toContain("source: '/learn/eve-agent-registry.md'")
    expect(source).toContain("destination: '/docs'")
    expect(source).toContain('permanent: true')
  })

  it('is omitted from sitemap and llms twins', async () => {
    const sitemapUrls = sitemap().map((entry) => entry.url)
    expect(sitemapUrls).not.toContain(REMOVED_URL)
    expect(sitemapUrls.some((url) => url.includes(REMOVED_PATH))).toBe(false)

    const llmsTxt = await getLlmsTxt().text()
    const llmsFullTxt = await getLlmsFullTxt().text()

    expect(llmsTxt).not.toContain(REMOVED_PATH)
    expect(llmsTxt).not.toContain(REMOVED_SLUG)
    expect(llmsFullTxt).not.toContain(REMOVED_PATH)
    expect(llmsFullTxt).not.toContain(REMOVED_SLUG)
  })

  it('has no remaining in-body links to the removed path', () => {
    const sources = [
      readWebSource('lib/learn-content.ts'),
      readWebSource('lib/docs-content.ts'),
      readWebSource('app/(main)/learn/page.tsx'),
    ]

    for (const source of sources) {
      expect(source).not.toContain(REMOVED_PATH)
    }
  })
})
