import { Button } from '@evex/ui/button'
import { Skeleton } from '@evex/ui/skeleton'
import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'
import { GitHubStarButton } from '@/components/github-star-button'
import { MobileNavMenu } from '@/components/mobile-nav-menu'
import { NavLink } from '@/components/nav-link'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'
import { getCurrentUser } from '@/lib/current-user'

export function SiteHeaderFallback() {
  return (
    <header className="sticky top-0 z-40 w-full border-border border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full min-w-0 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link className="flex items-center gap-2 text-foreground" href="/">
            <BrandMark />
            <span className="brand-wordmark">evex</span>
          </Link>
          <Link
            className="hidden font-medium text-muted-foreground text-sm md:inline-flex"
            href="/"
          >
            Browse
          </Link>
          <Link
            className="hidden font-medium text-muted-foreground text-sm md:inline-flex"
            href="/agents"
          >
            Agents
          </Link>
          <Link
            className="hidden font-medium text-muted-foreground text-sm md:inline-flex"
            href="/docs"
          >
            Docs
          </Link>
          <Link
            className="hidden font-medium text-muted-foreground text-sm md:inline-flex"
            href="/leaderboard"
          >
            Leaderboard
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-14 sm:w-20" />
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </header>
  )
}

export async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 w-full border-border border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full min-w-0 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link className="flex items-center gap-2 text-foreground" href="/">
            <BrandMark />
            <span className="brand-wordmark">evex</span>
          </Link>
          <NavLink
            activePrefixes={['/authors']}
            className="hidden md:inline-flex"
            href="/"
          >
            Browse
          </NavLink>
          <NavLink
            activePrefixes={['/agents']}
            className="hidden md:inline-flex"
            href="/agents"
          >
            Agents
          </NavLink>
          <NavLink className="hidden md:inline-flex" href="/docs">
            Docs
          </NavLink>
          <NavLink className="hidden md:inline-flex" href="/leaderboard">
            Leaderboard
          </NavLink>
          {user ? (
            <NavLink className="hidden md:inline-flex" href="/favorites">
              Favorites
            </NavLink>
          ) : null}
        </div>

        <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <GitHubStarButton />
          <ThemeToggle />
          {user ? (
            <UserMenu email={user.email} name={user.name} />
          ) : (
            <Button
              className="hidden px-3 min-[430px]:inline-flex"
              render={<Link href="/sign-in">Sign In</Link>}
              size="sm"
              variant="ghost"
            />
          )}
          <MobileNavMenu isAuthenticated={Boolean(user)} />
        </nav>
      </div>
    </header>
  )
}
