import 'server-only'

import { env } from '@/lib/env'
import { listLearnPages } from '@/lib/learn-content'
import { listStaticAgents } from '@/lib/registry'
import { getSiteUrl } from '@/lib/site-url'

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

export interface IndexNowPayload {
  host: string
  key: string
  keyLocation: string
  urlList: string[]
}

export type IndexNowSubmitResult =
  | {
      readonly reason: 'missing_key' | 'not_production'
      readonly status: 'skipped'
    }
  | {
      readonly count: number
      readonly httpStatus: number
      readonly status: 'submitted'
    }
  | { readonly message: string; readonly status: 'error' }

interface SubmitIndexNowOptions {
  fetchImpl?: typeof fetch
  key?: string | undefined
  siteUrl?: string
  urls?: readonly string[]
  vercelEnv?: string | undefined
}

// Money URLs only. Catalog lastmod lives in source, so production deploys
// are the publish event; the Vercel cron is the post-deploy submit hook.
export function listIndexNowPaths(
  agents: readonly { slug: string }[] = listStaticAgents(),
  learnPages: readonly { slug: string }[] = listLearnPages(),
): string[] {
  const agentPaths = agents.map((agent) => `/agents/${agent.slug}`).sort()
  const learnPaths = learnPages.map((page) => `/learn/${page.slug}`).sort()

  return ['/', '/docs', '/agents', ...agentPaths, '/learn', ...learnPaths]
}

export function getIndexNowKeyFilePath(key: string): string {
  return `/${key}.txt`
}

export function getIndexNowKeyLocation(
  key: string,
  siteUrl: string = getSiteUrl(),
): string {
  return `${siteUrl}${getIndexNowKeyFilePath(key)}`
}

export function listIndexNowUrls(siteUrl: string = getSiteUrl()): string[] {
  return listIndexNowPaths().map((path) =>
    path === '/' ? siteUrl : `${siteUrl}${path}`,
  )
}

export function buildIndexNowPayload(
  urls: readonly string[],
  key: string,
  siteUrl: string = getSiteUrl(),
): IndexNowPayload {
  return {
    host: new URL(siteUrl).host,
    key,
    keyLocation: getIndexNowKeyLocation(key, siteUrl),
    urlList: [...urls],
  }
}

export function isIndexNowKeyFileRequest(
  requestKey: string,
  configuredKey: string | undefined = env.INDEXNOW_KEY,
): boolean {
  return Boolean(configuredKey) && requestKey === configuredKey
}

export function buildIndexNowKeyFileResponse(
  requestKey: string,
  configuredKey: string | undefined = env.INDEXNOW_KEY,
): Response {
  if (!isIndexNowKeyFileRequest(requestKey, configuredKey)) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(configuredKey, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex',
    },
  })
}

export function isIndexNowCronAuthorized(
  request: Request,
  secret: string | undefined = env.CRON_SECRET,
): boolean {
  if (!secret) {
    return false
  }

  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function submitIndexNow(
  options: SubmitIndexNowOptions = {},
): Promise<IndexNowSubmitResult> {
  const key = options.key ?? env.INDEXNOW_KEY
  const vercelEnv = options.vercelEnv ?? env.VERCEL_ENV
  const siteUrl = options.siteUrl ?? getSiteUrl()
  const urls = options.urls ?? listIndexNowUrls(siteUrl)
  const fetchImpl = options.fetchImpl ?? fetch

  if (!key) {
    return { reason: 'missing_key', status: 'skipped' }
  }

  if (vercelEnv !== 'production') {
    return { reason: 'not_production', status: 'skipped' }
  }

  const payload = buildIndexNowPayload(urls, key, siteUrl)

  try {
    const response = await fetchImpl(INDEXNOW_ENDPOINT, {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'POST',
    })

    if (!response.ok && response.status !== 202) {
      return {
        message: `IndexNow responded ${response.status}`,
        status: 'error',
      }
    }

    return {
      count: payload.urlList.length,
      httpStatus: response.status,
      status: 'submitted',
    }
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : 'IndexNow request failed',
      status: 'error',
    }
  }
}
