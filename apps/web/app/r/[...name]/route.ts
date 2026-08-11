import {
  getRegistryItem,
  RegistryItemNotFoundError,
} from '@evex/agent-registry'
import { after, connection, NextResponse } from 'next/server'
import { incrementInstallCount } from '@/lib/data/install-metrics'
import { shouldCountInstall } from '@/lib/install-tracking'

const JSON_EXTENSION = '.json'
const MAX_LOGGED_USER_AGENT_LENGTH = 150

function normalizeRegistryItemName(segments: string[]): string | null {
  if (segments.length !== 1) {
    return null
  }

  const [segment] = segments
  if (!segment) {
    return null
  }

  return segment.endsWith(JSON_EXTENSION)
    ? segment.slice(0, -JSON_EXTENSION.length)
    : segment
}

// Diagnostic: Vercel runtime logs omit the user agent, so the clients that
// slip past the install filter cannot be identified from traffic alone. One
// structured line per hit makes them visible without changing the response.
// `counted` records the user agent decision only: the install increment is
// scheduled just for successful lookups, and `found` separates the two cases
// so that sweepers probing slugs that do not exist stay visible as well.
function logRegistryHit({
  slug,
  userAgent,
  counted,
  found,
}: {
  slug: string
  userAgent: string | null
  counted: boolean
  found: boolean
}): void {
  console.info(
    JSON.stringify({
      evt: 'registry_hit',
      slug,
      ua: (userAgent ?? '').slice(0, MAX_LOGGED_USER_AGENT_LENGTH),
      counted,
      found,
    }),
  )
}

// Public shadcn registry item endpoint. The registry package embeds file
// contents at build time while preserving best-effort install/download counts.
// Only non-browser, non-crawler requests increment the counter; the response is
// identical either way.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string[] }> },
) {
  const { name: nameSegments } = await params
  const name = normalizeRegistryItemName(nameSegments)

  if (!name) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  await connection()

  const userAgent = request.headers.get('user-agent')
  const counted = shouldCountInstall(userAgent)

  try {
    const item = await getRegistryItem(name)

    logRegistryHit({ slug: name, userAgent, counted, found: true })

    if (counted) {
      after(async () => {
        try {
          await incrementInstallCount(name)
        } catch {
          // Best-effort tracking; ignore failures.
        }
      })
    }

    return NextResponse.json(item, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    if (error instanceof RegistryItemNotFoundError) {
      logRegistryHit({ slug: name, userAgent, counted, found: false })

      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    throw error
  }
}
