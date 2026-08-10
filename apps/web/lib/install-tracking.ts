// The install counter is public (agent cards, leaderboard, agent pages), so it
// should approximate real installs instead of raw traffic. `/r/*` is
// deliberately left outside the botid protection: the shadcn CLI is itself a
// non-browser client and would be blocked by it. This filter is the
// alternative, and it is best-effort hygiene rather than anti-fraud. It drops
// interactive browsers and self-identifying crawlers, and keeps programmatic
// clients such as the shadcn CLI (Node fetch / undici) counted.

const BROWSER_USER_AGENT_PREFIX = 'Mozilla/'

// Case-insensitive markers of crawlers, link previewers, and headless browsers.
// Kept deliberately narrow: no pattern here may match the shadcn CLI user
// agents (`undici`, `node`, `node-fetch`), which is why plain `fetch` is not on
// the list.
const CRAWLER_USER_AGENT_PATTERNS = [
  'bot',
  'crawl',
  'spider',
  'slurp',
  'headless',
  'lighthouse',
  'facebookexternalhit',
  'bingpreview',
  'preview',
  'scanner',
] as const

// Returns true when the request looks like a programmatic install rather than a
// browser visit or a crawler sweep. A missing or empty user agent counts: many
// CLI clients send none, while browsers and crawlers always identify
// themselves.
export function shouldCountInstall(userAgent: string | null): boolean {
  const normalized = userAgent?.trim() ?? ''

  // Interactive browsers, and most modern crawlers, announce themselves as
  // `Mozilla/5.0 (compatible; ...)`.
  if (normalized.startsWith(BROWSER_USER_AGENT_PREFIX)) {
    return false
  }

  const lowercased = normalized.toLowerCase()

  return !CRAWLER_USER_AGENT_PATTERNS.some((pattern) =>
    lowercased.includes(pattern),
  )
}
