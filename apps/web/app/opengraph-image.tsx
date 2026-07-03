import { siteConfig } from '@/lib/metadata'
import { createOgImage, ogImageContentType, ogImageSize } from '@/lib/og-image'
import { getSiteHost } from '@/lib/site-url'

export const alt = 'evex - the eve agent registry'
export const size = ogImageSize
export const contentType = ogImageContentType

export default function Image() {
  return createOgImage({
    eyebrow: 'registry',
    title: 'Install Community Agents with One Command',
    description: siteConfig.description,
    install: getSiteHost(),
  })
}
