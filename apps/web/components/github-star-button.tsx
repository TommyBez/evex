import { Star } from 'lucide-react'
import Link from 'next/link'
import { GitHubIcon } from '@/components/github-icon'
import { Button } from '@/components/ui/button'

const REPO_OWNER = 'TommyBez'
const REPO_NAME = 'evex'
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`
const STAR_REVALIDATE_SECONDS = 3600
const THOUSAND = 1000
const TRAILING_ZERO_DECIMAL = /\.0$/

function formatStars(count: number): string {
  if (count >= THOUSAND) {
    return `${(count / THOUSAND).toFixed(1).replace(TRAILING_ZERO_DECIMAL, '')}k`
  }
  return count.toString()
}

async function getStarCount(): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
      {
        headers: { Accept: 'application/vnd.github+json' },
        next: { revalidate: STAR_REVALIDATE_SECONDS },
      },
    )

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as { stargazers_count?: number }
    return typeof data.stargazers_count === 'number'
      ? data.stargazers_count
      : null
  } catch {
    return null
  }
}

export async function GitHubStarButton({ className }: { className?: string }) {
  const stars = await getStarCount()

  return (
    <Button
      className={className}
      render={
        <Link
          aria-label="Star evex on GitHub"
          href={REPO_URL}
          rel="noreferrer noopener"
          target="_blank"
        >
          <GitHubIcon />
          <Star aria-hidden="true" className="fill-amber-400 text-amber-400" />
          <span className="hidden sm:inline">Stars</span>
          {stars === null ? null : (
            <span className="ml-1 border-border border-l pl-2 text-muted-foreground tabular-nums">
              {formatStars(stars)}
            </span>
          )}
        </Link>
      }
      size="sm"
      variant="outline"
    />
  )
}
