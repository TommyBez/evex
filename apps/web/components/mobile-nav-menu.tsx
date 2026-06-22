'use client'

import {
  ExternalLink,
  Heart,
  LogIn,
  Menu,
  Search,
  Trophy,
  UserRound,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

export function MobileNavMenu({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  return (
    <Drawer direction="bottom">
      <DrawerTrigger asChild>
        <Button
          aria-label="Open navigation menu"
          className="rounded-md sm:hidden"
          size="icon-sm"
          variant="ghost"
        >
          <Menu aria-hidden="true" className="size-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:hidden">
        <DrawerHeader className="text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left">
          <DrawerTitle>Menu</DrawerTitle>
        </DrawerHeader>
        <nav className="grid gap-1 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <DrawerClose asChild>
            <Link
              className="flex min-h-11 items-center gap-3 rounded-md px-3 font-medium text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              href="/"
            >
              <Search
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              Browse
            </Link>
          </DrawerClose>
          <DrawerClose asChild>
            <Link
              className="flex min-h-11 items-center gap-3 rounded-md px-3 font-medium text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              href="/leaderboard"
            >
              <Trophy
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              Leaderboard
            </Link>
          </DrawerClose>
          <DrawerClose asChild>
            <a
              className="flex min-h-11 items-center gap-3 rounded-md px-3 font-medium text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              href="https://github.com/TommyBez/evex"
              rel="noreferrer noopener"
              target="_blank"
            >
              <ExternalLink
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              GitHub Repository
            </a>
          </DrawerClose>

          <div className="my-2 h-px bg-border" />

          {isAuthenticated ? (
            <>
              <DrawerClose asChild>
                <Link
                  className="flex min-h-11 items-center gap-3 rounded-md px-3 font-medium text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  href="/favorites"
                >
                  <Heart
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  Favorites
                </Link>
              </DrawerClose>
              <DrawerClose asChild>
                <Link
                  className="flex min-h-11 items-center gap-3 rounded-md px-3 font-medium text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  href="/profile"
                >
                  <UserRound
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  Edit Profile
                </Link>
              </DrawerClose>
            </>
          ) : (
            <DrawerClose asChild>
              <Link
                className="flex min-h-11 items-center gap-3 rounded-md px-3 font-medium text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                href="/sign-in"
              >
                <LogIn
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                Sign In
              </Link>
            </DrawerClose>
          )}
        </nav>
      </DrawerContent>
    </Drawer>
  )
}
