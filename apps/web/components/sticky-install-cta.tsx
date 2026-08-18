'use client'

import { Button } from '@evex/ui/button'
import { cn } from '@evex/ui/lib/utils'
import { Check, Copy } from 'lucide-react'
import posthog from 'posthog-js'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { buildInstallCommand } from '@/lib/package-managers'

/**
 * Above-the-fold install affordance under the agent title. Sticky on sm+ only —
 * on small viewports it stays in document flow so MobileInstallBar remains the
 * sole sticky install control. Always shows the canonical
 * `npx shadcn@latest add @evex/<slug>` form; package-manager tabs live on the
 * secondary install card below, not here.
 */
export function StickyInstallCta({
  slug,
  agentAuthor,
  viewerIsAuthor,
  className,
}: {
  slug: string
  agentAuthor: string | null
  viewerIsAuthor: boolean | null
  className?: string
}) {
  const command = buildInstallCommand(slug)
  const { copied, copy } = useCopyToClipboard()

  const handleCopy = async () => {
    const didCopy = await copy(command, {
      successMessage: 'Copied install command',
    })
    if (didCopy) {
      posthog.capture('agent_install_command_copied', {
        agent_author: agentAuthor,
        agent_slug: slug,
        package_manager: 'npm',
        surface: 'sticky_install_cta',
        viewer_is_author: viewerIsAuthor,
      })
    }
  }

  return (
    <aside
      aria-label="Install"
      className={cn(
        // In-flow card on mobile; sticky under the site header from sm up.
        'rounded-md border border-border bg-background px-4 py-3 shadow-[var(--shadow-card)] sm:sticky sm:top-14 sm:z-30 sm:bg-background/95 sm:px-5 sm:py-4 sm:backdrop-blur-md',
        className,
      )}
    >
      <p className="mono-label text-muted-foreground">Install</p>
      <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <code className="scrollbar-hide edge-fade-x min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-md border border-border bg-muted px-3 py-2.5 font-mono text-foreground text-sm">
          {command}
        </code>
        <Button
          aria-label={copied ? 'Copied command' : 'Copy command'}
          className="h-11 w-full shrink-0 sm:h-10 sm:w-auto sm:px-4"
          onClick={handleCopy}
          type="button"
        >
          <span className="t-icon-swap" data-state={copied ? 'b' : 'a'}>
            <Copy aria-hidden="true" className="t-icon size-4" data-icon="a" />
            <Check aria-hidden="true" className="t-icon size-4" data-icon="b" />
          </span>
          {copied ? 'Copied' : 'Copy command'}
        </Button>
      </div>
      <p className="mt-2 text-muted-foreground text-sm">
        Inspect the files below before you run it.
      </p>
    </aside>
  )
}
