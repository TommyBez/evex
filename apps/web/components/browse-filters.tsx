'use client'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@evex/ui/input-group'
import { Kbd } from '@evex/ui/kbd'
import { cn } from '@evex/ui/lib/utils'
import { NativeSelect, NativeSelectOption } from '@evex/ui/native-select'
import { ToggleGroup, ToggleGroupItem } from '@evex/ui/toggle-group'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import {
  AGENT_CATEGORIES,
  AGENT_SORTS,
  type AgentSort,
  DEFAULT_AGENT_SORT,
  getSortLabel,
  parseSort,
} from '@/lib/agents'

const DEFAULT_CATEGORY = 'all'
const SEARCH_URL_SYNC_DELAY_MS = 200
const FILTER_CATEGORIES = [DEFAULT_CATEGORY, ...AGENT_CATEGORIES] as const

function getFiltersPath(
  search: string,
  category: string,
  sort: AgentSort,
): string {
  const next = new URLSearchParams()
  if (search) {
    next.set('q', search)
  }
  if (category !== DEFAULT_CATEGORY) {
    next.set('category', category)
  }
  if (sort !== DEFAULT_AGENT_SORT) {
    next.set('sort', sort)
  }

  const query = next.toString()
  return query ? `/?${query}` : '/'
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <button
      className="mono-label inline-flex items-center gap-1.5 rounded-md border border-border bg-background py-1 pr-1.5 pl-2 text-muted-foreground transition-colors hover:border-input hover:text-foreground"
      onClick={onRemove}
      type="button"
    >
      <span className="normal-case">{label}</span>
      <X aria-hidden="true" className="size-3" />
    </button>
  )
}

export function BrowseFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<number | null>(null)

  const activeCategory = params.get('category') ?? DEFAULT_CATEGORY
  const activeSearch = params.get('q') ?? ''
  const activeSort = parseSort(params.get('sort') ?? undefined)
  const selectedCategory = activeCategory
  const selectedSort = activeSort

  // Controlled input state; the URL is synced behind a short debounce so we
  // don't push a history entry per keystroke.
  const [searchValue, setSearchValue] = useState(activeSearch)

  const replaceFilters = useCallback(
    (nextSearch: string, nextCategory: string, nextSort: AgentSort) => {
      const path = getFiltersPath(nextSearch, nextCategory, nextSort)

      startTransition(() => {
        router.replace(path, { scroll: false })
      })
    },
    [router],
  )

  const clearPendingSearchSync = useCallback(() => {
    if (searchTimeoutRef.current === null) {
      return
    }
    window.clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = null
  }, [])

  useEffect(
    () => () => {
      clearPendingSearchSync()
    },
    [clearPendingSearchSync],
  )

  // Adopt external URL changes (back/forward navigation, "clear all") unless
  // the user is actively typing in the field.
  useEffect(() => {
    if (document.activeElement === searchInputRef.current) {
      return
    }
    setSearchValue(activeSearch)
  }, [activeSearch])

  // Press "/" anywhere on the page to jump into the search field, matching
  // the muscle memory from GitHub and most doc sites.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return
      }
      event.preventDefault()
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const scheduleSearchSync = useCallback(
    (nextSearch: string) => {
      clearPendingSearchSync()
      searchTimeoutRef.current = window.setTimeout(() => {
        replaceFilters(nextSearch, selectedCategory, selectedSort)
        searchTimeoutRef.current = null
      }, SEARCH_URL_SYNC_DELAY_MS)
    },
    [clearPendingSearchSync, replaceFilters, selectedCategory, selectedSort],
  )

  const clearSearch = useCallback(() => {
    clearPendingSearchSync()
    setSearchValue('')
    replaceFilters('', selectedCategory, selectedSort)
  }, [clearPendingSearchSync, replaceFilters, selectedCategory, selectedSort])

  const changeCategory = useCallback(
    (nextCategory: string) => {
      clearPendingSearchSync()
      replaceFilters(searchValue, nextCategory, selectedSort)
    },
    [clearPendingSearchSync, searchValue, replaceFilters, selectedSort],
  )

  const changeSort = useCallback(
    (nextSort: AgentSort) => {
      clearPendingSearchSync()
      replaceFilters(searchValue, selectedCategory, nextSort)
    },
    [clearPendingSearchSync, searchValue, replaceFilters, selectedCategory],
  )

  const clearAll = useCallback(() => {
    clearPendingSearchSync()
    setSearchValue('')
    startTransition(() => {
      router.replace('/', { scroll: false })
    })
  }, [clearPendingSearchSync, router])

  const hasCategory = selectedCategory !== DEFAULT_CATEGORY
  const hasSort = selectedSort !== DEFAULT_AGENT_SORT
  const hasActiveFilters = Boolean(activeSearch) || hasCategory || hasSort

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="h-10 flex-1 rounded-md bg-background">
          <InputGroupAddon align="inline-start">
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search agents"
            onChange={(e) => {
              setSearchValue(e.target.value)
              scheduleSearchSync(e.target.value)
            }}
            placeholder="Search agents..."
            ref={searchInputRef}
            type="search"
            value={searchValue}
          />
          {searchValue ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Clear search"
                onClick={clearSearch}
                size="icon-xs"
              >
                <X aria-hidden="true" />
              </InputGroupButton>
            </InputGroupAddon>
          ) : (
            <InputGroupAddon align="inline-end" className="hidden sm:flex">
              <Kbd aria-hidden="true">/</Kbd>
            </InputGroupAddon>
          )}
        </InputGroup>
        <div className="flex items-center gap-2">
          <span className="mono-label hidden text-muted-foreground sm:inline">
            Sort
          </span>
          <NativeSelect
            aria-label="Sort agents"
            onChange={(e) => changeSort(parseSort(e.target.value))}
            value={selectedSort}
          >
            {AGENT_SORTS.map((sort) => (
              <NativeSelectOption key={sort.value} value={sort.value}>
                {sort.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      <ToggleGroup
        className={cn(
          // Mobile: a single edge-to-edge swipeable strip so the categories
          // never wrap into 3 stacked rows. sm+: wrap normally.
          'scrollbar-hide edge-fade-x -mx-4 w-full flex-nowrap overflow-x-auto px-4 transition-opacity sm:mx-0 sm:w-fit sm:flex-wrap sm:overflow-visible sm:px-0',
          isPending && 'opacity-60',
        )}
        onValueChange={(values) =>
          changeCategory(values[0] ?? DEFAULT_CATEGORY)
        }
        value={[selectedCategory]}
      >
        {FILTER_CATEGORIES.map((c) => (
          <ToggleGroupItem
            className="mono-label h-9 rounded-md capitalize data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground sm:h-8"
            key={c}
            size="sm"
            value={c}
            variant="outline"
          >
            {c}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono-label text-muted-foreground/70">Filters</span>
          {activeSearch ? (
            <FilterChip label={`“${activeSearch}”`} onRemove={clearSearch} />
          ) : null}
          {hasCategory ? (
            <FilterChip
              label={selectedCategory}
              onRemove={() => changeCategory(DEFAULT_CATEGORY)}
            />
          ) : null}
          {hasSort ? (
            <FilterChip
              label={getSortLabel(selectedSort)}
              onRemove={() => changeSort(DEFAULT_AGENT_SORT)}
            />
          ) : null}
          <button
            className="mono-label text-brand underline-offset-4 transition-colors hover:underline"
            onClick={clearAll}
            type="button"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  )
}
