import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { AGENTS } from '../src/data/agents.ts'

for (const agent of AGENTS) {
  process.stdout.write(`\nRendering ${agent.slug}...\n`)
  const result = spawnSync(
    'npx',
    ['remotion', 'render', agent.slug, `out/${agent.slug}.mp4`],
    { stdio: 'inherit' },
  )
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
