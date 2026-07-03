import path from 'node:path'
import { withBotId } from 'botid/next/config'
import type { NextConfig } from 'next/types'

const nextConfig: NextConfig = {
  cacheComponents: true,
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
  // `/agents` and `/authors` have no index pages, but crawlers probe them as
  // parent paths of detail pages; redirect instead of returning 404.
  redirects: () =>
    Promise.resolve([
      {
        source: '/agents',
        destination: '/',
        permanent: true,
      },
      {
        source: '/authors',
        destination: '/leaderboard',
        permanent: true,
      },
    ]),
  transpilePackages: ['@evex/agent-registry', '@evex/ui'],
}

export default withBotId(nextConfig)
