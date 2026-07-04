import { buildAgentMarkdown } from '@/lib/markdown-content'
import { getStaticAgentBySlug, getStaticAgentFiles } from '@/lib/registry'

// Served at /agents/{slug}.md via the rewrite in next.config.ts. Markdown
// mirrors let LLMs and agent crawlers read a page without parsing HTML.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const agent = getStaticAgentBySlug(slug)
  if (!agent) {
    return new Response('Not found', { status: 404 })
  }

  const files = await getStaticAgentFiles(agent.slug)

  return new Response(buildAgentMarkdown(agent, files), {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Content-Type': 'text/markdown; charset=utf-8',
      // The HTML page is the canonical document for search engines.
      'X-Robots-Tag': 'noindex',
    },
  })
}
