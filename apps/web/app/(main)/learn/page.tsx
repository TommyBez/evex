import { Card } from '@evex/ui/card'
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/json-ld'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import { getLearnPage } from '@/lib/learn-content'
import { createPageMetadata } from '@/lib/metadata'
import { createLearnListSchema } from '@/lib/structured-data'

// PMM-locked. Layout template appends ` · evex` — do not include the brand
// suffix here or the rendered <title> doubles it.
export const LEARN_INDEX_TITLE = 'Eve agent guides for the Eve framework'
export const LEARN_INDEX_DESCRIPTION =
  'Guides for Vercel Eve agents you install from evex, the open registry on Cursor and the shadcn CLI. Start from the catalog at /agents.'
export const LEARN_INDEX_H1 = 'Eve agent guides'
const LEARN_INDEX_INTRO_BEFORE_AGENTS =
  'These guides are for Vercel Eve agents you install from evex, the open registry on Cursor and the shadcn CLI. Not the game and not the TV show. Start from the catalog at '
export const LEARN_INDEX_INTRO = `${LEARN_INDEX_INTRO_BEFORE_AGENTS}/agents.`
export const LEARN_INDEX_REGISTRY_LINK =
  'What an Eve agent registry is: [Eve agent registry](/learn/eve-agent-registry).'

const FEATURED_LEARN_SLUGS = ['evex-vs-agentcn', 'langgraph-vs-crewai'] as const

export const metadata: Metadata = createPageMetadata({
  title: LEARN_INDEX_TITLE,
  description: LEARN_INDEX_DESCRIPTION,
  path: '/learn',
})

export default function LearnPage() {
  const featuredPages = FEATURED_LEARN_SLUGS.map((slug) => {
    const page = getLearnPage(slug)
    if (!page) {
      throw new Error(`Missing featured learn page: ${slug}`)
    }
    return page
  })

  return (
    <>
      <JsonLd data={createLearnListSchema(featuredPages)} />
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6">
        <header className="max-w-3xl">
          <h1 className="text-balance font-semibold text-3xl text-foreground sm:text-4xl">
            {LEARN_INDEX_H1}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            {LEARN_INDEX_INTRO_BEFORE_AGENTS}
            <Link
              className="font-medium text-foreground underline underline-offset-4 hover:text-brand"
              href="/agents"
            >
              /agents
            </Link>
            .
          </p>
          <p className="mt-3 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            <LearnInlineMarkdown>
              {LEARN_INDEX_REGISTRY_LINK}
            </LearnInlineMarkdown>
          </p>
        </header>

        <section
          aria-label="Eve agent guides"
          className="mt-10 grid gap-x-4 gap-y-5 sm:grid-cols-2"
        >
          {featuredPages.map((page) => (
            <Link
              className="group flex h-full flex-col"
              href={`/learn/${page.slug}`}
              key={page.slug}
            >
              <Card className="flex h-full flex-col rounded-md border border-border p-4 shadow-[var(--shadow-card)] ring-0 transition-colors group-hover:border-input group-hover:bg-muted/40">
                <h2 className="font-display font-semibold text-foreground">
                  {page.shortTitle}
                </h2>
                <p className="mt-2 line-clamp-3 text-muted-foreground text-sm leading-relaxed">
                  {page.description}
                </p>
                <span className="mt-auto inline-flex pt-3 text-brand text-sm opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  Read guide{' '}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </Card>
            </Link>
          ))}
        </section>
      </main>
    </>
  )
}
