import path from 'node:path'
import { withBotId } from 'botid/next/config'
import type { NextConfig } from 'next/types'

const nextConfig: NextConfig = {
  cacheComponents: true,
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
  transpilePackages: ['@evex/agent-registry', '@evex/ui'],
  // Markdown mirrors for LLM/agent crawlers: appending .md to an agent or
  // learn URL serves the page as text/markdown.
  rewrites() {
    return Promise.resolve([
      { source: '/agents/:slug.md', destination: '/agents/:slug/md' },
      { source: '/learn/:slug.md', destination: '/learn/:slug/md' },
      { source: '/docs.md', destination: '/docs/md' },
      { source: '/docs/:slug.md', destination: '/docs/:slug/md' },
    ])
  },
  redirects() {
    return Promise.resolve([
      {
        source: '/learn/eve-agent-registry',
        destination: '/docs',
        permanent: true,
      },
    ])
  },
}

export default withBotId(nextConfig)
