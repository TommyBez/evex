import { describe, expect, it } from 'vitest'
import { shouldCountInstall } from '@/lib/install-tracking'

const CHROME_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const SAFARI_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15'
const FIREFOX_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0'
const GOOGLEBOT_USER_AGENT =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const BINGBOT_USER_AGENT =
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'
const GPTBOT_USER_AGENT =
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot'

describe('shouldCountInstall', () => {
  it('ignores interactive browsers', () => {
    expect(shouldCountInstall(CHROME_USER_AGENT)).toBe(false)
    expect(shouldCountInstall(SAFARI_USER_AGENT)).toBe(false)
    expect(shouldCountInstall(FIREFOX_USER_AGENT)).toBe(false)
  })

  it('ignores crawlers that pose as browsers', () => {
    expect(shouldCountInstall(GOOGLEBOT_USER_AGENT)).toBe(false)
    expect(shouldCountInstall(BINGBOT_USER_AGENT)).toBe(false)
    expect(shouldCountInstall(GPTBOT_USER_AGENT)).toBe(false)
    expect(shouldCountInstall('curl/8.5.0 GoogleBot')).toBe(false)
  })

  it('counts the shadcn CLI fetch clients', () => {
    expect(shouldCountInstall('undici')).toBe(true)
    expect(shouldCountInstall('node')).toBe(true)
    expect(shouldCountInstall('node-fetch/3.3.2')).toBe(true)
    expect(shouldCountInstall('npm/10.9.0 node/v24.0.0')).toBe(true)
  })

  it('counts requests without a usable user agent', () => {
    expect(shouldCountInstall('')).toBe(true)
    expect(shouldCountInstall('   ')).toBe(true)
    expect(shouldCountInstall(null)).toBe(true)
  })

  it('counts other programmatic clients', () => {
    expect(shouldCountInstall('curl/8.5.0')).toBe(true)
    // Deliberate: the filter targets browsers and self-identifying crawlers,
    // not every scripted client. Unlabelled scripts stay in the count.
    expect(shouldCountInstall('python-requests/2.32.3')).toBe(true)
  })
})
