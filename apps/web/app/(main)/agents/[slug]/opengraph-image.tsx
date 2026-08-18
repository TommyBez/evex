import { getAgentBySlug } from '@/lib/data/agents'
import { createOgImage, ogImageContentType, ogImageSize } from '@/lib/og-image'
import { buildInstallCommand } from '@/lib/site-url'

// Route-level alt must be a constant for the file convention; per-agent alt
// is set on openGraph.images[].alt in generateMetadata.
export const alt = 'Agent on evex'
export const size = ogImageSize
export const contentType = ogImageContentType

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const agent = await getAgentBySlug(slug)

  if (!agent) {
    return createOgImage(
      {
        eyebrow: 'agent',
        title: 'Agent not found',
        description: 'This evex registry item is no longer available.',
      },
      { status: 404 },
    )
  }

  return createOgImage({
    eyebrow: agent.category,
    title: agent.name,
    description: agent.description,
    author: agent.authorName,
    install: buildInstallCommand(agent.slug),
  })
}
