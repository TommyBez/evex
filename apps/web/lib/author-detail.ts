// Pure presentation helpers for author profile metadata.

export function getAuthorMetadataTitle(author: { name: string }): string {
  // The root layout template appends ` · evex`. Keep the brand once in the
  // descriptive phrase ("on evex") and do not add a second suffix here.
  return `${author.name}: eve agents on evex`
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
