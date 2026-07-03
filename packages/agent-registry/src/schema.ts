import { z } from 'zod'

export const REGISTRY_SCHEMA_URL = 'https://ui.shadcn.com/schema/registry.json'
export const REGISTRY_ITEM_TYPE = 'registry:item'
export const REGISTRY_FILE_TYPE = 'registry:file'
export const ENV_EXAMPLE_FILE = '.env.example'
export const README_FILE = 'README.md'

export const ALLOWED_ROOT_FILES: readonly string[] = [
  README_FILE,
  ENV_EXAMPLE_FILE,
]
export const ALLOWED_SOURCE_DIRECTORIES: readonly string[] = [
  'agent',
  'evals',
]

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const TARGET_PATH_PATTERN = /^~\/.+/

function isAllowedSourcePath(filePath: string): boolean {
  if (ALLOWED_ROOT_FILES.includes(filePath)) {
    return true
  }

  return ALLOWED_SOURCE_DIRECTORIES.some((directory) =>
    filePath.startsWith(`${directory}/`),
  )
}

function hasSafeSegments(filePath: string): boolean {
  const segments = filePath.split('/')
  return segments.every(
    (segment) => segment.length > 0 && segment !== '.' && segment !== '..',
  )
}

export const sourceFilePathSchema = z
  .string()
  .min(1)
  .superRefine((filePath, context) => {
    if (filePath.includes('\\') || filePath.startsWith('/')) {
      context.addIssue({
        code: 'custom',
        message: 'file path must be a relative POSIX path',
      })
      return
    }

    if (!hasSafeSegments(filePath)) {
      context.addIssue({
        code: 'custom',
        message: 'file path must not contain empty, "." or ".." segments',
      })
      return
    }

    if (!isAllowedSourcePath(filePath)) {
      context.addIssue({
        code: 'custom',
        message: `file path must be ${ALLOWED_ROOT_FILES.join(', ')}, or live under ${ALLOWED_SOURCE_DIRECTORIES.map((directory) => `${directory}/`).join(' or ')}`,
      })
    }
  })

export const dependencySchema = z
  .string()
  .min(1)
  .refine(
    (dependency) => {
      const separatorIndex = dependency.lastIndexOf('@')
      return separatorIndex > 0 && separatorIndex < dependency.length - 1
    },
    { message: 'dependency must use the "name@range" format' },
  )

export const registryFileSchema = z
  .strictObject({
    path: sourceFilePathSchema,
    type: z.literal(REGISTRY_FILE_TYPE),
    target: z.string().regex(TARGET_PATH_PATTERN, {
      message: 'target must start with "~/"',
    }),
  })
  .readonly()

export const registryItemMetaSchema = z
  .strictObject({
    slug: z.string().regex(SLUG_PATTERN, {
      message: 'slug must be lowercase kebab-case',
    }),
    category: z.string().min(1),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .readonly()

export const registryItemSchema = z
  .strictObject({
    name: z.string().regex(SLUG_PATTERN, {
      message: 'name must be lowercase kebab-case',
    }),
    type: z.literal(REGISTRY_ITEM_TYPE),
    title: z.string().min(1),
    description: z.string().min(1),
    author: z.string().min(1),
    categories: z.array(z.string().min(1)).readonly().optional(),
    dependencies: z.array(dependencySchema).readonly().optional(),
    files: z.array(registryFileSchema).min(1).readonly(),
    meta: registryItemMetaSchema,
  })
  .readonly()

export const agentRegistryJsonSchema = z
  .strictObject({
    $schema: z.literal(REGISTRY_SCHEMA_URL),
    items: z.tuple([registryItemSchema]),
  })
  .readonly()

export type AgentRegistryJson = z.infer<typeof agentRegistryJsonSchema>
export type RegistryItemMeta = z.infer<typeof registryItemMetaSchema>
export type RegistrySourceFile = z.infer<typeof registryFileSchema>
export type RegistrySourceItem = z.infer<typeof registryItemSchema>
