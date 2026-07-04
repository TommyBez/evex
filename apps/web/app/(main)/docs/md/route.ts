import { getDocsIndexPage } from '@/lib/docs-content'
import { buildDocsPageMarkdown } from '@/lib/markdown-content'

// Served at /docs.md via the rewrite in next.config.ts. Markdown mirrors
// let LLMs and agent crawlers read a page without parsing HTML.
export function GET() {
  return new Response(buildDocsPageMarkdown(getDocsIndexPage()), {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Content-Type': 'text/markdown; charset=utf-8',
      // The HTML page is the canonical document for search engines.
      'X-Robots-Tag': 'noindex',
    },
  })
}
