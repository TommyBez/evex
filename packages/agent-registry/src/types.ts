import type {
  RegistryItemMeta,
  RegistrySourceFile,
  RegistrySourceItem,
} from './schema'

export type RegistryFile = RegistrySourceFile & {
  readonly content?: string
}

export type RegistryItem = Omit<RegistrySourceItem, 'files'> & {
  readonly $schema?: string
  readonly files: readonly RegistryFile[]
}

export interface RegistryCatalog {
  readonly $schema?: string
  readonly homepage?: string
  readonly items: readonly RegistryItem[]
  readonly name: string
}

export type { RegistryItemMeta }
