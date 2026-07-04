import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  agentRegistryJsonSchema,
  ENV_EXAMPLE_FILE,
  README_FILE,
  REGISTRY_SCHEMA_URL,
} from '../src/schema.ts'
import { collectPublishableFiles } from './lib/registry-builder.mts'

const FORCE_FLAG = '--force'
const README_TITLE_PATTERN = /^#\s+(.+)$/m
const LINE_SPLIT_PATTERN = /\r?\n/

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(scriptDir, '..')
const agentsDir = path.join(packageRoot, '..', '..', 'registry')

function titleizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

async function readJson(filePath: string): Promise<Record<string, unknown>> {
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function readReadmeTitle(readme: string, slug: string): string {
  return readme.match(README_TITLE_PATTERN)?.[1]?.trim() ?? titleizeSlug(slug)
}

function readReadmeDescription(readme: string): string {
  const paragraphLines: string[] = []
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

function readDependencies(packageJson: Record<string, unknown>): string[] {
  const dependencies =
    packageJson.dependencies &&
    typeof packageJson.dependencies === 'object' &&
    !Array.isArray(packageJson.dependencies)
      ? (packageJson.dependencies as Record<string, string>)
      : {}

  return Object.entries(dependencies).map(
    ([name, range]) => `${name}@${range}`,
  )
}

function readPackageAuthor(
  packageJson: Record<string, unknown>,
): string | null {
  const { author } = packageJson
  if (typeof author === 'string' && author.trim()) {
    return author.trim()
  }

  if (
    author &&
    typeof author === 'object' &&
    !Array.isArray(author) &&
    typeof (author as Record<string, unknown>).name === 'string'
  ) {
    const name = ((author as Record<string, unknown>).name as string).trim()
    return name || null
  }

  return null
}

function toTargetPath(relativePath: string): string {
  if (relativePath === README_FILE) {
    return '~/agent/README.md'
  }

  if (relativePath === ENV_EXAMPLE_FILE) {
    return `~/${ENV_EXAMPLE_FILE}`
  }

  return `~/${relativePath}`
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((arg) => arg !== FORCE_FLAG)
  const force = process.argv.includes(FORCE_FLAG)
  const slug = args.at(0)
  if (!slug) {
    throw new Error(
      'Usage: pnpm --filter @evex/agent-registry registry:scaffold <agent-slug> [--force]',
    )
  }

  const agentRoot = path.join(agentsDir, slug)
  const registryPath = path.join(agentRoot, 'registry.json')

  if (!force && (await fileExists(registryPath))) {
    throw new Error(
      `${registryPath} already exists. Re-running the scaffold would discard manual edits; pass ${FORCE_FLAG} to overwrite.`,
    )
  }

  const packageJson = await readJson(path.join(agentRoot, 'package.json'))
  const readme = await fs.readFile(path.join(agentRoot, README_FILE), 'utf8')
  const author = readPackageAuthor(packageJson)
  const now = new Date().toISOString()
  const category = 'general'
  const files = (await collectPublishableFiles(agentRoot)).map(
    (relativePath) => ({
      path: relativePath,
      type: 'registry:file' as const,
      target: toTargetPath(relativePath),
    }),
  )

  const registry = {
    $schema: REGISTRY_SCHEMA_URL,
    items: [
      {
        name: slug,
        type: 'registry:item' as const,
        title: readReadmeTitle(readme, slug),
        description:
          typeof packageJson.description === 'string'
            ? packageJson.description
            : readReadmeDescription(readme),
        ...(author ? { author } : {}),
        categories: [category],
        dependencies: readDependencies(packageJson),
        files,
        meta: {
          slug,
          category,
          createdAt: now,
          updatedAt: now,
          docs: {
            overview: [
              `Replace with 2-3 paragraphs describing what ${slug} does, how you interact with it, and why it is useful.`,
            ],
            howItWorks: [
              'Replace with 4-6 steps describing the actual flow (channel, tools, skills, evals).',
            ],
            useCases: [
              {
                title: 'Replace with a concrete scenario',
                body: 'Replace with 25-50 words describing the scenario.',
              },
            ],
            requirements: [],
            faqs: [
              {
                question: 'Replace with a real question a developer would ask',
                answer: 'Replace with a 20-60 word answer.',
              },
            ],
          },
        },
      },
    ],
  }

  const parsed = agentRegistryJsonSchema.safeParse(registry)
  if (!parsed.success) {
    process.stderr.write(
      'Scaffolded registry.json is invalid — fix the package sources first:\n',
    )
    process.stderr.write(`${JSON.stringify(parsed.error.issues, null, 2)}\n`)
    process.exitCode = 1
    return
  }

  await fs.writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`)
  process.stdout.write(`Wrote ${registryPath}.\n`)
  process.stdout.write(
    'Review categories, meta.category, dates, and replace every meta.docs placeholder with real editorial content, then run "pnpm --filter @evex/agent-registry generate".\n',
  )
}

await main()
