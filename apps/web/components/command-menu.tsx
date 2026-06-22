'use client'

import { Command as CommandPrimitive } from 'cmdk'
import {
  ArrowUpRight,
  BookOpen,
  Heart,
  LayoutGrid,
  LogIn,
  Monitor,
  Moon,
  Package,
  Search,
  Sun,
  Trophy,
  UserRound,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'
import { GitHubIcon } from '@/components/social-icons'
import { Button } from '@/components/ui/button'
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Kbd } from '@/components/ui/kbd'
import { AGENT_CATEGORIES } from '@/lib/agents'

const REPO_URL = 'https://github.com/TommyBez/evex'
const DOCS_URL = 'https://eve.dev/docs/introduction'

export const COMMAND_MENU_EVENT = 'evex:command-menu'

// Lightweight projection of an agent — everything the palette needs to search
// and route, without the heavier runtime fields.
export interface CommandAgent {
  authorName: string
  category: string
  description: string
  name: string
  slug: string
}

// Imperatively open the palette from anywhere (header pill, mobile icon, etc.)
// without threading state through the React tree.
export function openCommandMenu() {
  window.dispatchEvent(new Event(COMMAND_MENU_EVENT))
}

export function CommandMenu({
  agents,
  isAuthenticated,
}: {
  agents: readonly CommandAgent[]
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === 'k' || event.key === 'K') &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        setOpen((previous) => !previous)
      }
    }
    const onOpenEvent = () => setOpen(true)

    document.addEventListener('keydown', onKeyDown)
    window.addEventListener(COMMAND_MENU_EVENT, onOpenEvent)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener(COMMAND_MENU_EVENT, onOpenEvent)
    }
  }, [])

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (!next) {
      setSearch('')
    }
  }, [])

  const runCommand = useCallback((action: () => void) => {
    setOpen(false)
    setSearch('')
    action()
  }, [])

  const goTo = useCallback(
    (path: string) => runCommand(() => router.push(path)),
    [router, runCommand],
  )

  const openExternal = useCallback(
    (url: string) =>
      runCommand(() => window.open(url, '_blank', 'noopener,noreferrer')),
    [runCommand],
  )

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent
        className="top-0 left-0 flex h-dvh max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-none p-0 ring-0 sm:top-[12vh] sm:left-1/2 sm:h-auto sm:max-w-xl sm:-translate-x-1/2 sm:rounded-xl sm:ring-1"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Command menu</DialogTitle>
        <DialogDescription className="sr-only">
          Search agents and jump anywhere on evex.
        </DialogDescription>
        <CommandPrimitive
          className="flex size-full flex-col overflow-hidden bg-popover pt-[env(safe-area-inset-top)] text-popover-foreground sm:pt-0"
          loop
        >
          <div className="flex items-center">
            <div className="min-w-0 flex-1">
              <CommandInput
                autoFocus
                onValueChange={setSearch}
                placeholder="Search agents, categories, and pages..."
                value={search}
              />
            </div>
            <DialogClose
              render={
                <Button
                  className="mr-2 shrink-0 sm:hidden"
                  size="sm"
                  variant="ghost"
                />
              }
            >
              Cancel
            </DialogClose>
          </div>
          <CommandList className="max-h-none min-h-0 flex-1 px-1 pb-1 sm:max-h-[60vh] sm:flex-initial">
            <CommandEmpty>No results found.</CommandEmpty>

            {agents.length > 0 ? (
              <CommandGroup heading="Agents">
                {agents.map((agent) => (
                  <CommandItem
                    key={agent.slug}
                    keywords={[
                      agent.category,
                      agent.authorName,
                      agent.description,
                    ]}
                    onSelect={() => goTo(`/agents/${agent.slug}`)}
                    value={`agent ${agent.name} ${agent.slug}`}
                  >
                    <Package aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">
                      {agent.name}
                    </span>
                    <span className="mono-label shrink-0 text-muted-foreground capitalize">
                      {agent.category}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            <CommandSeparator />

            <CommandGroup heading="Browse by category">
              {AGENT_CATEGORIES.map((category) => (
                <CommandItem
                  key={category}
                  onSelect={() => goTo(`/?category=${category}`)}
                  value={`category ${category}`}
                >
                  <LayoutGrid aria-hidden="true" />
                  <span className="capitalize">{category}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Go to">
              <CommandItem onSelect={() => goTo('/')} value="nav browse agents">
                <Search aria-hidden="true" />
                Browse agents
              </CommandItem>
              <CommandItem
                onSelect={() => goTo('/leaderboard')}
                value="nav leaderboard"
              >
                <Trophy aria-hidden="true" />
                Leaderboard
              </CommandItem>
              {isAuthenticated ? (
                <>
                  <CommandItem
                    onSelect={() => goTo('/favorites')}
                    value="nav favorites"
                  >
                    <Heart aria-hidden="true" />
                    Favorites
                  </CommandItem>
                  <CommandItem
                    onSelect={() => goTo('/profile')}
                    value="nav profile edit"
                  >
                    <UserRound aria-hidden="true" />
                    Edit profile
                  </CommandItem>
                </>
              ) : (
                <CommandItem
                  onSelect={() => goTo('/sign-in')}
                  value="nav sign in"
                >
                  <LogIn aria-hidden="true" />
                  Sign in
                </CommandItem>
              )}
              <CommandItem
                onSelect={() => openExternal(REPO_URL)}
                value="nav submit agent github repository"
              >
                <GitHubIcon className="size-4" />
                Submit an agent
                <ArrowUpRight
                  aria-hidden="true"
                  className="ml-auto text-muted-foreground"
                />
              </CommandItem>
              <CommandItem
                onSelect={() => openExternal(DOCS_URL)}
                value="nav documentation docs"
              >
                <BookOpen aria-hidden="true" />
                Documentation
                <ArrowUpRight
                  aria-hidden="true"
                  className="ml-auto text-muted-foreground"
                />
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Theme">
              <CommandItem
                onSelect={() => runCommand(() => setTheme('light'))}
                value="theme light"
              >
                <Sun aria-hidden="true" />
                Light
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => setTheme('dark'))}
                value="theme dark"
              >
                <Moon aria-hidden="true" />
                Dark
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => setTheme('system'))}
                value="theme system"
              >
                <Monitor aria-hidden="true" />
                System
              </CommandItem>
            </CommandGroup>
          </CommandList>

          <div className="hidden items-center gap-3 border-border border-t px-3 py-2 text-muted-foreground text-xs sm:flex">
            <span className="flex items-center gap-1.5">
              <Kbd>↵</Kbd>
              to select
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>esc</Kbd>
              to close
            </span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  )
}
