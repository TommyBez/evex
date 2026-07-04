import { Card } from '@evex/ui/card'
import { Download } from 'lucide-react'
import Link from 'next/link'
import { AgentDescription } from '@/components/agent-description'
import { AuthorAvatar } from '@/components/author-avatar'
import { FavoriteButton } from '@/components/favorite-button'
import { InstallCopyButton } from '@/components/install-copy-button'
import type { AgentWithAuthor } from '@/lib/agent-types'

export function AgentCard({
  agent,
  isAuthenticated = false,
  isFavorite = false,
}: {
  agent: AgentWithAuthor
  isAuthenticated?: boolean
  isFavorite?: boolean
}) {
  return (
    <Card className="group relative flex h-full w-full min-w-0 flex-col gap-4 rounded-md border border-border p-5 shadow-[var(--shadow-card)] ring-0 transition-[background-color,border-color,box-shadow] focus-within:border-input focus-within:bg-muted/40 focus-within:ring-2 focus-within:ring-ring/20 hover:border-input hover:bg-muted/40">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <Link
          aria-label={`Browse ${agent.category} agents`}
          className="mono-label relative z-10 text-muted-foreground transition-colors hover:text-brand"
          href={`/?category=${agent.category}`}
        >
          {agent.category}
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="mono-label flex items-center gap-1 text-muted-foreground">
            <Download aria-hidden="true" className="size-3" />
            <span className="font-pixel tabular-nums">
              {agent.installCount}
            </span>
          </span>
          <InstallCopyButton
            className="relative z-10"
            name={agent.name}
            slug={agent.slug}
          />
          <FavoriteButton
            agentId={agent.id}
            className="relative z-10"
            initialIsFavorite={isFavorite}
            isAuthenticated={isAuthenticated}
            key={`${agent.id}:${isFavorite}`}
          />
        </div>
      </div>
      <div className="flex-1">
        <h3 className="min-w-0 font-display font-semibold text-foreground text-lg">
          {/* Stretched link: the ::after overlay makes the whole card open
              the agent while keeping the agent name as the anchor text.
              The author link and buttons sit above it (z-10) so they remain
              clickable. Truncation lives on an inner span — overflow-hidden
              on the link or heading would clip the ::after overlay to the
              title box. */}
          <Link
            className="block after:absolute after:inset-0 after:rounded-md"
            href={`/agents/${agent.slug}`}
          >
            <span className="block truncate">{agent.name}</span>
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-pretty text-muted-foreground text-sm leading-relaxed">
          <AgentDescription>{agent.description}</AgentDescription>
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-border border-t pt-3 text-muted-foreground text-xs">
        {agent.authorUsername ? (
          <Link
            className="relative z-10 flex min-w-0 items-center gap-1.5 transition-colors hover:text-foreground"
            href={`/authors/${agent.authorUsername}`}
          >
            <AuthorAvatar
              className="size-5"
              name={agent.authorName}
              src={agent.authorAvatarUrl}
            />
            <span className="truncate">{agent.authorName}</span>
          </Link>
        ) : (
          <span className="flex min-w-0 items-center gap-1.5">
            <AuthorAvatar
              className="size-5"
              name={agent.authorName}
              src={agent.authorAvatarUrl}
            />
            <span className="truncate">{agent.authorName}</span>
          </span>
        )}
        <span className="mono-label text-brand opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          View →
        </span>
      </div>
    </Card>
  )
}
