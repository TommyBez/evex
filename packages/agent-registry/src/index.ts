import generatedCatalog from '../generated/catalog.json'
import { itemLoaders } from '../generated/items'
import type { RegistryCatalog, RegistryItem } from './types'

// The generator validates every item against the Zod schema before emitting
// the artifacts, so the JSON can be trusted to match the public types (the
// contract tests in tests/contract.test.ts re-verify this on every run).
const catalog = generatedCatalog as unknown as RegistryCatalog

export const EVEX_REGISTRY_NAME = catalog.name
export const EVEX_REGISTRY_NAMESPACE = '@evex'

export class RegistryItemNotFoundError extends Error {
  readonly itemName: string

  constructor(itemName: string) {
    super(`Registry item not found: ${itemName}`)
    this.name = 'RegistryItemNotFoundError'
    this.itemName = itemName
  }
}

export function getRegistry(): RegistryCatalog {
  return catalog
}

export async function getRegistryItem(name: string): Promise<RegistryItem> {
  const loader = itemLoaders[name]
  if (!loader) {
    throw new RegistryItemNotFoundError(name)
  }

  const module = await loader()
  return module.default as unknown as RegistryItem
}

export {
  agentRegistryJsonSchema,
  registryItemDocsSchema,
  registryFileSchema,
  registryItemMetaSchema,
  registryItemSchema,
} from './schema'
export type {
  RegistryCatalog,
  RegistryItemDocs,
  RegistryFile,
  RegistryItem,
  RegistryItemMeta,
} from './types'
