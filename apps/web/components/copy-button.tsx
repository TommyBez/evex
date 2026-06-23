'use client'

import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const RESET_DELAY_MS = 2000

// Compact icon button that copies a string to the clipboard and confirms with a
// transient check + toast. Used in places where a full command bar would be too
// heavy (agent cards, file headers).
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
  const [copied, setCopied] = useState(false)
  const resetTimeoutRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current)
      }
    },
    [],
  )

  const handleClick = async (event: React.MouseEvent) => {
    if (stopPropagation) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(toastMessage)
    } catch {
      setCopied(false)
      toast.error('Could not copy. Please copy manually.')
      return
    }

    resetTimeoutRef.current = window.setTimeout(() => {
      setCopied(false)
      resetTimeoutRef.current = null
    }, RESET_DELAY_MS)
  }

  return (
    <Button
      aria-label={copied ? `Copied: ${label}` : label}
      className={cn('rounded-md', className)}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4 text-brand" />
      ) : (
        <Copy aria-hidden="true" className="size-4" />
      )}
    </Button>
  )
}
