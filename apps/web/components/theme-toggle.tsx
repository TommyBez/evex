'use client'

import { Button } from '@evex/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@evex/ui/dropdown-menu'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

const themeOptions = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
] as const

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const currentTheme = theme ?? 'system'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Change Theme"
            className="rounded-md"
            size="icon-sm"
            variant="ghost"
          >
            <Sun aria-hidden="true" className="size-4 dark:hidden" />
            <Moon aria-hidden="true" className="hidden size-4 dark:block" />
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
