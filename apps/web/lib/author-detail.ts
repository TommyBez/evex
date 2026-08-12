// Pure presentation helpers for author profile metadata.

import { METADATA_TITLE_BUDGET } from '@/lib/agent-detail'

export function getAuthorMetadataTitle(author: { name: string }): string {
  // The root layout template appends ` · evex`. Keep the brand out of this
  // string so the rendered title is `{name}: eve agents · evex`.
  const descriptiveTitle = `${author.name}: eve agents`
  if (descriptiveTitle.length <= METADATA_TITLE_BUDGET) {
    return descriptiveTitle
  }

  const compactTitle = `${author.name}: agents`
  if (compactTitle.length <= METADATA_TITLE_BUDGET) {
    return compactTitle
  }

  // Same fallback as agent titles: prefer the bare display name when even the
  // compact form exceeds the SERP budget after the layout suffix.
  return author.name
}

export function getAuthorMetaDescription(author: {
  agentCount: number
  bio: string | null
  name: string
}): string {
  if (author.bio) {
    return author.bio
  }

  const agentLabel = author.agentCount === 1 ? 'agent' : 'agents'
  return `All ${author.agentCount} eve ${agentLabel} published by ${author.name} on evex, with install counts and one command install for each.`
}
