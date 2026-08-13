// Pure presentation logic for the agent detail page: file taxonomy, install
// summary copy, metadata title/description fitting, and related-agent ranking.

import type { AgentRegistryFile, AgentWithAuthor } from '@/lib/agent-types'
import { buildInstallCommand } from '@/lib/site-url'

// The root layout appends this suffix through `title.template`, so the title
// a page returns has to fit the display budget minus the suffix.
export const METADATA_TITLE_SUFFIX = ' · evex'
export const METADATA_TITLE_MAX_LENGTH = 60
export const METADATA_TITLE_BUDGET =
  METADATA_TITLE_MAX_LENGTH - METADATA_TITLE_SUFFIX.length
// Google typically shows ~150-160 characters; keep a fixed SERP budget.
export const METADATA_DESCRIPTION_MAX_LENGTH = 155
// Skip the install CTA when it would leave less than this many characters
// for the description lead-in.
const MIN_DESCRIPTION_LEAD_LENGTH = 40
const SUBAGENT_PATH_REGEX = /^agent\/subagents\/([^/]+)/
const SKILL_PATH_REGEX = /\/skills\//
const TOOL_PATH_REGEX = /\/tools\//
const MARKDOWN_BOLD = /(\*\*|__)(.*?)\1/g
const MARKDOWN_ITALIC = /(\*|_)([^*_]+)\1/g
const MARKDOWN_INLINE_CODE = /`([^`]+)`/g
const WHITESPACE_RUNS = /\s+/g
const TRAILING_CLAUSE_PUNCTUATION = /[,:;]+$/
const SENTENCE_END = /[.!?]$/

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

// Replace `[text](destination)` with `text`, including destinations that use
// balanced parentheses (e.g. Wikipedia-style `Function_(mathematics)` URLs).
function stripMarkdownLinks(value: string): string {
  let result = ''
  let index = 0

  while (index < value.length) {
    if (value[index] !== '[') {
      result += value[index]
      index += 1
      continue
    }

    const labelEnd = value.indexOf(']', index + 1)
    if (labelEnd === -1 || value[labelEnd + 1] !== '(') {
      result += value[index]
      index += 1
      continue
    }

    let depth = 1
    let destinationEnd = labelEnd + 2
    while (destinationEnd < value.length && depth > 0) {
      const character = value[destinationEnd]
      if (character === '(') {
        depth += 1
      } else if (character === ')') {
        depth -= 1
      }
      destinationEnd += 1
    }

    if (depth !== 0) {
      result += value[index]
      index += 1
      continue
    }

    result += value.slice(index + 1, labelEnd)
    index = destinationEnd
  }

  return result
}

export function stripInlineMarkdown(value: string): string {
  return stripMarkdownLinks(value)
    .replace(MARKDOWN_BOLD, '$2')
    .replace(MARKDOWN_ITALIC, '$2')
    .replace(MARKDOWN_INLINE_CODE, '$1')
    .replace(WHITESPACE_RUNS, ' ')
    .trim()
}

// Plain prose for AI context files (llms.txt): strip Markdown markers without
// SERP truncation or an embedded install CTA. Callers that need the command
// should append a dedicated Install line via buildInstallCommand.
export function getAgentPlainDescription(
  agent: Pick<AgentWithAuthor, 'description'>,
): string {
  return stripInlineMarkdown(agent.description)
}

function truncateAtBoundary(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value
  }

  const slice = value.slice(0, maxLength)
  const minKeep = Math.floor(maxLength * 0.5)

  const sentenceEnd = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('! '),
    slice.lastIndexOf('? '),
  )
  if (sentenceEnd >= minKeep) {
    return slice.slice(0, sentenceEnd + 1).trimEnd()
  }

  const lastSpace = slice.lastIndexOf(' ')
  if (lastSpace >= minKeep) {
    return slice
      .slice(0, lastSpace)
      .trimEnd()
      .replace(TRAILING_CLAUSE_PUNCTUATION, '')
  }

  return slice.trimEnd()
}

function ensureSentenceEnd(value: string): string {
  if (value.length === 0) {
    return value
  }
  return SENTENCE_END.test(value) ? value : `${value}.`
}

// SERP/OG/JSON-LD description: strip inline Markdown, fit ~155 chars, and
// append the canonical install command when there is room. Optional
// `meta.docs.seoDescription` overrides are out of scope for now.
export function getAgentMetaDescription(
  agent: Pick<AgentWithAuthor, 'description' | 'slug'>,
): string {
  const cleaned = stripInlineMarkdown(agent.description)
  if (cleaned.length === 0) {
    return ''
  }

  const installCommand = buildInstallCommand(agent.slug)
  const cta = ` Install with ${installCommand}.`
  const maxLength = METADATA_DESCRIPTION_MAX_LENGTH

  // Prefer keeping a real description lead-in; skip the CTA if the command
  // alone would crowd out almost everything.
  if (cta.length <= maxLength - MIN_DESCRIPTION_LEAD_LENGTH) {
    const descriptionBudget = maxLength - cta.length
    let lead = truncateAtBoundary(cleaned, descriptionBudget)
    if (lead.length > 0) {
      if (!SENTENCE_END.test(lead)) {
        // Reserve one character so adding the period cannot overflow the budget.
        lead = ensureSentenceEnd(
          truncateAtBoundary(cleaned, Math.max(1, descriptionBudget - 1)),
        )
      }
      const withInstall = `${lead}${cta}`
      if (withInstall.length <= maxLength) {
        return withInstall
      }
    }
  }

  return truncateAtBoundary(cleaned, maxLength)
}

export function getAgentOgImageAlt(
  agent: Pick<AgentWithAuthor, 'name'>,
): string {
  return `${agent.name}: eve agent on evex`
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
