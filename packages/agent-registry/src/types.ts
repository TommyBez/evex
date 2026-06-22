export interface RegistryFile {
  readonly content?: string
  readonly path: string
  readonly target?: string
  readonly type: string
}

export interface RegistryItem {
  readonly $schema?: string
  readonly author?: string
  readonly categories?: readonly string[]
  readonly dependencies?: readonly string[]
  readonly description?: string
  readonly files?: readonly RegistryFile[]
  readonly meta?: Record<string, unknown>
  readonly name: string
  readonly title?: string
  readonly type: string
}

export interface RegistryCatalog {
  readonly $schema?: string
  readonly homepage?: string
  readonly items: readonly RegistryItem[]
  readonly name: string
}
