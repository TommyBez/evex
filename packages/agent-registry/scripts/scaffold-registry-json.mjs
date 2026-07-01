import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REGISTRY_SCHEMA_URL = 'https://ui.shadcn.com/schema/registry.json'
const ENV_EXAMPLE_FILE = '.env.example'
const README_TITLE_PATTERN = /^#\s+(.+)$/m
const LINE_SPLIT_PATTERN = /\r?\n/

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(scriptDir, '..')
const agentsDir = path.join(packageRoot, 'agents')

function toPosixPath(filePath) {
  return filePath.split(path.sep).join(path.posix.sep)
}

function titleizeSlug(slug) {
  return slug
    .split('-')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

async function collectFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries.toSorted((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    if (entry.name.startsWith('.')) {
      continue
    }

    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)))
      continue
    }

    if (entry.isFile()) {
      files.push(entryPath)
    }
  }

  return files
}

function readReadmeTitle(readme, slug) {
  return readme.match(README_TITLE_PATTERN)?.[1]?.trim() ?? titleizeSlug(slug)
}

function readReadmeDescription(readme) {
  const paragraphLines = []
  let started = false

  for (const line of readme.split(LINE_SPLIT_PATTERN)) {
    const trimmed = line.trim()

    if (trimmed.startsWith('#')) {
      if (started) {
        break
      }
      continue
    }

    if (!trimmed) {
      if (started) {
        break
      }
      continue
    }

    started = true
    paragraphLines.push(trimmed)
  }

  const description = paragraphLines.join(' ')
  return description || 'Describe what this agent does.'
}

function readDependencies(packageJson) {
  return Object.entries(packageJson.dependencies ?? {}).map(
    ([name, range]) => `${name}@${range}`,
  )
}

function readPackageAuthor(packageJson) {
  const { author } = packageJson
  if (typeof author === 'string' && author.trim()) {
    return author.trim()
  }

  if (isRecord(author) && typeof author.name === 'string') {
    const name = author.name.trim()
    return name || null
  }

  return null
}

function toTargetPath(relativePath) {
  if (relativePath === 'README.md') {
    return '~/agent/README.md'
  }

  if (relativePath === ENV_EXAMPLE_FILE) {
    return '~/.env.example'
  }

  return `~/${relativePath}`
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function buildFiles(agentRoot) {
  const sourceFiles = await collectFiles(path.join(agentRoot, 'agent'))
  const evalsPath = path.join(agentRoot, 'evals')
  if (await fileExists(evalsPath)) {
    sourceFiles.push(...(await collectFiles(evalsPath)))
  }
  sourceFiles.push(path.join(agentRoot, 'README.md'))
  const envExamplePath = path.join(agentRoot, ENV_EXAMPLE_FILE)
  if (await fileExists(envExamplePath)) {
    sourceFiles.push(envExamplePath)
  }

  return sourceFiles.map((sourcePath) => {
    const relativePath = toPosixPath(path.relative(agentRoot, sourcePath))
    return {
      path: relativePath,
      type: 'registry:file',
      target: toTargetPath(relativePath),
    }
  })
}

async function main() {
  const slug = process.argv.at(2)
  if (!slug) {
    throw new Error(
      'Usage: pnpm --filter @evex/agent-registry registry:scaffold <agent-slug>',
    )
  }

  const agentRoot = path.join(agentsDir, slug)
  const packageJson = await readJson(path.join(agentRoot, 'package.json'))
  const readme = await fs.readFile(path.join(agentRoot, 'README.md'), 'utf8')
  const author = readPackageAuthor(packageJson)
  const now = new Date().toISOString()
  const category = 'general'
  const item = {
    name: slug,
    type: 'registry:item',
    title: readReadmeTitle(readme, slug),
    description: packageJson.description ?? readReadmeDescription(readme),
    categories: [category],
    dependencies: readDependencies(packageJson),
    files: await buildFiles(agentRoot),
    meta: {
      slug,
      category,
      createdAt: now,
      updatedAt: now,
    },
  }

  if (author) {
    item.author = author
  }

  const registry = {
    $schema: REGISTRY_SCHEMA_URL,
    items: [item],
  }

  await fs.writeFile(
    path.join(agentRoot, 'registry.json'),
    `${JSON.stringify(registry, null, 2)}\n`,
  )
}

await main()
