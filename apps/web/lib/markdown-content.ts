import 'server-only'

import type { AgentRegistryFile, AgentWithAuthor } from '@/lib/agent-types'
import { parseDependencies } from '@/lib/agents'
import type { LearnPage } from '@/lib/learn-content'
import {
  buildInstallCommand,
  getAgentUrl,
  getAuthorUrl,
  getLearnUrl,
  getSiteUrl,
} from '@/lib/site-url'

const BACKTICK_RUNS = /`+/g
const MIN_FENCE_LENGTH = 3
const FILE_EXTENSION = /\.([^./]+)$/

const EXTENSION_LANGUAGES: Record<string, string> = {
  js: 'js',
  json: 'json',
  jsonc: 'jsonc',
  md: 'md',
  mdx: 'mdx',
  mjs: 'js',
  sh: 'sh',
  sql: 'sql',
  toml: 'toml',
  ts: 'ts',
  tsx: 'tsx',
  yaml: 'yaml',
  yml: 'yaml',
}

function codeFenceFor(content: string): string {
  let longestRun = 0
  for (const match of content.matchAll(BACKTICK_RUNS)) {
    longestRun = Math.max(longestRun, match[0].length)
  }
  return '`'.repeat(Math.max(MIN_FENCE_LENGTH, longestRun + 1))
}

function languageForPath(path: string): string {
  const extension = FILE_EXTENSION.exec(path)?.[1]?.toLowerCase()
  return extension ? (EXTENSION_LANGUAGES[extension] ?? '') : ''
}

function fencedFileBlock(file: AgentRegistryFile): string {
  const fence = codeFenceFor(file.content)
  const language = languageForPath(file.path)
  return `### \`${file.path}\`\n\n${fence}${language}\n${file.content}\n${fence}`
}

export function buildAgentMarkdown(
  agent: AgentWithAuthor,
  files: readonly AgentRegistryFile[],
): string {
  const deps = parseDependencies(agent.dependencies)
  const agentUrl = getAgentUrl(agent.slug)
  const factLines = [
    `- Install: \`${buildInstallCommand(agent.slug)}\``,
    `- Category: ${agent.category}`,
    agent.authorUsername
      ? `- Author: [${agent.authorName}](${getAuthorUrl(agent.authorUsername)})`
      : `- Author: ${agent.authorName}`,
    `- Updated: ${agent.updatedAt.toISOString().slice(0, 10)}`,
    `- Dependencies: ${deps.length > 0 ? deps.join(', ') : 'none'}`,
    `- Web page: ${agentUrl}`,
    `- This document: ${agentUrl}.md`,
  ]
  const fileList = files.map((file) => `- \`${file.path}\``).join('\n')
  const fileContents = files.map(fencedFileBlock).join('\n\n')

  return `# ${agent.name}

${agent.description}

${factLines.join('\n')}

## Files installed

${fileList || 'No files listed.'}

## File contents

${fileContents || 'No file contents available.'}
`
}

function learnSectionMarkdown(page: LearnPage): string {
  return page.sections
    .map((section) => {
      const bullets = section.bullets?.length
        ? `\n\n${section.bullets.map((bullet) => `- ${bullet}`).join('\n')}`
        : ''
      return `## ${section.heading}\n\n${section.body.join('\n\n')}${bullets}`
    })
    .join('\n\n')
}

function learnDecisionTableMarkdown(page: LearnPage): string {
  if (page.decisionRows.length === 0) {
    return ''
  }
  const rows = page.decisionRows
    .map((row) => `| ${row.choice} | ${row.useWhen} | ${row.avoidWhen} |`)
    .join('\n')
  return `## Decision table

| Choice | Use when | Avoid when |
| --- | --- | --- |
${rows}`
}

function learnExamplesMarkdown(page: LearnPage): string {
  if (page.examples.length === 0) {
    return ''
  }
  const examples = page.examples
    .map((example) => `### ${example.label}\n\n${example.body}`)
    .join('\n\n')
  return `## Examples\n\n${examples}`
}

function learnFaqMarkdown(page: LearnPage): string {
  if (page.faqs.length === 0) {
    return ''
  }
  const faqs = page.faqs
    .map((faq) => `### ${faq.question}\n\n${faq.answer}`)
    .join('\n\n')
  return `## FAQ\n\n${faqs}`
}

export function buildLearnPageMarkdown(page: LearnPage): string {
  const learnUrl = getLearnUrl(page.slug)
  const blocks = [
    `# ${page.title}`,
    page.description,
    page.summary,
    learnSectionMarkdown(page),
    learnDecisionTableMarkdown(page),
    learnExamplesMarkdown(page),
    learnFaqMarkdown(page),
    `---

- Published: ${page.datePublished}
- Updated: ${page.dateModified}
- Web page: ${learnUrl}
- This document: ${learnUrl}.md
- All guides: ${getSiteUrl()}/learn`,
  ]

  return `${blocks.filter(Boolean).join('\n\n')}\n`
}
