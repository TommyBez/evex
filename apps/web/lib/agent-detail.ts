// Pure presentation logic for the agent detail page: file taxonomy, install
// summary copy, metadata title fitting, and related-agent ranking.

import type { AgentRegistryFile, AgentWithAuthor } from '@/lib/agent-types'

// The root layout appends this suffix through `title.template`, so the title
// a page returns has to fit the display budget minus the suffix.
export const METADATA_TITLE_SUFFIX = ' · evex'
export const METADATA_TITLE_MAX_LENGTH = 60
export const METADATA_TITLE_BUDGET =
  METADATA_TITLE_MAX_LENGTH - METADATA_TITLE_SUFFIX.length
const SUBAGENT_PATH_REGEX = /^agent\/subagents\/([^/]+)/
const SKILL_PATH_REGEX = /\/skills\//
const TOOL_PATH_REGEX = /\/tools\//

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${count} ${count === 1 ? singular : plural}`
}

export interface AgentFileKinds {
  skills: number
  subagents: number
  tools: number
}

export function countFilesByKind(
  files: readonly AgentRegistryFile[],
): AgentFileKinds {
  const subagentNames = new Set<string>()
  let skills = 0
  let tools = 0

  for (const file of files) {
    const subagentMatch = file.path.match(SUBAGENT_PATH_REGEX)
    if (subagentMatch?.[1]) {
      subagentNames.add(subagentMatch[1])
      continue
    }

    if (SKILL_PATH_REGEX.test(file.path)) {
      skills += 1
      continue
    }

    if (TOOL_PATH_REGEX.test(file.path)) {
      tools += 1
    }
  }

  return {
    skills,
    subagents: subagentNames.size,
    tools,
  }
}

export function getAgentInstallSummaryDescription({
  deps,
  fileKinds,
}: {
  deps: readonly string[]
  fileKinds: AgentFileKinds
}) {
  const fileParts = [
    fileKinds.subagents > 0 ? pluralize(fileKinds.subagents, 'subagent') : null,
    fileKinds.skills > 0 ? pluralize(fileKinds.skills, 'skill file') : null,
    fileKinds.tools > 0 ? pluralize(fileKinds.tools, 'tool') : null,
  ].filter((part): part is string => Boolean(part))

  return {
    installs:
      fileParts.length > 0 ? fileParts.join(' · ') : 'Core agent files only',
    requires: deps.length > 0 ? deps.join(', ') : 'Runs on the eve baseline',
  }
}

export function getAgentMetadataTitle(agent: AgentWithAuthor): string {
  const installTitle = `${agent.name} - install @evex/${agent.slug}`
  if (installTitle.length <= METADATA_TITLE_BUDGET) {
    return installTitle
  }

  const compactTitle = `${agent.name} - @evex/${agent.slug}`
  if (compactTitle.length <= METADATA_TITLE_BUDGET) {
    return compactTitle
  }

  // The layout template already appends the brand, so the fallback stays bare
  // to avoid rendering it twice.
  return agent.name
}

// Rank related agents: same category first, then installs, recency, same
// author, and finally name for a stable order.
export function compareRelatedAgents(
  currentAgent: AgentWithAuthor,
  installCounts: ReadonlyMap<string, number>,
) {
  return (left: AgentWithAuthor, right: AgentWithAuthor) => {
    const leftCategoryMatch = left.category === currentAgent.category ? 1 : 0
    const rightCategoryMatch = right.category === currentAgent.category ? 1 : 0

    if (leftCategoryMatch !== rightCategoryMatch) {
      return rightCategoryMatch - leftCategoryMatch
    }

    const leftInstalls = installCounts.get(left.id) ?? 0
    const rightInstalls = installCounts.get(right.id) ?? 0
    if (leftInstalls !== rightInstalls) {
      return rightInstalls - leftInstalls
    }

    const leftUpdatedAt = left.updatedAt.getTime()
    const rightUpdatedAt = right.updatedAt.getTime()
    if (leftUpdatedAt !== rightUpdatedAt) {
      return rightUpdatedAt - leftUpdatedAt
    }

    const currentAuthor = currentAgent.authorUsername?.toLowerCase() ?? ''
    const leftAuthorMatch =
      left.authorUsername?.toLowerCase() === currentAuthor ? 1 : 0
    const rightAuthorMatch =
      right.authorUsername?.toLowerCase() === currentAuthor ? 1 : 0
    if (leftAuthorMatch !== rightAuthorMatch) {
      return rightAuthorMatch - leftAuthorMatch
    }

    return left.name.localeCompare(right.name)
  }
}
