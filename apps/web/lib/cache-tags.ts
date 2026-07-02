import 'server-only'

import { githubUsernameKey } from '@/lib/github'

export const cacheTags = {
  agents: 'agents',
  leaderboard: 'leaderboard',
  registryStats: 'registry-stats',
} as const

export function getAgentTag(slug: string) {
  return `agent:${slug}`
}

export function getAuthorAgentsTag(githubUsername: string) {
  return `author-agents:${githubUsernameKey(githubUsername)}`
}

export function getProfileTag(userId: string) {
  return `profile:${userId}`
}
