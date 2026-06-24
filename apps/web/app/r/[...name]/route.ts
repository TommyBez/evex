import {
  getRegistryItem,
  RegistryItemNotFoundError,
} from '@evex/agent-registry'
import { after, connection, NextResponse } from 'next/server'
import { incrementInstallCount } from '@/lib/install-metrics'

const JSON_EXTENSION = '.json'

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

// Public shadcn registry item endpoint. The registry package embeds file
// contents at build time while preserving best-effort install/download counts.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string[] }> },
) {
  const { name: nameSegments } = await params
  const name = normalizeRegistryItemName(nameSegments)

  if (!name) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  await connection()

  try {
    const item = getRegistryItem(name)

    after(async () => {
      try {
        await incrementInstallCount(name)
      } catch {
        // Best-effort tracking; ignore failures.
      }
    })

    return NextResponse.json(item, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    if (error instanceof RegistryItemNotFoundError) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    throw error
  }
}
