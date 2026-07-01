import { Badge } from '@evex/ui/badge'
import { Card } from '@evex/ui/card'
import { BookOpen } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/json-ld'
import {
  getLearnPagesByCluster,
  LEARN_CLUSTERS,
  listLearnPages,
} from '@/lib/learn-content'
import { createPageMetadata } from '@/lib/metadata'
import { createLearnListSchema } from '@/lib/structured-data'

export const metadata: Metadata = createPageMetadata({
  title: 'Learn AI Agent Engineering',
  description:
    'Decision-focused guides for Eve, AI agents, MCP, shadcn registries, and adjacent agent frameworks.',
  path: '/learn',
})

export default function LearnPage() {
  const pages = listLearnPages()

  return (
    <>
      <JsonLd data={createLearnListSchema(pages)} />
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6">
        <header className="max-w-3xl">
          <span className="mono-label inline-flex items-center gap-2 text-muted-foreground">
            <BookOpen aria-hidden="true" className="size-4 text-brand" />
            learn
          </span>
          <h1 className="mt-3 text-balance font-semibold text-3xl text-foreground sm:text-4xl">
            AI agent engineering guides for people building real agents
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            Practical pages on Eve, MCP, tools, skills, subagents, durable runs,
            shadcn registries, and framework tradeoffs. Start with the decision,
            then inspect installable source when you are ready to build.
          </p>
        </header>

        <section className="mt-10 grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {LEARN_CLUSTERS.map((cluster) => {
            const clusterPages = getLearnPagesByCluster(cluster.id)

            return (
              <Card
                className="rounded-md border border-border p-5 shadow-[var(--shadow-card)] ring-0"
                key={cluster.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display font-semibold text-foreground text-lg">
                    {cluster.label}
                  </h2>
                  <Badge variant="secondary">{clusterPages.length}</Badge>
                </div>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  {cluster.description}
                </p>
                <div className="mt-4 grid gap-3">
                  {clusterPages.slice(0, 5).map((page) => (
                    <Link
                      className="flex h-full flex-col rounded-md border border-border px-3 py-2 text-sm transition-colors hover:border-input hover:bg-muted/50"
                      href={`/learn/${page.slug}`}
                      key={page.slug}
                    >
                      <span className="font-medium text-foreground">
                        {page.shortTitle}
                      </span>
                      <span className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
                        {page.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>
            )
          })}
        </section>

        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display font-semibold text-foreground text-xl">
                All guides
              </h2>
              <p className="mt-1 text-muted-foreground text-sm">
                {pages.length} indexable guides, grouped by practical agent
                decisions.
              </p>
            </div>
          </div>
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <Link
                className="group flex h-full flex-col rounded-md border border-border p-4 transition-colors hover:border-input hover:bg-muted/40"
                href={`/learn/${page.slug}`}
                key={page.slug}
              >
                <span className="mono-label text-muted-foreground">
                  {page.primaryKeyword}
                </span>
                <h3 className="mt-2 font-display font-semibold text-foreground">
                  {page.shortTitle}
                </h3>
                <p className="mt-2 line-clamp-3 text-muted-foreground text-sm leading-relaxed">
                  {page.description}
                </p>
                <span className="mt-auto inline-flex pt-3 text-brand text-sm opacity-0 transition-opacity group-hover:opacity-100">
                  Read guide →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
