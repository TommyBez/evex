import { Toaster } from '@evex/ui/sonner'
import { TooltipProvider } from '@evex/ui/tooltip'
import { Analytics } from '@vercel/analytics/next'
import { GeistMono } from 'geist/font/mono'
import { GeistPixelSquare } from 'geist/font/pixel'
import { GeistSans } from 'geist/font/sans'
import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { JsonLd } from '@/components/json-ld'
import { ThemeProvider } from '@/components/theme-provider'
import { isProduction } from '@/lib/env'
import { siteConfig, siteTwitterHandle } from '@/lib/metadata'
import { getMetadataBase } from '@/lib/site-url'
import {
  createOrganizationSchema,
  createWebsiteSchema,
} from '@/lib/structured-data'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  generator: 'Next.js',
  keywords: [
    'evex',
    'eve',
    'eve agents',
    'eve framework',
    'vercel eve',
    'agent registry',
    'shadcn registry',
    'install eve agent',
    'AI agents',
    'AI agent recipes',
    'npx shadcn add',
    'developer tools',
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: '/',
    siteName: siteConfig.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: siteTwitterHandle,
    creator: siteTwitterHandle,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  // Let content extend under the notch/home indicator so `env(safe-area-inset-*)`
  // padding can position sticky mobile UI correctly.
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable} bg-background`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <JsonLd data={[createOrganizationSchema(), createWebsiteSchema()]} />
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
          {/* Analytics reads useSearchParams(); without a Suspense boundary
              it poisons fully dynamic renders (e.g. the 404 path for unknown
              slugs), turning them into 500s. */}
          {isProduction && (
            <Suspense fallback={null}>
              <Analytics />
            </Suspense>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}
