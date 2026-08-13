import Link from 'next/link'
import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const EXTERNAL_HREF = /^https?:\/\//

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

// Light Markdown pass for learn prose and comparison cells: links + inline
// code (and bold/italic via GFM). Block elements collapse to inline/span so
// cells and paragraphs stay valid HTML.
export function LearnInlineMarkdown({ children }: { children: string }) {
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
          <ol className="mt-3 list-decimal space-y-2 pl-5">{listChildren}</ol>
        ),
        p: ({ children: paragraphChildren }) => (
          <span className="contents">{paragraphChildren}</span>
        ),
        ul: ({ children: listChildren }) => (
          <ul className="mt-3 list-disc space-y-2 pl-5">{listChildren}</ul>
        ),
      }}
      remarkPlugins={[remarkGfm]}
      unwrapDisallowed
    >
      {children}
    </ReactMarkdown>
  )
}
