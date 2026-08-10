'use client'

import { Button } from '@evex/ui/button'
import { cn } from '@evex/ui/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@evex/ui/tooltip'
import { Check, Copy } from 'lucide-react'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

// Compact icon button that copies a string to the clipboard and confirms with a
// transient check + toast. Used in places where a full command bar would be too
// heavy (agent cards, file headers). A tooltip names the action since the
// button is icon-only.
export function CopyButton({
  value,
  label,
  toastMessage = 'Copied to clipboard',
  className,
  size = 'icon-sm',
  variant = 'ghost',
  stopPropagation = false,
}: {
  value: string
  label: string
  toastMessage?: string
  className?: string
  size?: 'icon-xs' | 'icon-sm'
  variant?: 'ghost' | 'outline'
  stopPropagation?: boolean
}) {
  const { copied, copy } = useCopyToClipboard()

  const handleClick = (event: React.MouseEvent) => {
    if (stopPropagation) {
      event.preventDefault()
      event.stopPropagation()
    }

    copy(value, { successMessage: toastMessage })
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={copied ? `Copied: ${label}` : label}
            className={cn('rounded-md', className)}
            onClick={handleClick}
            size={size}
            type="button"
            variant={variant}
          >
            {/* Icon swap: both icons stay stacked in one grid cell and cross-fade
                with blur + scale as data-state flips. See transitions-dev skill. */}
            <span className="t-icon-swap" data-state={copied ? 'b' : 'a'}>
              <Copy
                aria-hidden="true"
                className="t-icon size-4"
                data-icon="a"
              />
              <Check
                aria-hidden="true"
                className="t-icon size-4 text-brand"
                data-icon="b"
              />
            </span>
          </Button>
        }
      />
      <TooltipContent>{copied ? 'Copied!' : label}</TooltipContent>
    </Tooltip>
  )
}
