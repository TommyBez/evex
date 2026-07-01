'use client'

import { Button } from '@evex/ui/button'
import { cn } from '@evex/ui/lib/utils'
import { Check, Copy } from 'lucide-react'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

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

export function InstallCommand({
  command,
  className,
  label = 'install command',
}: {
  command: string
  className?: string
  label?: string
}) {
  const {
    status: copyState,
    copied,
    copy: copyToClipboard,
  } = useCopyToClipboard()

  const copy = () => {
    copyToClipboard(command, { successMessage: 'Copied install command' })
  }

  const copyLabel = getCopyLabel({ copyState, label })

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
      <Button
        aria-label={copyLabel}
        className="min-h-11 min-w-11 shrink-0 text-graphite-foreground hover:bg-white/10 hover:text-graphite-foreground sm:min-h-8 sm:min-w-8"
        onClick={copy}
        size="icon"
        type="button"
        variant="ghost"
      >
        {/* Icon swap: Copy <-> Check cross-fade, matching the agent card's
            copy button. Feedback is the toast, not inline text. */}
        <span className="t-icon-swap" data-state={copied ? 'b' : 'a'}>
          <Copy aria-hidden="true" className="t-icon size-4" data-icon="a" />
          <Check
            aria-hidden="true"
            className="t-icon size-4 text-brand"
            data-icon="b"
          />
        </span>
      </Button>
    </div>
  )
}
