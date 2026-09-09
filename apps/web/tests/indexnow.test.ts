import { describe, expect, it, vi } from 'vitest'
import { GET as getIndexNowKeyFile } from '@/app/api/indexnow/key/[key]/route'
import {
  buildIndexNowKeyFileResponse,
  buildIndexNowPayload,
  getIndexNowKeyFilePath,
  getIndexNowKeyLocation,
  INDEXNOW_ENDPOINT,
  isIndexNowCronAuthorized,
  isIndexNowKeyFileRequest,
  listIndexNowPaths,
  listIndexNowUrls,
  submitIndexNow,
} from '@/lib/indexnow'
import { listLearnPages } from '@/lib/learn-content'
import { listStaticAgents } from '@/lib/registry'

const SITE_URL = 'https://www.evex.sh'
const EXAMPLE_KEY = '0123456789abcdef0123456789abcdef'
const CRON_SECRET = 'test-cron-secret'
const DOCS_SUBPAGE_PATH = /\/docs\/.+/

function authorizedRequest(url: string, secret = CRON_SECRET): Request {
  return new Request(url, {
    headers: { authorization: `Bearer ${secret}` },
  })
}

describe('IndexNow money URL list', () => {
  it('covers home, docs, agents, agent slugs, and learn pages', () => {
    const paths = listIndexNowPaths()
    const urls = listIndexNowUrls(SITE_URL)
    const agents = listStaticAgents()
    const learnPages = listLearnPages()

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
})

describe('IndexNow key path', () => {
  it('uses the documented /{key}.txt location', () => {
    expect(getIndexNowKeyFilePath(EXAMPLE_KEY)).toBe(`/${EXAMPLE_KEY}.txt`)
    expect(getIndexNowKeyLocation(EXAMPLE_KEY, SITE_URL)).toBe(
      `${SITE_URL}/${EXAMPLE_KEY}.txt`,
    )
  })

  it('serves the key only when the request matches the configured key', () => {
    expect(isIndexNowKeyFileRequest(EXAMPLE_KEY, EXAMPLE_KEY)).toBe(true)
    expect(isIndexNowKeyFileRequest('other-key', EXAMPLE_KEY)).toBe(false)
    expect(isIndexNowKeyFileRequest(EXAMPLE_KEY, undefined)).toBe(false)

    const ok = buildIndexNowKeyFileResponse(EXAMPLE_KEY, EXAMPLE_KEY)
    expect(ok.status).toBe(200)
    expect(ok.headers.get('Content-Type')).toContain('text/plain')
    expect(ok.headers.get('X-Robots-Tag')).toBe('noindex')

    const missing = buildIndexNowKeyFileResponse(EXAMPLE_KEY, undefined)
    expect(missing.status).toBe(404)
  })

  it('404s the hosted key file when INDEXNOW_KEY is unset', async () => {
    const response = await getIndexNowKeyFile(
      new Request(`${SITE_URL}/${EXAMPLE_KEY}.txt`),
      {
        params: Promise.resolve({ key: EXAMPLE_KEY }),
      },
    )

    expect(response.status).toBe(404)
  })
})

describe('IndexNow submit', () => {
  it('builds the IndexNow JSON payload for the money URL set', () => {
    const urls = listIndexNowUrls(SITE_URL)
    const payload = buildIndexNowPayload(urls, EXAMPLE_KEY, SITE_URL)

    expect(payload).toEqual({
      host: 'www.evex.sh',
      key: EXAMPLE_KEY,
      keyLocation: `${SITE_URL}/${EXAMPLE_KEY}.txt`,
      urlList: urls,
    })
  })

  it('skips when the key is missing or the environment is not production', async () => {
    await expect(
      submitIndexNow({ key: undefined, vercelEnv: 'production' }),
    ).resolves.toEqual({ reason: 'missing_key', status: 'skipped' })
    await expect(
      submitIndexNow({ key: EXAMPLE_KEY, vercelEnv: 'preview' }),
    ).resolves.toEqual({ reason: 'not_production', status: 'skipped' })
  })

  it('POSTs money URLs to the IndexNow endpoint in production', async () => {
    const urls = [`${SITE_URL}/`, `${SITE_URL}/docs`]
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }))

    const result = await submitIndexNow({
      fetchImpl,
      key: EXAMPLE_KEY,
      siteUrl: SITE_URL,
      urls,
      vercelEnv: 'production',
    })

    expect(result).toEqual({
      count: 2,
      httpStatus: 200,
      status: 'submitted',
    })
    expect(fetchImpl).toHaveBeenCalledWith(INDEXNOW_ENDPOINT, {
      body: JSON.stringify(buildIndexNowPayload(urls, EXAMPLE_KEY, SITE_URL)),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'POST',
    })
  })
})

describe('IndexNow cron auth', () => {
  it('requires a matching Bearer CRON_SECRET', () => {
    const request = authorizedRequest(`${SITE_URL}/api/indexnow`)

    expect(isIndexNowCronAuthorized(request, CRON_SECRET)).toBe(true)
    expect(isIndexNowCronAuthorized(request, undefined)).toBe(false)
    expect(
      isIndexNowCronAuthorized(
        new Request(`${SITE_URL}/api/indexnow`),
        CRON_SECRET,
      ),
    ).toBe(false)
  })
})
