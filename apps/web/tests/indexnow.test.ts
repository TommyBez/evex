import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  buildIndexNowPayload,
  getIndexNowKeyFilePath,
  getIndexNowKeyLocation,
  getIndexNowPublicFileRelativePath,
  INDEXNOW_ENDPOINT,
  INDEXNOW_FETCH_TIMEOUT_MS,
  INDEXNOW_KEY,
  INDEXNOW_SITE_URL,
  listIndexNowAgentsFromCatalog,
  listIndexNowPaths,
  listIndexNowUrls,
  parseIndexNowKeyFile,
  submitIndexNow,
} from '@/lib/indexnow'
import { listLearnPages } from '@/lib/learn-content'
import { listStaticAgents } from '@/lib/registry'

const SITE_URL = INDEXNOW_SITE_URL
const DOCS_SUBPAGE_PATH = /\/docs\/.+/
const KEY_FILE_MISMATCH = /must contain exactly/
const INDEXNOW_ABORT_OR_TIMEOUT = /abort|timeout/i
const WEB_ROOT = path.join(import.meta.dirname, '..')

function readWebSource(relativePath: string): string {
  return readFileSync(path.join(WEB_ROOT, relativePath), 'utf8')
}

describe('IndexNow money URL list', () => {
  it('covers home, docs, agents, agent slugs, and learn pages', () => {
    const agents = listStaticAgents()
    const learnPages = listLearnPages()
    const paths = listIndexNowPaths(agents, learnPages)
    const urls = listIndexNowUrls(SITE_URL, agents, learnPages)

    expect(paths).toEqual(
      expect.arrayContaining(['/', '/docs', '/agents', '/learn']),
    )
    expect(urls).toEqual(
      expect.arrayContaining([
        SITE_URL,
        `${SITE_URL}/docs`,
        `${SITE_URL}/agents`,
        `${SITE_URL}/learn`,
      ]),
    )

    for (const agent of agents) {
      expect(paths).toContain(`/agents/${agent.slug}`)
      expect(urls).toContain(`${SITE_URL}/agents/${agent.slug}`)
    }

    for (const page of learnPages) {
      expect(paths).toContain(`/learn/${page.slug}`)
      expect(urls).toContain(`${SITE_URL}/learn/${page.slug}`)
    }

    expect(urls).toHaveLength(4 + agents.length + learnPages.length)
    expect(urls.some((url) => url.includes('/leaderboard'))).toBe(false)
    expect(
      urls.some((url) => DOCS_SUBPAGE_PATH.test(new URL(url).pathname)),
    ).toBe(false)
  })

  it('reads agent slugs from the generated catalog the same way the submit script does', () => {
    const catalog = JSON.parse(
      readFileSync(
        path.join(
          WEB_ROOT,
          '../../packages/agent-registry/generated/catalog.json',
        ),
        'utf8',
      ),
    ) as { items: { meta: { slug: string } }[] }

    expect(
      listIndexNowAgentsFromCatalog(catalog)
        .map((agent) => agent.slug)
        .toSorted(),
    ).toEqual(
      listStaticAgents()
        .map((agent) => agent.slug)
        .toSorted(),
    )
  })
})

describe('IndexNow public key file', () => {
  it('commits the key as a static public file with exactly that key string', () => {
    const relativePath = getIndexNowPublicFileRelativePath()
    const filePath = path.join(WEB_ROOT, relativePath)
    const body = readFileSync(filePath, 'utf8')

    expect(relativePath).toBe(`public/${INDEXNOW_KEY}.txt`)
    expect(getIndexNowKeyFilePath()).toBe(`/${INDEXNOW_KEY}.txt`)
    expect(getIndexNowKeyLocation()).toBe(`${SITE_URL}/${INDEXNOW_KEY}.txt`)
    expect(body).toBe(INDEXNOW_KEY)
    expect(parseIndexNowKeyFile(body)).toBe(INDEXNOW_KEY)
    expect(parseIndexNowKeyFile(`${INDEXNOW_KEY}\n`)).toBe(INDEXNOW_KEY)
  })

  it('rejects a key file that does not match the committed key', () => {
    expect(() => parseIndexNowKeyFile('other-key')).toThrow(KEY_FILE_MISMATCH)
  })

  it('does not rewrite /{key}.txt through an env-backed API route', () => {
    const nextConfig = readWebSource('next.config.ts')
    const envSource = readWebSource('lib/env.ts')
    const envExample = readWebSource('.env.example')

    expect(nextConfig).not.toContain('/api/indexnow')
    expect(nextConfig).not.toContain('INDEXNOW_KEY')
    expect(envSource).not.toContain('INDEXNOW_KEY')
    expect(envSource).not.toContain('CRON_SECRET')
    expect(envExample).not.toContain('INDEXNOW_KEY=')
    expect(envExample).not.toContain('CRON_SECRET=')
    expect(existsSync(path.join(WEB_ROOT, 'vercel.json'))).toBe(false)
    expect(existsSync(path.join(WEB_ROOT, 'app/api/indexnow'))).toBe(false)
  })
})

describe('IndexNow submit', () => {
  it('builds the IndexNow JSON payload for the money URL set', () => {
    const agents = listStaticAgents()
    const learnPages = listLearnPages()
    const urls = listIndexNowUrls(SITE_URL, agents, learnPages)
    const payload = buildIndexNowPayload(urls, INDEXNOW_KEY, SITE_URL)

    expect(payload).toEqual({
      host: 'www.evex.sh',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    })
  })

  it('POSTs money URLs to the IndexNow endpoint', async () => {
    const urls = [`${SITE_URL}/`, `${SITE_URL}/docs`]
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }))

    const result = await submitIndexNow({
      fetchImpl,
      key: INDEXNOW_KEY,
      siteUrl: SITE_URL,
      urls,
    })

    expect(result).toEqual({
      count: 2,
      httpStatus: 200,
      status: 'submitted',
    })
    expect(fetchImpl).toHaveBeenCalledWith(INDEXNOW_ENDPOINT, {
      body: JSON.stringify(buildIndexNowPayload(urls, INDEXNOW_KEY, SITE_URL)),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'POST',
      signal: expect.any(AbortSignal),
    })
    expect(INDEXNOW_FETCH_TIMEOUT_MS).toBe(10_000)
  })

  it('returns the existing error shape when the request is aborted', async () => {
    const fetchImpl = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          const signal = init?.signal
          if (!signal) {
            reject(new Error('missing abort signal'))
            return
          }

          signal.addEventListener('abort', () => {
            reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
          })
        }),
    )

    const result = await submitIndexNow({
      fetchImpl,
      key: INDEXNOW_KEY,
      siteUrl: SITE_URL,
      timeoutMs: 5,
      urls: [`${SITE_URL}/`],
    })

    expect(result.status).toBe('error')
    expect(result).toEqual({
      message: expect.stringMatching(INDEXNOW_ABORT_OR_TIMEOUT),
      status: 'error',
    })
  })

  it('treats HTTP 202 as a successful submit', async () => {
    const result = await submitIndexNow({
      fetchImpl: vi.fn().mockResolvedValue(new Response(null, { status: 202 })),
      key: INDEXNOW_KEY,
      siteUrl: SITE_URL,
      urls: [`${SITE_URL}/`],
    })

    expect(result).toEqual({
      count: 1,
      httpStatus: 202,
      status: 'submitted',
    })
  })
})
