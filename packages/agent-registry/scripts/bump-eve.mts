// Bumps the eve dependency in lockstep across every agent in the catalog:
// registry/<slug>/package.json dependencies.eve and the matching
// "eve@<range>" entry in registry/<slug>/registry.json.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { listAgentSlugs } from './lib/registry-builder.mts'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const agentsDir = path.resolve(scriptDir, '..', '..', '..', 'registry')

const EVE_DEPENDENCY_PATTERN = /^eve@/

async function bumpAgent(slug: string, range: string): Promise<boolean> {
  const agentRoot = path.join(agentsDir, slug)

  const packageJsonPath = path.join(agentRoot, 'package.json')
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  if (typeof packageJson.dependencies?.eve !== 'string') {
    return false
  }
  packageJson.dependencies.eve = range
  await fs.writeFile(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
  )

  const registryJsonPath = path.join(agentRoot, 'registry.json')
  const registryJson = JSON.parse(await fs.readFile(registryJsonPath, 'utf8'))
  const item = registryJson.items?.[0]
  if (Array.isArray(item?.dependencies)) {
    item.dependencies = item.dependencies.map((dependency: string) =>
      EVE_DEPENDENCY_PATTERN.test(dependency) ? `eve@${range}` : dependency,
    )
    await fs.writeFile(
      registryJsonPath,
      `${JSON.stringify(registryJson, null, 2)}\n`,
    )
  }

  return true
}

async function main(): Promise<void> {
  const range = process.argv.at(2)
  if (!range) {
    throw new Error(
      'Usage: pnpm --filter @evex/agent-registry bump-eve <range>   (e.g. bump-eve ^0.31.3)',
    )
  }

  const slugs = await listAgentSlugs(agentsDir)
  const bumped: string[] = []
  for (const slug of slugs) {
    if (await bumpAgent(slug, range)) {
      bumped.push(slug)
    }
  }

  process.stdout.write(
    `Bumped eve to ${range} in ${bumped.length}/${slugs.length} agents.\n`,
  )
  process.stdout.write(
    'Now run: pnpm --dir registry install && pnpm --filter @evex/agent-registry generate\n',
  )
}

await main()
