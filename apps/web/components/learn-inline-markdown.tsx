import Link from 'next/link'
import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const EXTERNAL_HREF = /^https?:\/\//
const BLOCK_MARKDOWN_START = /^(?:#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```|~~~|\|.+\|)/

function MarkdownLink({
  href,
  children,
}: {
  href?: string
  children?: ReactNode
}) {
  if (!href) {
    return <span>{children}</span>
  }

  const isExternal = EXTERNAL_HREF.test(href)
  if (isExternal) {
    return (
      <a
        className="text-brand underline-offset-4 hover:underline"
        href={href}
        rel="noreferrer noopener"
        target="_blank"
      >
        {children}
      </a>
    )
  }

  return (
    <Link className="text-brand underline-offset-4 hover:underline" href={href}>
      {children}
    </Link>
  )
}

export function looksLikeBlockMarkdown(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.includes('\n')) {
    return true
  }
  return BLOCK_MARKDOWN_START.test(trimmed)
}

// Light Markdown pass for learn prose and comparison cells: links + inline
// code (and bold/italic via GFM). Use variant="block" when the source may
// contain lists or other block nodes so callers do not wrap them in <p>.
export function LearnInlineMarkdown({
  children,
  variant = 'inline',
}: {
  children: string
  variant?: 'inline' | 'block'
}) {
  const isBlock = variant === 'block'

  return (
    <ReactMarkdown
      components={{
        a: ({ href, children: linkChildren }) => (
          <MarkdownLink href={href}>{linkChildren}</MarkdownLink>
        ),
        code: ({ children: codeChildren }) => (
          <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground">
            {codeChildren}
          </code>
        ),
        li: ({ children: listChildren }) => (
          <li className="leading-relaxed">{listChildren}</li>
        ),
        ol: ({ children: listChildren }) => (
          <ol className="list-decimal space-y-2 pl-5">{listChildren}</ol>
        ),
        p: ({ children: paragraphChildren }) =>
          isBlock ? (
            <p className="text-pretty leading-relaxed">{paragraphChildren}</p>
          ) : (
            <span className="contents">{paragraphChildren}</span>
          ),
        ul: ({ children: listChildren }) => (
          <ul className="list-disc space-y-2 pl-5">{listChildren}</ul>
        ),
      }}
      remarkPlugins={[remarkGfm]}
      unwrapDisallowed
    >
      {children}
    </ReactMarkdown>
  )
}
