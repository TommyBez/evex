import { getLearnPage } from '@/lib/learn-content'
import { buildLearnPageMarkdown } from '@/lib/markdown-content'

// Served at /learn/{slug}.md via the rewrite in next.config.ts. Markdown
// mirrors let LLMs and agent crawlers read a page without parsing HTML.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const page = getLearnPage(slug)
  if (!page) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(buildLearnPageMarkdown(page), {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Content-Type': 'text/markdown; charset=utf-8',
      // The HTML page is the canonical document for search engines.
      'X-Robots-Tag': 'noindex',
    },
  })
}
