import { getSiteUrl } from '@/lib/site-url'

// A route handler instead of app/robots.ts because MetadataRoute.Robots
// cannot emit the Content-Signal line (https://contentsignals.org), which
// tells AI crawlers this content may be used for search and AI answers.
function buildRobotsTxt(): string {
  const siteUrl = getSiteUrl()

  return `User-Agent: *
Allow: /
Disallow: /api/
Disallow: /profile
Disallow: /favorites
Disallow: /sign-in
Disallow: /sign-up
Content-Signal: search=yes, ai-input=yes, ai-train=yes

Host: ${siteUrl}
Sitemap: ${siteUrl}/sitemap.xml
`
}

export function GET() {
  return new Response(buildRobotsTxt(), {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
