import { getRegistry } from '@evex-new/agent-registry'
import { NextResponse } from 'next/server'

// Public shadcn registry catalog generated from the agent registry package.
export function GET() {
  const registry = getRegistry()

  return NextResponse.json(registry, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=60',
    },
  })
}
