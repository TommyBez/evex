import { describe, expect, it } from 'vitest'
import type { AgentWithAuthor } from '@/lib/agent-types'
import {
  DEFAULT_AGENT_SORT,
  parseDependencies,
  parseSort,
  sortAgents,
} from '@/lib/agents'

function makeAgent(overrides: Partial<AgentWithAuthor>): AgentWithAuthor {
  return {
    author: { githubUsername: 'octocat', name: 'octocat' },
    authorAvatarUrl: null,
    authorName: 'octocat',
    authorUsername: 'octocat',
    category: 'general',
    createdAt: new Date('2026-01-01'),
    dependencies: '',
    description: 'desc',
    docs: null,
    id: 'agent-a',
    installCount: 0,
    name: 'Agent A',
    slug: 'agent-a',
    title: 'Agent A',
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  }
}

describe('parseDependencies', () => {
  it('splits on commas and whitespace, dropping empties', () => {
    expect(parseDependencies('eve@^0.31.3,zod@4.3.6')).toEqual([
      'eve@^0.31.3',
      'zod@4.3.6',
    ])
    expect(parseDependencies('')).toEqual([])
    expect(parseDependencies('  a@1 ,  b@2  ')).toEqual(['a@1', 'b@2'])
  })
})

describe('parseSort', () => {
  it('resolves known sorts and defaults safely', () => {
    expect(parseSort('newest')).toBe('newest')
    expect(parseSort('name')).toBe('name')
    expect(parseSort('nonsense')).toBe(DEFAULT_AGENT_SORT)
    expect(parseSort(undefined)).toBe(DEFAULT_AGENT_SORT)
  })
})

describe('sortAgents', () => {
  const older = makeAgent({
    id: 'older',
    name: 'Zeta',
    createdAt: new Date('2026-01-01'),
    installCount: 5,
  })
  const newer = makeAgent({
    id: 'newer',
    name: 'Alpha',
    createdAt: new Date('2026-06-01'),
    installCount: 1,
  })

  it('sorts by installs with recency tie-break for popular', () => {
    expect(sortAgents([newer, older], 'popular')[0]?.id).toBe('older')
  })

  it('sorts by recency for newest', () => {
    expect(sortAgents([older, newer], 'newest')[0]?.id).toBe('newer')
  })

  it('sorts alphabetically for name', () => {
    expect(sortAgents([older, newer], 'name')[0]?.name).toBe('Alpha')
  })

  it('does not mutate the input list', () => {
    const input = [older, newer]
    sortAgents(input, 'name')
    expect(input[0]?.id).toBe('older')
  })
})
