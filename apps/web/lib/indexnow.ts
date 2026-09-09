export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
export const INDEXNOW_SITE_URL = 'https://www.evex.sh'
export const INDEXNOW_KEY =
  '722f9dbdbaa7cdae691ad3fbf85aad80a13e57b451aab1b656f84b26b0d0aa84'
export const INDEXNOW_FETCH_TIMEOUT_MS = 10_000

export interface IndexNowPayload {
  host: string
  key: string
  keyLocation: string
  urlList: string[]
}

export type IndexNowSubmitResult =
  | {
      readonly count: number
      readonly httpStatus: number
      readonly status: 'submitted'
    }
  | { readonly message: string; readonly status: 'error' }

interface SubmitIndexNowOptions {
  fetchImpl?: typeof fetch
  key: string
  signal?: AbortSignal
  siteUrl?: string
  timeoutMs?: number
  urls: readonly string[]
}

// Money URLs only. Catalog lastmod lives in source; Soft Eng submits after
// the production deploy that ships the committed public key file.
export function listIndexNowPaths(
  agents: readonly { slug: string }[],
  learnPages: readonly { slug: string }[],
): string[] {
  const agentPaths = agents.map((agent) => `/agents/${agent.slug}`).sort()
  const learnPaths = learnPages.map((page) => `/learn/${page.slug}`).sort()

  return ['/', '/docs', '/agents', ...agentPaths, '/learn', ...learnPaths]
}

export function getIndexNowKeyFileName(key: string = INDEXNOW_KEY): string {
  return `${key}.txt`
}

export function getIndexNowKeyFilePath(key: string = INDEXNOW_KEY): string {
  return `/${getIndexNowKeyFileName(key)}`
}

export function getIndexNowPublicFileRelativePath(
  key: string = INDEXNOW_KEY,
): string {
  return `public/${getIndexNowKeyFileName(key)}`
}

export function getIndexNowKeyLocation(
  key: string = INDEXNOW_KEY,
  siteUrl: string = INDEXNOW_SITE_URL,
): string {
  return `${siteUrl}${getIndexNowKeyFilePath(key)}`
}

export function listIndexNowUrls(
  siteUrl: string,
  agents: readonly { slug: string }[],
  learnPages: readonly { slug: string }[],
): string[] {
  return listIndexNowPaths(agents, learnPages).map((path) =>
    path === '/' ? siteUrl : `${siteUrl}${path}`,
  )
}

export function buildIndexNowPayload(
  urls: readonly string[],
  key: string,
  siteUrl: string = INDEXNOW_SITE_URL,
): IndexNowPayload {
  return {
    host: new URL(siteUrl).host,
    key,
    keyLocation: getIndexNowKeyLocation(key, siteUrl),
    urlList: [...urls],
  }
}

export function parseIndexNowKeyFile(contents: string): string {
  const key = contents.trim()

  if (key !== INDEXNOW_KEY) {
    throw new Error(
      `IndexNow key file must contain exactly ${INDEXNOW_KEY}, received ${key || '(empty)'}`,
    )
  }

  return key
}

export function listIndexNowAgentsFromCatalog(catalog: {
  items: readonly { meta: { slug: string } }[]
}): { slug: string }[] {
  return catalog.items.map((item) => ({ slug: item.meta.slug }))
}

export async function submitIndexNow(
  options: SubmitIndexNowOptions,
): Promise<IndexNowSubmitResult> {
  const siteUrl = options.siteUrl ?? INDEXNOW_SITE_URL
  const fetchImpl = options.fetchImpl ?? fetch
  const payload = buildIndexNowPayload(options.urls, options.key, siteUrl)
  const signal =
    options.signal ??
    AbortSignal.timeout(options.timeoutMs ?? INDEXNOW_FETCH_TIMEOUT_MS)

  try {
    const response = await fetchImpl(INDEXNOW_ENDPOINT, {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'POST',
      signal,
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
