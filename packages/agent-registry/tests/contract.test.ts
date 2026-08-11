// Contract tests over the real generated registry: these guarantees are what
// `npx shadcn add @evex/<slug>` and the evex.sh catalog pages rely on.
import { describe, expect, it } from 'vitest'
import {
  EVEX_REGISTRY_NAME,
  getRegistry,
  getRegistryItem,
  RegistryItemNotFoundError,
} from '../src/index'

describe('registry catalog contract', () => {
  const catalog = getRegistry()

  it('exposes the evex registry with at least one agent', () => {
    expect(EVEX_REGISTRY_NAME).toBe('evex')
    expect(catalog.items.length).toBeGreaterThan(0)
  })

  it('publishes root manifest metadata for registry indexers', () => {
    expect(catalog.name).toBe('evex')
    expect(catalog.homepage).toBe('https://www.evex.sh')
    expect(catalog.description).toBe(
      'evex is the open source community registry for Eve agents. Browse agents built by the community and install them into your Eve app with one command.'
    )
  })

  it('keeps catalog entries content-free', () => {
    for (const item of catalog.items) {
      for (const file of item.files) {
        expect(file.content).toBeUndefined()
      }
    }
  })

  it('resolves every catalog entry to a full item with file content', async () => {
    for (const catalogItem of catalog.items) {
      const item = await getRegistryItem(catalogItem.name)
      expect(item.name).toBe(catalogItem.name)
      expect(item.files.length).toBeGreaterThan(0)
      for (const file of item.files) {
        expect(typeof file.content).toBe('string')
        expect(file.target.startsWith('~/')).toBe(true)
      }
    }
  })

  it('keeps item identity coherent (name === meta.slug, category listed)', () => {
    for (const item of catalog.items) {
      expect(item.meta.slug).toBe(item.name)
      expect(item.categories).toContain(item.meta.category)
      expect(Number.isNaN(new Date(item.meta.createdAt).getTime())).toBe(false)
      expect(Number.isNaN(new Date(item.meta.updatedAt).getTime())).toBe(false)
    }
  })

  it('throws a typed error for unknown items', async () => {
    await expect(getRegistryItem('definitely-not-an-agent')).rejects.toThrow(
      RegistryItemNotFoundError,
    )
  })
})
