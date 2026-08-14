// The install counter is public (agent cards, leaderboard, agent pages), so it
// should approximate real installs instead of raw traffic. `/r/*` is
// deliberately left outside the botid protection: the shadcn CLI is itself a
// non-browser client and would be blocked by it. This filter is the
// alternative, and it is best-effort hygiene rather than anti-fraud. It drops
// interactive browsers and self-identifying crawlers, and keeps programmatic
// clients such as the shadcn CLI (undici / node-fetch / npm) counted.

const BROWSER_USER_AGENT_PREFIX = 'Mozilla/'

// Overnight sweeper that still increments Neon (~11 slugs same-second). Exact
// match only — do not treat every UA that contains the substring `node` as a
// bot (e.g. `node-fetch/3.3.2`, `npm/10.9.0 node/v24.0.0` must still count).
const EXACT_IGNORED_USER_AGENTS = new Set(['node'])

// Case-insensitive markers of crawlers, link previewers, and headless browsers.
// Kept deliberately narrow: no pattern here may match the shadcn CLI user
// agents (`undici`, `node-fetch`, `npm/... node/v...`), which is why plain
// `fetch` is not on the list. Bare `node` is handled separately above.
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

// Bots conventionally point at a contact or documentation URL inside their user
// agent (`+https://example.com/bot`). No install client does that: the shadcn
// CLI ships bare tokens such as `undici` or `node-fetch/3.3.2`.
const CRAWLER_USER_AGENT_URL_MARKERS = ['http://', 'https://'] as const

// Returns true when the request looks like a programmatic install rather than a
// browser visit, a crawler sweep, or the overnight bare-`node` sweeper. Empty
// or missing user agents are not counted: the sweeper and anonymous scrapers
// often send none, while real CLI clients identify as `undici`, `node-fetch`,
// or `npm/... node/v...`.
export function shouldCountInstall(userAgent: string | null): boolean {
  const normalized = userAgent?.trim() ?? ''

  // Missing / whitespace-only UA, or the overnight sweeper's exact token.
  if (
    normalized.length === 0 ||
    EXACT_IGNORED_USER_AGENTS.has(normalized.toLowerCase())
  ) {
    return false
  }

  // Interactive browsers, and most modern crawlers, announce themselves as
  // `Mozilla/5.0 (compatible; ...)`.
  if (normalized.startsWith(BROWSER_USER_AGENT_PREFIX)) {
    return false
  }

  const lowercased = normalized.toLowerCase()

  // A user agent carrying its own URL is a crawler identifying itself.
  if (
    CRAWLER_USER_AGENT_URL_MARKERS.some((marker) => lowercased.includes(marker))
  ) {
    return false
  }

  return !CRAWLER_USER_AGENT_PATTERNS.some((pattern) =>
    lowercased.includes(pattern),
  )
}
