import { NextResponse } from 'next/server'
import { loadEvexRegistry } from '@/lib/registry'

// Public shadcn registry catalog. The loader resolves root `registry.json`
// includes without requiring generated files under public/r.
export async function GET() {
  const registry = await loadEvexRegistry()

  return NextResponse.json(registry, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=60',
    },
  })
}
