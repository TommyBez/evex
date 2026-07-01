'use client'

import { Button } from '@evex/ui/button'
import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const COPY_RESET_MS = 2000

/**
 * Thumb-reachable install action pinned to the bottom of the viewport on
 * mobile only. The agent's primary conversion action (copy the install
 * command) is always one tap away without scrolling back up to the install
 * card. Hidden on sm+ where the install card is already in easy reach.
 */
export function MobileInstallBar({
  command,
  label = 'install command',
}: {
  command: string
  label?: string
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

  const copy = async () => {
    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current)
    }

    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      toast.success('Copied install command')
      resetTimeoutRef.current = window.setTimeout(() => {
        setCopied(false)
        resetTimeoutRef.current = null
      }, COPY_RESET_MS)
    } catch {
      toast.error('Could not copy. Please copy manually.')
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-border border-t bg-background/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-md sm:hidden">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3">
        <code className="min-w-0 flex-1 truncate font-mono text-muted-foreground text-xs">
          {command}
        </code>
        <Button
          aria-label={copied ? `Copied ${label}` : `Copy ${label}`}
          className="h-11 shrink-0 px-5"
          onClick={copy}
          type="button"
        >
          <span className="t-icon-swap" data-state={copied ? 'b' : 'a'}>
            <Copy aria-hidden="true" className="t-icon size-4" data-icon="a" />
            <Check aria-hidden="true" className="t-icon size-4" data-icon="b" />
          </span>
          {copied ? 'Copied' : 'Install'}
        </Button>
      </div>
    </div>
  )
}
