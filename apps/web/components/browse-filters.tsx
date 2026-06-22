'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { AGENT_CATEGORIES } from '@/lib/agents'
import { cn } from '@/lib/utils'

export function BrowseFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeCategory = params.get('category') ?? 'all'
  const activeSearch = params.get('q') ?? ''

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value && value !== 'all') {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    startTransition(() => {
      router.replace(`/?${next.toString()}`, { scroll: false })
    })
  }

  const categories = ['all', ...AGENT_CATEGORIES] as const

  return (
    <div className="flex flex-col gap-4">
      <InputGroup className="h-10 rounded-md bg-background">
        <InputGroupAddon align="inline-start">
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search agents"
          onChange={(e) => setParam('q', e.target.value)}
          placeholder="Search agents..."
          type="search"
          value={activeSearch}
        />
      </InputGroup>
      <ToggleGroup
        className={cn(
          'flex-wrap transition-opacity',
          isPending && 'opacity-60',
        )}
        onValueChange={(values) => setParam('category', values[0] ?? 'all')}
        value={[activeCategory]}
      >
        {categories.map((c) => (
          <ToggleGroupItem
            className="mono-label rounded-md capitalize data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            key={c}
            size="sm"
            value={c}
            variant="outline"
          >
            {c}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
