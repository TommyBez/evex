import { describe, expect, it } from 'vitest'
import {
  compareRelatedAgents,
  countFilesByKind,
  getAgentInstallSummaryDescription,
  getAgentMetadataTitle,
  METADATA_TITLE_MAX_LENGTH,
  pluralize,
} from '@/lib/agent-detail'
import type { AgentRegistryFile, AgentWithAuthor } from '@/lib/agent-types'

function makeFile(path: string): AgentRegistryFile {
  return { content: '', id: `x:${path}`, path, type: 'registry:file' }
}

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

describe('countFilesByKind', () => {
  it('classifies subagents, skills, and tools', () => {
    const kinds = countFilesByKind([
      makeFile('agent/agent.ts'),
      makeFile('agent/subagents/researcher/agent.ts'),
      makeFile('agent/subagents/researcher/instructions.md'),
      makeFile('agent/subagents/writer/agent.ts'),
      makeFile('agent/skills/seo/SKILL.md'),
      makeFile('agent/tools/search.ts'),
    ])

    expect(kinds).toEqual({ skills: 1, subagents: 2, tools: 1 })
  })

  it('returns zeros for core-only agents', () => {
    expect(
      countFilesByKind([makeFile('agent/agent.ts'), makeFile('README.md')]),
    ).toEqual({ skills: 0, subagents: 0, tools: 0 })
  })
})

describe('getAgentInstallSummaryDescription', () => {
  it('falls back to baseline copy when nothing special ships', () => {
    const summary = getAgentInstallSummaryDescription({
      deps: [],
      fileKinds: { skills: 0, subagents: 0, tools: 0 },
    })
    expect(summary.installs).toBe('Core agent files only')
    expect(summary.requires).toBe('Runs on the eve baseline')
  })

  it('lists shipped kinds and dependencies', () => {
    const summary = getAgentInstallSummaryDescription({
      deps: ['eve@^0.31.3'],
      fileKinds: { skills: 2, subagents: 1, tools: 3 },
    })
    expect(summary.installs).toBe('1 subagent · 2 skill files · 3 tools')
    expect(summary.requires).toBe('eve@^0.31.3')
  })
})

describe('getAgentMetadataTitle', () => {
  it('prefers the full install title when it fits', () => {
    const agent = makeAgent({ name: 'Short', slug: 'short' })
    expect(getAgentMetadataTitle(agent)).toBe('Short - install @evex/short')
  })

  it('never exceeds the metadata length budget', () => {
    const agent = makeAgent({
      name: 'A very long agent display name that keeps going',
      slug: 'a-very-long-agent-slug-that-also-keeps-going',
    })
    expect(getAgentMetadataTitle(agent).length).toBeLessThanOrEqual(
      METADATA_TITLE_MAX_LENGTH,
    )
  })
})

describe('compareRelatedAgents', () => {
  const current = makeAgent({ id: 'current', category: 'coding' })

  it('ranks same-category agents first, then by installs', () => {
    const sameCategory = makeAgent({ id: 'same', category: 'coding' })
    const popularOther = makeAgent({ id: 'other', category: 'marketing' })
    const installs = new Map([
      ['same', 1],
      ['other', 100],
    ])

    const sorted = [popularOther, sameCategory].sort(
      compareRelatedAgents(current, installs),
    )
    expect(sorted[0]?.id).toBe('same')
  })

  it('breaks category ties by install count', () => {
    const lowInstalls = makeAgent({ id: 'low', category: 'coding' })
    const highInstalls = makeAgent({ id: 'high', category: 'coding' })
    const installs = new Map([
      ['low', 2],
      ['high', 50],
    ])

    const sorted = [lowInstalls, highInstalls].sort(
      compareRelatedAgents(current, installs),
    )
    expect(sorted[0]?.id).toBe('high')
  })

  it('falls back to name for a stable order', () => {
    const alpha = makeAgent({ id: 'a', name: 'Alpha', category: 'coding' })
    const beta = makeAgent({ id: 'b', name: 'Beta', category: 'coding' })

    const sorted = [beta, alpha].sort(compareRelatedAgents(current, new Map()))
    expect(sorted.map((agent) => agent.name)).toEqual(['Alpha', 'Beta'])
  })
})

describe('pluralize', () => {
  it('handles singular, plural, and irregular forms', () => {
    expect(pluralize(1, 'file')).toBe('1 file')
    expect(pluralize(3, 'file')).toBe('3 files')
    expect(pluralize(2, 'dependency', 'dependencies')).toBe('2 dependencies')
  })
})
