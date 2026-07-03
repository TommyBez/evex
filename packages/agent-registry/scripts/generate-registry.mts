import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildRegistry } from './lib/registry-builder.mts'

const CHECK_FLAG = '--check'
const GENERATED_FILE = 'src/generated/registry.ts'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(scriptDir, '..')
const agentsDir = path.join(packageRoot, 'agents')
const generatedPath = path.join(packageRoot, GENERATED_FILE)

async function main(): Promise<void> {
  const isCheckOnly = process.argv.includes(CHECK_FLAG)
  const { agentSlugs, errors, source } = await buildRegistry(agentsDir)

  if (errors.length > 0) {
    process.stderr.write('Registry validation failed:\n')
    for (const error of errors) {
      process.stderr.write(`  - ${error}\n`)
    }
    process.exitCode = 1
    return
  }

  if (isCheckOnly) {
    process.stdout.write(
      `Registry OK: ${agentSlugs.length} agents validated.\n`,
    )
    return
  }

  await fs.mkdir(path.dirname(generatedPath), { recursive: true })
  await fs.writeFile(generatedPath, source)
  process.stdout.write(
    `Generated ${GENERATED_FILE} from ${agentSlugs.length} agents.\n`,
  )
}

await main()
