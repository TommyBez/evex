import { itemLoaders } from '../generated/items'
import { getRegistryCatalog } from './catalog'
import type { RegistryCatalog, RegistryItem } from './types'

const catalog = getRegistryCatalog()

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
  registryFileSchema,
  registryItemMetaSchema,
  registryItemSchema,
} from './schema'
export type {
  RegistryCatalog,
  RegistryFile,
  RegistryItem,
  RegistryItemMeta,
} from './types'
