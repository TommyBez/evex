import { Card } from '@evex/ui/card'
import { BookOpen } from 'lucide-react'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import type { DocsPage } from '@/lib/docs-content'

export function DocsSections({ page }: { page: DocsPage }) {
  return (
    <>
      <Card className="mt-8 rounded-md border border-border p-5 shadow-[var(--shadow-card)] ring-0">
        <span className="mono-label inline-flex items-center gap-2 text-brand">
          <BookOpen aria-hidden="true" className="size-4" />
          the short version
        </span>
        <p className="mt-3 text-pretty font-medium text-foreground leading-relaxed">
          {page.summary}
        </p>
      </Card>

      <div className="mt-10 grid gap-10">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display font-semibold text-foreground text-xl">
              {section.heading}
            </h2>
            <div className="mt-3 grid gap-3 text-muted-foreground leading-relaxed">
              {section.body.map((paragraph) => (
                <p key={paragraph}>
                  <LearnInlineMarkdown>{paragraph}</LearnInlineMarkdown>
                </p>
              ))}
            </div>
            {section.bullets ? (
              <ul className="mt-4 grid list-disc gap-2 pl-5 text-muted-foreground leading-relaxed">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
            {section.code?.map((block) => (
              <figure className="mt-4" key={block.code}>
                {block.label ? (
                  <figcaption className="mono-label mb-2 text-muted-foreground">
                    {block.label}
                  </figcaption>
                ) : null}
                <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-foreground text-sm leading-relaxed">
                  <code>{block.code}</code>
                </pre>
              </figure>
            ))}
          </section>
        ))}
      </div>
    </>
  )
}
