'use client'

import { Button } from '@evex/ui/button'
import { cn } from '@evex/ui/lib/utils'
import { Check, Copy } from 'lucide-react'
import posthog from 'posthog-js'
import { useLayoutEffect, useRef, useState } from 'react'
import { TextSwap } from '@/components/transitions/text-swap'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { usePackageManager } from '@/hooks/use-package-manager'
import {
  buildInstallCommandForManager,
  PACKAGE_MANAGERS,
} from '@/lib/package-managers'

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

interface IndicatorRect {
  height: number
  left: number
  top: number
  width: number
}

export function InstallCommand({
  slug,
  agentAuthor,
  className,
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
  label?: string
  viewerIsAuthor: boolean | null
}) {
  const [packageManager, setPackageManager] = usePackageManager()
  const command = buildInstallCommandForManager(packageManager, slug)
  const tabsRef = useRef<HTMLFieldSetElement>(null)
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null)
  const {
    status: copyState,
    copied,
    copy: copyToClipboard,
  } = useCopyToClipboard()

  // Slide a highlight pill under the active tab. Positioned before paint so
  // the initial render doesn't animate in from the corner; repositioned on
  // resize since the tabs reflow with the container.
  useLayoutEffect(() => {
    const tabs = tabsRef.current
    if (!tabs) {
      return
    }

    const update = () => {
      const active = tabs.querySelector<HTMLButtonElement>(
        `[data-pm="${packageManager}"]`,
      )
      if (!active) {
        setIndicator(null)
        return
      }
      setIndicator({
        height: active.offsetHeight,
        left: active.offsetLeft,
        top: active.offsetTop,
        width: active.offsetWidth,
      })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(tabs)
    return () => observer.disconnect()
  }, [packageManager])

  const copy = async () => {
    const copied = await copyToClipboard(command, {
      successMessage: 'Copied install command',
    })
    if (copied) {
      posthog.capture('agent_install_command_copied', {
        agent_author: agentAuthor,
        agent_slug: slug,
        package_manager: packageManager,
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
      <fieldset
        className="relative flex items-center gap-1 border-white/10 border-b px-2 py-1.5"
        ref={tabsRef}
      >
        <legend className="sr-only">Package manager</legend>
        {indicator ? (
          <span
            aria-hidden="true"
            className="absolute left-0 rounded-md bg-white/10 transition-[transform,width] duration-200 ease-out"
            style={{
              height: indicator.height,
              top: indicator.top,
              transform: `translateX(${indicator.left}px)`,
              width: indicator.width,
            }}
          />
        ) : null}
        {PACKAGE_MANAGERS.map((manager) => (
          <button
            aria-pressed={manager.id === packageManager}
            className={cn(
              'mono-label relative rounded-md px-2 py-1 normal-case transition-colors',
              manager.id === packageManager
                ? 'text-brand'
                : 'text-graphite-foreground/60 hover:bg-white/5 hover:text-graphite-foreground',
            )}
            data-pm={manager.id}
            key={manager.id}
            onClick={() => setPackageManager(manager.id)}
            type="button"
          >
            {manager.label}
          </button>
        ))}
      </fieldset>
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
