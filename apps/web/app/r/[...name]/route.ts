import { after, connection, NextResponse } from 'next/server'
import { RegistryItemNotFoundError } from 'shadcn/registry'
import { incrementInstallCount } from '@/app/actions/agents'
import { loadEvexRegistryItem } from '@/lib/registry'

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

// Public shadcn registry item endpoint. It keeps the registry source in
// registry.json files while preserving best-effort install/download counts.
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
    const item = await loadEvexRegistryItem(name)

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
