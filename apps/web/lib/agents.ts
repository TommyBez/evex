// Shared helpers and types for working with eve agents in the registry.

import type { AgentWithAuthor } from '@/lib/agent-types'

export const AGENT_CATEGORIES = [
  'general',
  'coding',
  'research',
  'support',
  'data',
  'productivity',
  'devops',
] as const

export type AgentCategory = (typeof AGENT_CATEGORIES)[number]

const DEPENDENCY_SPLIT = /[\s,]+/

// Parse the comma/space separated dependency string into a clean array.
export function parseDependencies(raw: string): string[] {
  return raw.split(DEPENDENCY_SPLIT).flatMap((dependency) => {
    const trimmed = dependency.trim()
    return trimmed ? [trimmed] : []
  })
}

// Ways to order the browse grid. Kept here so the client filter UI and the
// server result list stay in sync on the available options and default.
export const AGENT_SORTS = [
  { value: 'popular', label: 'Most installed' },
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name A–Z' },
] as const

export type AgentSort = (typeof AGENT_SORTS)[number]['value']

export const DEFAULT_AGENT_SORT: AgentSort = 'popular'

// Resolve an untrusted query-string value into a known sort, defaulting safely.
export function parseSort(value: string | undefined): AgentSort {
  const match = AGENT_SORTS.find((sort) => sort.value === value)
  return match ? match.value : DEFAULT_AGENT_SORT
}

export function getSortLabel(value: AgentSort): string {
  const match = AGENT_SORTS.find((sort) => sort.value === value)
  return match ? match.label : value
}

function compareNewest(left: AgentWithAuthor, right: AgentWithAuthor): number {
  return right.createdAt.getTime() - left.createdAt.getTime()
}

// Sort a hydrated agent list. `popular` falls back to recency on ties so the
// order stays stable even before any install metrics exist.
export function sortAgents<T extends AgentWithAuthor>(
  agents: readonly T[],
  sort: AgentSort,
): T[] {
  const ordered = [...agents]

  if (sort === 'name') {
    return ordered.sort((left, right) => left.name.localeCompare(right.name))
  }

  if (sort === 'newest') {
    return ordered.sort(compareNewest)
  }

  return ordered.sort((left, right) => {
    if (right.installCount !== left.installCount) {
      return right.installCount - left.installCount
    }
    return compareNewest(left, right)
  })
}
