import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/metadata'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — the eve agent registry`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
