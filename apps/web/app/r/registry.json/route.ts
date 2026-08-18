import { getRegistry } from '@evex/agent-registry'
import { NextResponse } from 'next/server'

// Public shadcn registry catalog generated from the agent registry package.
export function GET() {
  const registry = getRegistry()

  return NextResponse.json(registry, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=60',
      // JSON install endpoints are not landing pages. noindex via header so
      // crawlers that still discover the URL do not index an empty SERP.
      'X-Robots-Tag': 'noindex',
    },
  })
}
