import { generatedRegistry, generatedRegistryItems } from './generated/registry'
import type { RegistryCatalog, RegistryItem } from './types'

export const EVEX_REGISTRY_NAME = generatedRegistry.name
export const EVEX_REGISTRY_NAMESPACE = '@evex-new'

const registryItemsByName: Readonly<Record<string, RegistryItem>> =
  generatedRegistryItems

export class RegistryItemNotFoundError extends Error {
  readonly itemName: string

  constructor(itemName: string) {
    super(`Registry item not found: ${itemName}`)
    this.name = 'RegistryItemNotFoundError'
    this.itemName = itemName
  }
}

export function getRegistry(): RegistryCatalog {
  return generatedRegistry
}

export function getRegistryItem(name: string): RegistryItem {
  const item = registryItemsByName[name]
  if (!item) {
    throw new RegistryItemNotFoundError(name)
  }

  return item
}

export type { RegistryCatalog, RegistryFile, RegistryItem } from './types'
