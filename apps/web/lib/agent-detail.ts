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
// Asterisk emphasis only. Underscore `__` / `_` delimiters collide with
// snake_case and double-underscore tool names (e.g. supabase__list_tables).
const MARKDOWN_BOLD = /\*\*(.+?)\*\*/g
const MARKDOWN_ITALIC = /(?<!\*)\*([^*]+?)\*(?!\*)/g
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

// Job-intent title for the code-reviewer play only. Other slugs keep the
// name-based budget logic below. Length is 48 so ` · evex` stays ≤ 60.
const CODE_REVIEWER_METADATA_TITLE =
  'Eve PR review agent - install @evex/code-reviewer'

export function getAgentMetadataTitle(agent: AgentWithAuthor): string {
  if (agent.slug === 'code-reviewer') {
    return CODE_REVIEWER_METADATA_TITLE
  }

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

// Single lede under the agent H1. code-reviewer only; other slugs render none.
export function getAgentJobIntentLede(slug: string): string | null {
  if (slug === 'code-reviewer') {
    return 'PR review agent for Eve.'
  }
  return null
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
    .replace(MARKDOWN_BOLD, '$1')
    .replace(MARKDOWN_ITALIC, '$1')
    .replace(MARKDOWN_INLINE_CODE, '$1')
    .replace(WHITESPACE_RUNS, ' ')
    .trim()
}

// Plain prose for AI context files and definition blocks: strip Markdown
// markers without SERP truncation or an embedded install CTA. Callers that
// need the command should append a dedicated Install line via
// buildInstallCommand. Uses the underscore-safe cleaner above.
export function getAgentPlainDescription(
  agent: Pick<AgentWithAuthor, 'description'>,
): string {
  return stripInlineMarkdown(agent.description)
}

function ensureSentenceEnd(value: string): string {
  if (value.length === 0) {
    return value
  }
  return SENTENCE_END.test(value) ? value : `${value}.`
}

const MAX_DEFINITION_JOB_WORDS = 12
const MAX_DEFINITION_WHO_WORDS = 8
const MIN_DEFINITION_WORDS = 45
const MAX_DEFINITION_WORDS = 60
const DEFINITION_FALLBACK_WHO = 'Eve developers'
const DEFINITION_OWNERSHIP_CLAUSE = 'After install you own the files.'
const WORD_SPLIT = /\s+/
const FIRST_SENTENCE = /^.+?[.!?](?=\s|$)/
const TRAILING_SENTENCE_PUNCTUATION = /[.!?]+$/
const AGENT_THAT_PREFIX = /^.+?\bagent\b\s+that\s+(.+)$/i
const AGENT_FOR_PREFIX = /^.+?\bagent\b\s+for\s+(.+)$/i
const ANALYST_FOR_PREFIX = /^.+?\banalyst\b\s+for\s+(.+)$/i
const ENDS_WITH_S_X_Z = /[sxz]$/i
const ENDS_WITH_HUSH = /(?:sh|ch|ss)$/i
const ENDS_WITH_IES = /ies$/i
const ENDS_WITH_THIRD_PERSON_S = /[^s]s$/i
const ENDS_WITH_VOWEL_Y = /[aeiou]y$/i
const ENDS_WITH_Y = /y$/i
const ENDS_WITH_ES_SOUND = /(?:s|x|z|ch|sh)$/i
const IRREGULAR_VERBS: Readonly<Record<string, string>> = {
  be: 'is',
  do: 'does',
  go: 'goes',
  grow: 'grows',
  have: 'has',
  run: 'runs',
  scan: 'scans',
  stream: 'streams',
}

export interface AgentDefinitionBlock {
  afterCommand: string
  beforeCommand: string
  heading: string
  installCommand: string
  plainText: string
  wordCount: number
}

function countWords(value: string): number {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return 0
  }
  return trimmed.split(WORD_SPLIT).filter(Boolean).length
}

function truncateToWords(value: string, maxWords: number): string {
  const words = value.trim().split(WORD_SPLIT).filter(Boolean)
  if (words.length <= maxWords) {
    return words.join(' ')
  }
  return words.slice(0, maxWords).join(' ')
}

function firstSentenceWithoutEnd(value: string): string {
  const match = FIRST_SENTENCE.exec(value)
  return (match?.[0] ?? value).replace(TRAILING_SENTENCE_PUNCTUATION, '').trim()
}

function conjugateLeadingVerb(phrase: string): string {
  const words = phrase.trim().split(WORD_SPLIT).filter(Boolean)
  const first = words[0]
  if (!first) {
    return phrase.trim()
  }

  const lower = first.toLowerCase()
  const irregular = IRREGULAR_VERBS[lower]
  if (irregular) {
    const conjugated =
      first[0] === first[0]?.toUpperCase()
        ? `${irregular[0]?.toUpperCase() ?? ''}${irregular.slice(1)}`
        : irregular
    return [conjugated, ...words.slice(1)].join(' ')
  }

  // Already looks third-person present (reviews, creates, generates).
  if (ENDS_WITH_S_X_Z.test(first) || ENDS_WITH_HUSH.test(first)) {
    return phrase.trim()
  }
  if (ENDS_WITH_IES.test(first) || ENDS_WITH_THIRD_PERSON_S.test(first)) {
    return phrase.trim()
  }

  let conjugated = lower
  if (ENDS_WITH_VOWEL_Y.test(lower)) {
    conjugated = `${lower}s`
  } else if (ENDS_WITH_Y.test(lower)) {
    conjugated = `${lower.slice(0, -1)}ies`
  } else if (ENDS_WITH_ES_SOUND.test(lower)) {
    conjugated = `${lower}es`
  } else {
    conjugated = `${lower}s`
  }

  if (first[0] === first[0]?.toUpperCase()) {
    conjugated = `${conjugated[0]?.toUpperCase() ?? ''}${conjugated.slice(1)}`
  }

  return [conjugated, ...words.slice(1)].join(' ')
}

function extractDefinitionJob(
  description: string,
  maxWords = MAX_DEFINITION_JOB_WORDS,
): string {
  const sentence = firstSentenceWithoutEnd(
    getAgentPlainDescription({ description }),
  )
  if (sentence.length === 0) {
    return 'helps Eve developers ship reusable agent workflows'
  }

  const thatMatch = AGENT_THAT_PREFIX.exec(sentence)
  if (thatMatch?.[1]) {
    return truncateToWords(thatMatch[1], maxWords)
  }

  const forMatch = AGENT_FOR_PREFIX.exec(sentence)
  if (forMatch?.[1]) {
    return truncateToWords(`handles ${forMatch[1]}`, maxWords)
  }

  const analystMatch = ANALYST_FOR_PREFIX.exec(sentence)
  if (analystMatch?.[1]) {
    return truncateToWords(`analyzes ${analystMatch[1]}`, maxWords)
  }

  return truncateToWords(conjugateLeadingVerb(sentence), maxWords)
}

function whoForCategory(category: string): string {
  switch (category) {
    case 'coding':
      // Keep this category-level, not job-specific: coding agents are not all
      // PR reviewers (eve-agent-builder builds and deploys agents).
      return truncateToWords(
        'Eve developers building with code',
        MAX_DEFINITION_WHO_WORDS,
      )
    case 'marketing':
      return truncateToWords(
        'Eve developers shipping marketing work',
        MAX_DEFINITION_WHO_WORDS,
      )
    case 'data':
      return truncateToWords(
        'Eve developers working with data',
        MAX_DEFINITION_WHO_WORDS,
      )
    case 'research':
      return truncateToWords(
        'Eve developers doing research work',
        MAX_DEFINITION_WHO_WORDS,
      )
    case 'productivity':
      return truncateToWords(
        'Eve developers running team operations',
        MAX_DEFINITION_WHO_WORDS,
      )
    default:
      return DEFINITION_FALLBACK_WHO
  }
}

// Prefer a sentence or clause end when a hard word budget would otherwise cut
// mid-phrase (e.g. "...product description, or explicit.").
function truncateToWordsAtBoundary(value: string, maxWords: number): string {
  const words = value.trim().split(WORD_SPLIT).filter(Boolean)
  if (words.length <= maxWords) {
    return words.join(' ')
  }

  const slice = words.slice(0, maxWords).join(' ')
  const minKeep = Math.floor(slice.length * 0.5)

  const sentenceEnd = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('! '),
    slice.lastIndexOf('? '),
  )
  if (sentenceEnd >= minKeep) {
    return slice.slice(0, sentenceEnd + 1).trimEnd()
  }

  const clauseEnd = Math.max(
    slice.lastIndexOf(', '),
    slice.lastIndexOf('; '),
    slice.lastIndexOf(': '),
  )
  if (clauseEnd >= minKeep) {
    return ensureSentenceEnd(slice.slice(0, clauseEnd).trimEnd())
  }

  return ensureSentenceEnd(
    slice.trimEnd().replace(TRAILING_CLAUSE_PUNCTUATION, ''),
  )
}

function clampDefinitionParagraph(
  installCommand: string,
  who: string,
  job: string,
  agentName: string,
): { afterCommand: string; beforeCommand: string; plainText: string } {
  let currentWho = truncateToWords(who, MAX_DEFINITION_WHO_WORDS)
  let currentJob = truncateToWords(job, MAX_DEFINITION_JOB_WORDS)

  const build = (suffix = '') => {
    const beforeCommand = `${agentName} is an Eve agent that ${currentJob}. It is for ${currentWho}. Preview every file on this page, then install with `
    const afterCommand = `.${suffix}`
    const plainText = `${beforeCommand}${installCommand}${afterCommand}`
    return { afterCommand, beforeCommand, plainText }
  }

  let result = build()
  if (countWords(result.plainText) > MAX_DEFINITION_WORDS) {
    currentWho = DEFINITION_FALLBACK_WHO
    result = build()
  }

  while (
    countWords(result.plainText) > MAX_DEFINITION_WORDS &&
    currentJob.split(WORD_SPLIT).filter(Boolean).length > 1
  ) {
    currentJob = truncateToWords(currentJob, countWords(currentJob) - 1)
    result = build()
  }

  return result
}

// AI-extractable "What is {name}?" block for agent detail pages. Keeps the
// install command as a separate segment so the page can render inline <code>.
export function getAgentDefinitionBlock(
  agent: Pick<
    AgentWithAuthor,
    'name' | 'slug' | 'description' | 'category' | 'docs'
  >,
): AgentDefinitionBlock {
  const installCommand = buildInstallCommand(agent.slug)
  const job = extractDefinitionJob(agent.description)
  const who = whoForCategory(agent.category)
  let { beforeCommand, afterCommand, plainText } = clampDefinitionParagraph(
    installCommand,
    who,
    job,
    agent.name,
  )

  if (countWords(plainText) < MIN_DEFINITION_WORDS) {
    const overviewClause = agent.docs?.overview[0]
    const fillerClause = overviewClause
      ? firstSentenceWithoutEnd(stripInlineMarkdown(overviewClause))
      : DEFINITION_OWNERSHIP_CLAUSE.replace(TRAILING_SENTENCE_PUNCTUATION, '')
    // Truncate only the filler against the remaining budget so we do not cut
    // at the install-command sentence end and drop the append entirely.
    const baseWithCommand = `${beforeCommand}${installCommand}.`
    const remainingWords = MAX_DEFINITION_WORDS - countWords(baseWithCommand)
    if (remainingWords > 0 && fillerClause.length > 0) {
      const filler = truncateToWordsAtBoundary(
        ensureSentenceEnd(fillerClause),
        remainingWords,
      )
      if (countWords(filler) > 0) {
        plainText = `${baseWithCommand} ${filler}`
        afterCommand = `. ${filler}`
      }
    }
  }

  return {
    afterCommand,
    beforeCommand,
    heading: `What is ${agent.name}?`,
    installCommand,
    plainText,
    wordCount: countWords(plainText),
  }
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
