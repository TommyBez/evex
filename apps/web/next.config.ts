import path from 'node:path'
import { withBotId } from 'botid/next/config'
import type { NextConfig } from 'next/types'

const nextConfig: NextConfig = {
  cacheComponents: true,
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
  transpilePackages: ['@evex/agent-registry', '@evex/ui'],
}

export default withBotId(nextConfig)
