import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/json-ld'
import {
  getDocsIndexPage,
  getDocsPageHeading,
  getDocsPageIntro,
  listDocsSubPages,
} from '@/lib/docs-content'
import { createPageMetadata, siteConfig } from '@/lib/metadata'
import { getDocsUrl } from '@/lib/site-url'
import {
  createDocsArticleSchema,
  createDocsBreadcrumbSchema,
} from '@/lib/structured-data'
import { DocsSections } from './docs-sections'

export function generateMetadata(): Metadata {
  const page = getDocsIndexPage()
  return createPageMetadata({
    title: page.title,
    description: page.description,
    path: '/docs',
    markdownPath: '/docs.md',
    // Layout template is `%s · evex`. og/twitter skip the template, so pass
    // the locked document title (with brand) once for social cards.
    socialTitle: `${page.title} · ${siteConfig.name}`,
  })
}

export default function DocsIndexPage() {
  const page = getDocsIndexPage()
  const subPages = listDocsSubPages()
  const pageUrl = getDocsUrl()

  return (
    <>
      <JsonLd
        data={[
          createDocsArticleSchema(page, pageUrl),
          createDocsBreadcrumbSchema(page, pageUrl),
        ]}
      />
      <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10">
        <article>
          <header>
            <h1 className="text-balance font-semibold text-3xl text-foreground sm:text-4xl">
              {getDocsPageHeading(page)}
            </h1>
            <div className="mt-4 grid max-w-2xl gap-3">
              {getDocsPageIntro(page).map((paragraph) => (
                <p
                  className="text-pretty text-muted-foreground leading-relaxed"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </header>
          <DocsSections page={page} />
        </article>

        <section className="mt-12">
          <h2 className="font-display font-semibold text-foreground text-xl">
            Guides
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {subPages.map((subPage) => (
              <Link
                className="rounded-md border border-border bg-background p-4 transition-colors hover:border-input hover:bg-muted/50"
                href={`/docs/${subPage.slug}`}
                key={subPage.slug}
              >
                <h3 className="font-medium text-foreground">
                  {subPage.shortTitle}
                </h3>
                <p className="mt-2 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
                  {subPage.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
