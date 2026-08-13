import { Badge } from '@evex/ui/badge'
import { Button } from '@evex/ui/button'
import { Card } from '@evex/ui/card'
import { Separator } from '@evex/ui/separator'
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/json-ld'
import { LearnInlineMarkdown } from '@/components/learn-inline-markdown'
import {
  getLearnCluster,
  getLearnPage,
  getRelatedLearnPages,
  listLearnPages,
} from '@/lib/learn-content'
import { createPageMetadata } from '@/lib/metadata'
import {
  createLearnArticleSchema,
  createLearnBreadcrumbSchema,
  createLearnFaqSchema,
} from '@/lib/structured-data'

const RELATED_PAGE_LIMIT = 4

export function generateStaticParams() {
  return listLearnPages().map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getLearnPage(slug)
  if (!page) {
    // Unknown slugs render the not-found page. With cacheComponents the
    // fallback shell still streams a 200, but Next injects a robots noindex
    // meta into that response, keeping arbitrary URLs out of the index.
    notFound()
  }

  return createPageMetadata({
    title: page.title,
    description: page.description,
    path: `/learn/${page.slug}`,
    markdownPath: `/learn/${page.slug}.md`,
  })
}

export default async function LearnDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = getLearnPage(slug)
  if (!page) {
    notFound()
  }

  const cluster = getLearnCluster(page.cluster)
  const relatedPages = getRelatedLearnPages(page, RELATED_PAGE_LIMIT)

  return (
    <>
      <JsonLd
        data={[
          createLearnArticleSchema(page),
          createLearnFaqSchema(page),
          createLearnBreadcrumbSchema(page),
        ]}
      />
      <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10">
        <Link
          className="inline-flex min-h-9 items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
          href="/learn"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to Learn
        </Link>

        <article className="mt-6">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{cluster.label}</Badge>
            </div>
            <h1 className="mt-4 text-balance font-semibold text-3xl text-foreground sm:text-4xl">
              {page.title}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
              {page.description}
            </p>
          </header>

          <Card className="mt-8 rounded-md border border-border p-5 shadow-[var(--shadow-card)] ring-0">
            <span className="mono-label inline-flex items-center gap-2 text-brand">
              <BookOpen aria-hidden="true" className="size-4" />
              the short version
            </span>
            <p className="mt-3 text-pretty font-medium text-foreground leading-relaxed">
              {page.summary}
            </p>
          </Card>

          {page.comparisonRows && page.comparisonRows.length > 0 ? (
            <section className="mt-10">
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Comparison of evex and agentcn across install, inspect,
                    publish, and ownership criteria
                  </caption>
                  <thead className="bg-muted/40">
                    <tr className="border-border border-b">
                      <th
                        className="p-3 font-medium text-foreground"
                        scope="col"
                      >
                        Criterion
                      </th>
                      <th
                        className="p-3 font-medium text-foreground"
                        scope="col"
                      >
                        evex
                      </th>
                      <th
                        className="p-3 font-medium text-foreground"
                        scope="col"
                      >
                        agentcn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.comparisonRows.map((row) => (
                      <tr
                        className="border-border border-b last:border-b-0"
                        key={row.criterion}
                      >
                        <th
                          className="bg-background p-3 align-top font-medium text-foreground"
                          scope="row"
                        >
                          {row.criterion}
                        </th>
                        <td className="bg-background p-3 align-top text-muted-foreground leading-relaxed">
                          <LearnInlineMarkdown>{row.left}</LearnInlineMarkdown>
                        </td>
                        <td className="bg-background p-3 align-top text-muted-foreground leading-relaxed">
                          <LearnInlineMarkdown>{row.right}</LearnInlineMarkdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {page.comparisonBottomLine ? (
                <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
                  {page.comparisonBottomLine}
                </p>
              ) : null}
            </section>
          ) : null}

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
                  <div className="mt-4 grid gap-2">
                    {section.bullets.map((bullet) => (
                      <div
                        className="flex items-start gap-4 rounded-md border border-border bg-background p-3"
                        key={bullet}
                      >
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-brand"
                        />
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          <LearnInlineMarkdown>{bullet}</LearnInlineMarkdown>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="font-display font-semibold text-foreground text-xl">
              Decision table
            </h2>
            <div className="mt-4 overflow-hidden rounded-md border border-border">
              {page.decisionRows.map((row) => (
                <div
                  className="grid gap-px border-border border-b bg-border last:border-b-0 md:grid-cols-[0.7fr_1fr_1fr]"
                  key={row.choice}
                >
                  <div className="bg-background p-4">
                    <p className="font-medium text-foreground">{row.choice}</p>
                  </div>
                  <div className="bg-background p-4">
                    <p className="mono-label text-muted-foreground">Use when</p>
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                      {row.useWhen}
                    </p>
                  </div>
                  <div className="bg-background p-4">
                    <p className="mono-label text-muted-foreground">
                      Avoid when
                    </p>
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                      {row.avoidWhen}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 grid gap-4 sm:grid-cols-2">
            {page.examples.map((example) => (
              <InfoBlock
                key={example.label}
                title={example.label}
                value={example.body}
              />
            ))}
          </section>

          <section className="mt-10">
            <h2 className="font-display font-semibold text-foreground text-xl">
              FAQ
            </h2>
            <div className="mt-4 divide-y divide-border rounded-md border border-border">
              {page.faqs.map((faq) => (
                <div className="p-4" key={faq.question}>
                  <h3 className="font-medium text-foreground">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    <LearnInlineMarkdown>{faq.answer}</LearnInlineMarkdown>
                  </p>
                </div>
              ))}
            </div>
          </section>
        </article>

        <Separator className="my-10" />

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display font-semibold text-foreground text-xl">
                Related guides
              </h2>
              <p className="mt-1 text-muted-foreground text-sm">
                Keep moving through the same decision space.
              </p>
            </div>
            <Button render={<Link href="/">Browse installable agents</Link>} />
          </div>
          <div className="mt-4 grid gap-x-4 gap-y-5 sm:grid-cols-2">
            {relatedPages.map((relatedPage) => (
              <Link
                className="flex h-full flex-col rounded-md border border-border p-4 transition-colors hover:border-input hover:bg-muted/40"
                href={`/learn/${relatedPage.slug}`}
                key={relatedPage.slug}
              >
                <h3 className="font-medium text-foreground">
                  {relatedPage.shortTitle}
                </h3>
                <p className="mt-2 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
                  {relatedPage.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-md border border-border p-5 shadow-[var(--shadow-card)] ring-0">
      <h2 className="font-display font-semibold text-foreground text-lg">
        {title}
      </h2>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        <LearnInlineMarkdown>{value}</LearnInlineMarkdown>
      </p>
    </Card>
  )
}
