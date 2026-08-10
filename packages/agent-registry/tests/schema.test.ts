import { describe, expect, it } from 'vitest'
import {
  agentRegistryJsonSchema,
  registryItemSchema,
  REGISTRY_SCHEMA_URL,
} from '../src/schema.ts'

const validItem = {
  name: 'my-agent',
  type: 'registry:item',
  title: 'My Agent',
  description: 'Does something useful.',
  author: 'octocat',
  categories: ['general'],
  dependencies: ['eve@^0.31.3', 'zod@4.3.6'],
  files: [
    {
      path: 'agent/agent.ts',
      type: 'registry:file',
      target: '~/agent/agent.ts',
    },
    {
      path: 'README.md',
      type: 'registry:file',
      target: '~/agent/README.md',
    },
  ],
  meta: {
    slug: 'my-agent',
    category: 'general',
    createdAt: '2026-06-22T00:00:00.000Z',
    updatedAt: '2026-06-22T00:00:00.000Z',
  },
}

describe('registryItemSchema', () => {
  it('accepts a fully specified item', () => {
    expect(registryItemSchema.safeParse(validItem).success).toBe(true)
  })

  it('rejects a missing author', () => {
    const { author: _author, ...withoutAuthor } = validItem
    expect(registryItemSchema.safeParse(withoutAuthor).success).toBe(false)
  })

  it('rejects an uppercase slug name', () => {
    const result = registryItemSchema.safeParse({
      ...validItem,
      name: 'My-Agent',
    })
    expect(result.success).toBe(false)
  })

  it('rejects unknown top-level keys', () => {
    const result = registryItemSchema.safeParse({
      ...validItem,
      unknownKey: true,
    })
    expect(result.success).toBe(false)
  })

  it('rejects unknown meta keys (e.g. meta.author)', () => {
    const result = registryItemSchema.safeParse({
      ...validItem,
      meta: { ...validItem.meta, author: 'octocat' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects a non-ISO meta date', () => {
    const result = registryItemSchema.safeParse({
      ...validItem,
      meta: { ...validItem.meta, createdAt: 'yesterday' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects dependencies without a version range', () => {
    const result = registryItemSchema.safeParse({
      ...validItem,
      dependencies: ['eve'],
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty files list', () => {
    const result = registryItemSchema.safeParse({ ...validItem, files: [] })
    expect(result.success).toBe(false)
  })

  it.each([
    '../outside.ts',
    'agent/../../escape.ts',
    '/absolute.ts',
    'agent\\windows.ts',
    'package.json',
    'tsconfig.json',
    'secrets/.env',
  ])('rejects unsafe or disallowed file path %s', (path) => {
    const result = registryItemSchema.safeParse({
      ...validItem,
      files: [{ path, type: 'registry:file', target: '~/agent/x.ts' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects targets that do not start with ~/', () => {
    const result = registryItemSchema.safeParse({
      ...validItem,
      files: [
        {
          path: 'agent/agent.ts',
          type: 'registry:file',
          target: 'agent/agent.ts',
        },
      ],
    })
    expect(result.success).toBe(false)
  })
})

describe('agentRegistryJsonSchema', () => {
  it('accepts exactly one item', () => {
    const result = agentRegistryJsonSchema.safeParse({
      $schema: REGISTRY_SCHEMA_URL,
      items: [validItem],
    })
    expect(result.success).toBe(true)
  })

  it('rejects zero or multiple items', () => {
    const empty = agentRegistryJsonSchema.safeParse({
      $schema: REGISTRY_SCHEMA_URL,
      items: [],
    })
    const double = agentRegistryJsonSchema.safeParse({
      $schema: REGISTRY_SCHEMA_URL,
      items: [validItem, validItem],
    })
    expect(empty.success).toBe(false)
    expect(double.success).toBe(false)
  })

  it('rejects a wrong $schema URL', () => {
    const result = agentRegistryJsonSchema.safeParse({
      $schema: 'https://example.com/schema.json',
      items: [validItem],
    })
    expect(result.success).toBe(false)
  })
})
