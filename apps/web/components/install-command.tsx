'use client'

import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function getCopyLabel({
  copyState,
  label,
}: {
  copyState: 'copied' | 'failed' | 'idle'
  label: string
}): string {
  if (copyState === 'copied') {
    return `Copied ${label}`
  }
  if (copyState === 'failed') {
    return `Copy failed for ${label}`
  }
  return `Copy ${label}`
}

function getCopyStatusText({
  copyLabel,
  copyState,
}: {
  copyLabel: string
  copyState: 'copied' | 'failed' | 'idle'
}): string {
  if (copyState === 'copied') {
    return 'Copied'
  }
  if (copyState === 'failed') {
    return 'Failed'
  }
  return copyLabel
}

export function InstallCommand({
  command,
  className,
  label = 'install command',
}: {
  command: string
  className?: string
  label?: string
}) {
  const [copyState, setCopyState] = useState<'copied' | 'failed' | 'idle'>(
    'idle',
  )
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
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    resetTimeoutRef.current = window.setTimeout(() => {
      setCopyState('idle')
      resetTimeoutRef.current = null
    }, 2000)
  }

  const copied = copyState === 'copied'
  const copyLabel = getCopyLabel({ copyState, label })
  const copyStatusText = getCopyStatusText({ copyLabel, copyState })

  return (
    <div
      className={cn(
        'graphite-band flex w-full min-w-0 max-w-full items-center gap-2 rounded-md border border-white/10 p-1.5 pl-4',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="select-none font-mono text-brand text-sm"
      >
        $
      </span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-words font-mono text-graphite-foreground text-sm sm:whitespace-nowrap">
        {command}
      </code>
      <span
        aria-live="polite"
        className={cn(
          'mono-label shrink-0 text-graphite-foreground/60',
          copyState === 'idle' && 'sr-only',
          copied && 'text-brand',
        )}
      >
        {copyStatusText}
      </span>
      <Button
        aria-label={copyLabel}
        className="min-h-11 min-w-11 shrink-0 text-graphite-foreground hover:bg-white/10 hover:text-graphite-foreground sm:min-h-8 sm:min-w-8"
        onClick={copy}
        size="icon"
        type="button"
        variant="ghost"
      >
        {copied ? (
          <Check aria-hidden="true" className="size-4 text-brand" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
      </Button>
    </div>
  )
}
