import { getSiteHost, siteConfig } from '@/lib/metadata'
import { createOgImage, ogImageContentType, ogImageSize } from '@/lib/og-image'

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
