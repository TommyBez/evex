import fs from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import {
  agentRegistryJsonSchema,
  ALLOWED_ROOT_FILES,
  ALLOWED_SOURCE_DIRECTORIES,
  ENV_EXAMPLE_FILE,
  REGISTRY_SCHEMA_URL,
  type RegistrySourceFile,
  type RegistrySourceItem,
} from '../../src/schema.ts'
import type { RegistryCatalog, RegistryItem } from '../../src/types.ts'

const BUILT_IN_ENV_VARS = new Set(['CI', 'NODE_ENV'])
const ENV_ASSIGNMENT_PATTERN = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/gm
const PROCESS_ENV_BRACKET_PATTERN =
  /\bprocess\.env\[['"`]([A-Za-z_][A-Za-z0-9_]*)['"`]\]/g
const PROCESS_ENV_DOT_PATTERN = /\bprocess\.env\.([A-Za-z_][A-Za-z0-9_]*)/g
const EVE_DEPENDENCY = 'eve'

// Root manifest metadata. shadcn only requires name and homepage, but external
// registry indexers read a top-level description to present the registry
// itself, so evex publishes one. The homepage is the www host because the
// apex 308-redirects to it.
const REGISTRY_NAME = 'evex'
const REGISTRY_HOMEPAGE = 'https://www.evex.sh'
const REGISTRY_DESCRIPTION =
  'evex is the open source community registry for Eve agents. Browse agents built by the community and install them into your Eve app with one command.'

export interface RegistryBuildResult {
  readonly agentSlugs: readonly string[]
  readonly catalog: RegistryCatalog
  readonly errors: readonly string[]
  readonly itemsByName: Record<string, RegistryItem>
}

interface AgentEntry {
  readonly catalogItem: RegistryItem
  readonly registryItem: RegistryItem
}

type DeclaredFile = RegistrySourceFile & {
  readonly sourcePath: string
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join(path.posix.sep)
}

async function readJson(filePath: string): Promise<unknown> {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function listAgentSlugs(agentsDir: string): Promise<string[]> {
  const entries = await fs.readdir(agentsDir, { withFileTypes: true })
  return entries
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        entry.name !== 'node_modules',
    )
    .map((entry) => entry.name)
    .toSorted((left, right) => left.localeCompare(right))
}

async function collectDirectoryFiles(
  directory: string,
  root: string,
): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue
    }

    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') {
        continue
      }
      files.push(...(await collectDirectoryFiles(entryPath, root)))
      continue
    }

    if (entry.isFile()) {
      files.push(toPosixPath(path.relative(root, entryPath)))
    }
  }

  return files
}

export async function collectPublishableFiles(
  agentRoot: string,
): Promise<string[]> {
  const files: string[] = []

  for (const directory of ALLOWED_SOURCE_DIRECTORIES) {
    const directoryPath = path.join(agentRoot, directory)
    if (await fileExists(directoryPath)) {
      files.push(...(await collectDirectoryFiles(directoryPath, agentRoot)))
    }
  }

  for (const rootFile of ALLOWED_ROOT_FILES) {
    if (await fileExists(path.join(agentRoot, rootFile))) {
      files.push(rootFile)
    }
  }

  return files.toSorted((left, right) => left.localeCompare(right))
}

function addEnvMatches(
  content: string,
  pattern: RegExp,
  envVars: Set<string>,
): void {
  pattern.lastIndex = 0

  for (const match of content.matchAll(pattern)) {
    const envVar = match[1]
    if (envVar && !BUILT_IN_ENV_VARS.has(envVar)) {
      envVars.add(envVar)
    }
  }
}

async function collectUsedEnvVars(files: DeclaredFile[]): Promise<Set<string>> {
  const envVars = new Set<string>()

  for (const file of files) {
    if (!file.path.startsWith('agent/')) {
      continue
    }

    const content = await fs.readFile(file.sourcePath, 'utf8')
    addEnvMatches(content, PROCESS_ENV_DOT_PATTERN, envVars)
    addEnvMatches(content, PROCESS_ENV_BRACKET_PATTERN, envVars)
  }

  return envVars
}

async function readEnvExampleVars(filePath: string): Promise<Set<string>> {
  const content = await fs.readFile(filePath, 'utf8')
  const envVars = new Set<string>()

  ENV_ASSIGNMENT_PATTERN.lastIndex = 0
  for (const match of content.matchAll(ENV_ASSIGNMENT_PATTERN)) {
    const envVar = match[1]
    if (envVar) {
      envVars.add(envVar)
    }
  }

  return envVars
}

async function validateEnvironmentExample(
  files: DeclaredFile[],
  errors: string[],
  agentSlug: string,
): Promise<void> {
  const usedEnvVars = await collectUsedEnvVars(files)
  if (usedEnvVars.size === 0) {
    return
  }

  const envExampleFile = files.find((file) => file.path === ENV_EXAMPLE_FILE)
  const sortedUsedEnvVars = [...usedEnvVars].toSorted((left, right) =>
    left.localeCompare(right),
  )

  if (!envExampleFile) {
    errors.push(
      `${agentSlug}: uses environment variables (${sortedUsedEnvVars.join(', ')}) and must include ${ENV_EXAMPLE_FILE} in files.`,
    )
    return
  }

  const declaredEnvVars = await readEnvExampleVars(envExampleFile.sourcePath)
  const missingEnvVars = sortedUsedEnvVars.filter(
    (envVar) => !declaredEnvVars.has(envVar),
  )

  if (missingEnvVars.length > 0) {
    errors.push(
      `${agentSlug}: ${ENV_EXAMPLE_FILE} must define ${missingEnvVars.join(', ')}.`,
    )
  }
}

function parseDependency(dependency: string): {
  name: string
  range: string
} {
  const separatorIndex = dependency.lastIndexOf('@')
  return {
    name: dependency.slice(0, separatorIndex),
    range: dependency.slice(separatorIndex + 1),
  }
}

async function validateDependencyCoherence(
  item: RegistrySourceItem,
  agentRoot: string,
  errors: string[],
  agentSlug: string,
): Promise<string | null> {
  const packageJsonPath = path.join(agentRoot, 'package.json')
  let packageJson: { author?: unknown; dependencies?: unknown }

  try {
    packageJson = (await readJson(packageJsonPath)) as {
      author?: unknown
      dependencies?: unknown
    }
  } catch {
    errors.push(`${agentSlug}: package.json is missing or invalid.`)
    return null
  }

  const packageDependencies =
    packageJson.dependencies &&
    typeof packageJson.dependencies === 'object' &&
    !Array.isArray(packageJson.dependencies)
      ? (packageJson.dependencies as Record<string, string>)
      : {}

  const registryDependencies = new Map(
    (item.dependencies ?? []).map((dependency) => {
      const { name, range } = parseDependency(dependency)
      return [name, range]
    }),
  )

  for (const [name, range] of registryDependencies) {
    const packageRange = packageDependencies[name]
    if (packageRange === undefined) {
      errors.push(
        `${agentSlug}: registry.json dependency "${name}@${range}" is missing from package.json dependencies.`,
      )
      continue
    }

    if (packageRange !== range) {
      errors.push(
        `${agentSlug}: dependency "${name}" version mismatch — registry.json has "${range}", package.json has "${packageRange}".`,
      )
    }
  }

  for (const name of Object.keys(packageDependencies)) {
    if (!registryDependencies.has(name)) {
      errors.push(
        `${agentSlug}: package.json dependency "${name}" is not declared in registry.json dependencies.`,
      )
    }
  }

  if (
    typeof packageJson.author === 'string' &&
    packageJson.author.trim() &&
    packageJson.author.trim() !== item.author
  ) {
    errors.push(
      `${agentSlug}: registry.json author "${item.author}" does not match package.json author "${packageJson.author.trim()}".`,
    )
  }

  return registryDependencies.get(EVE_DEPENDENCY) ?? null
}

async function resolveDeclaredFiles(
  item: RegistrySourceItem,
  agentRoot: string,
  errors: string[],
  agentSlug: string,
): Promise<DeclaredFile[]> {
  const files: DeclaredFile[] = []
  const seenPaths = new Set<string>()

  for (const file of item.files) {
    if (seenPaths.has(file.path)) {
      errors.push(`${agentSlug}: file "${file.path}" is declared twice.`)
      continue
    }
    seenPaths.add(file.path)

    const sourcePath = path.join(agentRoot, file.path)
    if (!(await fileExists(sourcePath))) {
      errors.push(
        `${agentSlug}: declared file "${file.path}" does not exist on disk.`,
      )
      continue
    }

    files.push({ ...file, sourcePath })
  }

  const publishableFiles = await collectPublishableFiles(agentRoot)
  for (const publishableFile of publishableFiles) {
    if (!seenPaths.has(publishableFile)) {
      errors.push(
        `${agentSlug}: file "${publishableFile}" exists on disk but is not declared in registry.json files.`,
      )
    }
  }

  return files
}

function validateItemIdentity(
  item: RegistrySourceItem,
  errors: string[],
  agentSlug: string,
): void {
  if (item.name !== agentSlug) {
    errors.push(
      `${agentSlug}: item name "${item.name}" must match the agent folder slug.`,
    )
  }

  if (item.meta.slug !== agentSlug) {
    errors.push(
      `${agentSlug}: meta.slug "${item.meta.slug}" must match the agent folder slug.`,
    )
  }

  if (!(item.categories ?? []).includes(item.meta.category)) {
    errors.push(
      `${agentSlug}: categories must include meta.category "${item.meta.category}".`,
    )
  }
}

async function buildAgentEntry(
  agentsDir: string,
  agentSlug: string,
  errors: string[],
  eveRanges: Map<string, string>,
): Promise<AgentEntry | null> {
  const agentRoot = path.join(agentsDir, agentSlug)
  const registryPath = path.join(agentRoot, 'registry.json')

  let registryJson: unknown
  try {
    registryJson = await readJson(registryPath)
  } catch (error) {
    errors.push(
      `${agentSlug}: registry.json is missing or invalid JSON (${error instanceof Error ? error.message : String(error)}).`,
    )
    return null
  }

  const parsed = agentRegistryJsonSchema.safeParse(registryJson)
  if (!parsed.success) {
    errors.push(`${agentSlug}: ${z.prettifyError(parsed.error)}`)
    return null
  }

  const [item] = parsed.data.items
  validateItemIdentity(item, errors, agentSlug)

  const files = await resolveDeclaredFiles(item, agentRoot, errors, agentSlug)
  await validateEnvironmentExample(files, errors, agentSlug)
  const eveRange = await validateDependencyCoherence(
    item,
    agentRoot,
    errors,
    agentSlug,
  )
  if (eveRange) {
    eveRanges.set(agentSlug, eveRange)
  }

  const { files: _declaredFiles, ...metadata } = item
  const catalogFiles = files.map(({ sourcePath: _sourcePath, ...file }) => file)
  const itemFiles = await Promise.all(
    files.map(async ({ sourcePath, ...file }) => ({
      ...file,
      content: await fs.readFile(sourcePath, 'utf8'),
    })),
  )

  return {
    catalogItem: { ...metadata, files: catalogFiles },
    registryItem: {
      $schema: REGISTRY_SCHEMA_URL,
      ...metadata,
      files: itemFiles,
    },
  }
}

function validateEveCoherence(
  eveRanges: Map<string, string>,
  errors: string[],
): void {
  const uniqueRanges = new Set(eveRanges.values())
  if (uniqueRanges.size <= 1) {
    return
  }

  const details = [...eveRanges.entries()]
    .map(([slug, range]) => `${slug}=${range}`)
    .join(', ')
  errors.push(
    `all agents must pin the same "${EVE_DEPENDENCY}" version — found ${details}.`,
  )
}

// Ownership map for GitHub review routing: every agent directory is owned by
// its registry.json author. Committed as .github/CODEOWNERS; the generator's
// --check mode fails when it goes stale.
export function buildCodeowners(
  itemsByName: Record<string, RegistryItem>,
  fallbackOwner: string,
): string {
  const lines = [
    '# Generated by packages/agent-registry/scripts/generate-registry.mts — do not edit.',
    '# Regenerate with: pnpm --filter @evex/agent-registry generate',
    '',
    `* @${fallbackOwner}`,
    '',
  ]

  for (const [slug, item] of Object.entries(itemsByName).toSorted(
    ([left], [right]) => left.localeCompare(right),
  )) {
    lines.push(`/registry/${slug}/ @${item.author}`)
  }

  return `${lines.join('\n')}\n`
}

export async function buildRegistry(
  agentsDir: string,
): Promise<RegistryBuildResult> {
  const agentSlugs = await listAgentSlugs(agentsDir)
  const errors: string[] = []
  const eveRanges = new Map<string, string>()
  const catalogItems: RegistryItem[] = []
  const itemsByName: Record<string, RegistryItem> = {}

  for (const agentSlug of agentSlugs) {
    const entry = await buildAgentEntry(agentsDir, agentSlug, errors, eveRanges)
    if (entry) {
      catalogItems.push(entry.catalogItem)
      itemsByName[agentSlug] = entry.registryItem
    }
  }

  validateEveCoherence(eveRanges, errors)

  const catalog: RegistryCatalog = {
    $schema: REGISTRY_SCHEMA_URL,
    name: REGISTRY_NAME,
    homepage: REGISTRY_HOMEPAGE,
    description: REGISTRY_DESCRIPTION,
    items: catalogItems,
  }

  return { agentSlugs, catalog, errors, itemsByName }
}
