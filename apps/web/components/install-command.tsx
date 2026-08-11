'use client'

import { Button } from '@evex/ui/button'
import { cn } from '@evex/ui/lib/utils'
import { Check, Copy } from 'lucide-react'
import posthog from 'posthog-js'
import { TextSwap } from '@/components/transitions/text-swap'
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
  slug,
  agentAuthor,
  className,
  command,
  label = 'install command',
  viewerIsAuthor,
}: {
  slug: string
  // Registry author of the agent, and whether the signed-in viewer is that
  // author. `viewerIsAuthor` is null when authorship cannot be resolved
  // (never guessed), so authors copying their own command can be excluded
  // from the install-intent metric.
  agentAuthor: string | null
  className?: string
  command: string
  label?: string
  viewerIsAuthor: boolean | null
}) {
  const {
    status: copyState,
    copied,
    copy: copyToClipboard,
  } = useCopyToClipboard()

  const copy = async () => {
    const copied = await copyToClipboard(command, {
      successMessage: 'Copied install command',
    })
    if (copied) {
      posthog.capture('agent_install_command_copied', {
        agent_author: agentAuthor,
        agent_slug: slug,
        surface: 'install_command',
        viewer_is_author: viewerIsAuthor,
      })
    }
  }

  const copyLabel = getCopyLabel({ copyState, label })

  return (
    <div
      className={cn(
        'graphite-band w-full min-w-0 max-w-full rounded-md border border-white/10',
        className,
      )}
    >
      <div className="flex w-full min-w-0 max-w-full items-center gap-2 p-1.5 pl-4">
        <span
          aria-hidden="true"
          className="select-none font-mono text-brand text-sm"
        >
          $
        </span>
        <code className="scrollbar-hide edge-fade-x min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-1 font-mono text-graphite-foreground text-sm">
          <TextSwap text={command} />
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
    </div>
  )
}
