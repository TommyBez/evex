import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/json-ld'
import { getDocsPage, listDocsSubPages } from '@/lib/docs-content'
import { createPageMetadata } from '@/lib/metadata'
import { getDocsUrl } from '@/lib/site-url'
import {
  createDocsArticleSchema,
  createDocsBreadcrumbSchema,
  createDocsInstallHowToSchema,
} from '@/lib/structured-data'
import { DocsSections } from '../docs-sections'

export function generateStaticParams() {
  return listDocsSubPages().map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getDocsPage(slug)
  if (!page || page.slug === 'introduction') {
    // Unknown slugs render the not-found page. With cacheComponents the
    // fallback shell still streams a 200, but Next injects a robots noindex
    // meta into that response, keeping arbitrary URLs out of the index.
    notFound()
  }

  return createPageMetadata({
    title: page.title,
    description: page.description,
    path: `/docs/${page.slug}`,
    markdownPath: `/docs/${page.slug}.md`,
  })
}

export default async function DocsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = getDocsPage(slug)
  if (!page || page.slug === 'introduction') {
    notFound()
  }

  const pageUrl = getDocsUrl(page.slug)
  const otherPages = listDocsSubPages().filter(
    (other) => other.slug !== page.slug,
  )
  const jsonLd = [
    createDocsArticleSchema(page, pageUrl),
    createDocsBreadcrumbSchema(page, pageUrl),
    ...(page.slug === 'installation'
      ? [createDocsInstallHowToSchema(page)]
      : []),
  ]

  return (
    <>
      <JsonLd data={jsonLd} />
      <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10">
        <Link
          className="inline-flex min-h-9 items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
          href="/docs"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to Docs
        </Link>

        <article className="mt-6">
          <header>
            <h1 className="text-balance font-semibold text-3xl text-foreground sm:text-4xl">
              {page.title}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
              {page.description}
            </p>
          </header>
          <DocsSections page={page} />
        </article>

        <section className="mt-12">
          <h2 className="font-display font-semibold text-foreground text-xl">
            More docs
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {otherPages.map((other) => (
              <Link
                className="rounded-md border border-border bg-background p-4 transition-colors hover:border-input hover:bg-muted/50"
                href={`/docs/${other.slug}`}
                key={other.slug}
              >
                <h3 className="font-medium text-foreground">
                  {other.shortTitle}
                </h3>
                <p className="mt-2 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
                  {other.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
