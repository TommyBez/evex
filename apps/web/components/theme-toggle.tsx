'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const themeOptions = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
] as const

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme()

  const ActiveIcon = resolvedTheme === 'dark' ? Moon : Sun
  const currentTheme = theme ?? 'system'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Change Theme"
            className="rounded-md"
            size="icon-sm"
            suppressHydrationWarning
            variant="ghost"
          >
            <ActiveIcon aria-hidden="true" className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuRadioGroup onValueChange={setTheme} value={currentTheme}>
          {themeOptions.map(({ value, label, Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
