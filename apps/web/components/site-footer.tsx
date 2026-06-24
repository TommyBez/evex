import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'
import { GitHubIcon } from '@/components/github-icon'
import { XIcon } from '@/components/x-icon'

const REPO_URL = 'https://github.com/TommyBez/evex'
const X_PROFILE_URL = 'https://x.com/TommyBez85'

export function SiteFooter() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 text-muted-foreground sm:justify-start">
          <BrandMark />
          <span className="flex items-baseline gap-2">
            <Link className="brand-wordmark text-foreground" href="/">
              evex
            </Link>
            <span className="mono-label">the eve agent registry</span>
          </span>
        </div>

        <nav className="flex items-center gap-1">
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
        </nav>
      </div>
    </footer>
  )
}
