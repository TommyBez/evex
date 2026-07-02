import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'
import { GitHubIcon } from '@/components/github-icon'
import { XIcon } from '@/components/x-icon'

const REPO_URL = 'https://github.com/TommyBez/evex'
const X_PROFILE_URL = 'https://x.com/TommyBez85'
const EVE_DOCS_URL = 'https://eve.dev/docs/introduction'

export function SiteFooter() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 text-muted-foreground sm:justify-start">
            <BrandMark />
            <span className="flex items-baseline gap-2">
              <Link className="brand-wordmark text-foreground" href="/">
                evex
              </Link>
              <span className="mono-label">the eve agent registry</span>
            </span>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
          >
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/leaderboard"
            >
              Leaderboard
            </Link>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/learn"
            >
              Learn
            </Link>
            <a
              className="text-muted-foreground transition-colors hover:text-foreground"
              href={EVE_DOCS_URL}
              rel="noreferrer noopener"
              target="_blank"
            >
              eve docs
            </a>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/llms.txt"
            >
              llms.txt
            </Link>
          </nav>
        </div>

        <div className="flex items-center justify-center gap-1 sm:justify-end">
          <a
            aria-label="evex on GitHub"
            className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:size-9"
            href={REPO_URL}
            rel="noreferrer noopener"
            target="_blank"
          >
            <GitHubIcon className="size-[1.125rem]" />
          </a>
          <a
            aria-label="TommyBez on X"
            className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:size-9"
            href={X_PROFILE_URL}
            rel="noreferrer noopener"
            target="_blank"
          >
            <XIcon className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
