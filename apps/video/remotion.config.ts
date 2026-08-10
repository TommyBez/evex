import path from 'node:path'
import { Config } from '@remotion/cli/config'

Config.setEntryPoint('src/index.ts')
Config.setVideoImageFormat('jpeg')
Config.setOverwriteOutput(true)

// remocn components import through the `@/` alias — mirror the tsconfig path
// mapping in Remotion's webpack bundle.
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...config.resolve?.alias,
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
}))
