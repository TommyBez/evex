import { spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const agentsDir = path.resolve(scriptDir, '..', 'agents')

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

async function listAgentSlugs() {
  const entries = await fs.readdir(agentsDir, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .toSorted((left, right) => left.localeCompare(right))
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: false,
  })
  return result.status ?? 1
}

async function removeInstallArtifacts(agentRoot) {
  await fs.rm(path.join(agentRoot, 'node_modules'), {
    recursive: true,
    force: true,
  })
  await fs.rm(path.join(agentRoot, 'pnpm-lock.yaml'), { force: true })
}

async function typecheckAgent(slug) {
  const agentRoot = path.join(agentsDir, slug)
  const packageJson = await readJson(path.join(agentRoot, 'package.json'))

  if (typeof packageJson.scripts?.typecheck !== 'string') {
    console.error(`${slug}: package.json has no "typecheck" script`)
    return false
  }

  try {
    const installStatus = run(
      'pnpm',
      ['install', '--ignore-workspace', '--prefer-offline', '--silent'],
      agentRoot,
    )
    if (installStatus !== 0) {
      console.error(`${slug}: dependency install failed`)
      return false
    }

    const typecheckStatus = run(
      'pnpm',
      ['run', '--silent', 'typecheck'],
      agentRoot,
    )
    if (typecheckStatus !== 0) {
      console.error(`${slug}: typecheck failed`)
      return false
    }

    return true
  } finally {
    await removeInstallArtifacts(agentRoot)
  }
}

async function main() {
  const availableSlugs = await listAgentSlugs()
  const requestedSlugs = process.argv.slice(2)

  for (const slug of requestedSlugs) {
    if (!availableSlugs.includes(slug)) {
      throw new Error(
        `Unknown agent "${slug}". Available agents: ${availableSlugs.join(', ')}`,
      )
    }
  }

  const slugs = requestedSlugs.length > 0 ? requestedSlugs : availableSlugs
  const failures = []

  for (const slug of slugs) {
    console.log(`\n=== ${slug} ===`)
    if (!(await typecheckAgent(slug))) {
      failures.push(slug)
    }
  }

  console.log(`\nTypechecked ${slugs.length} agent(s).`)
  if (failures.length > 0) {
    console.error(`Failed: ${failures.join(', ')}`)
    process.exitCode = 1
    return
  }
  console.log('All agents passed.')
}

await main()
