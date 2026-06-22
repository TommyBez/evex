import { Download } from 'lucide-react'
import Link from 'next/link'
import { AuthorAvatar } from '@/components/author-avatar'
import { FavoriteButton } from '@/components/favorite-button'
import { Card } from '@/components/ui/card'
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
      {/* Overlay link makes the whole card open the agent. The author link
          and favorite button sit above it (z-10) so they remain clickable. */}
      <Link
        aria-label={`View ${agent.name}`}
        className="absolute inset-0 rounded-md"
        href={`/agents/${agent.slug}`}
      />
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="mono-label text-muted-foreground">
          {agent.category}
        </span>
        <div className="flex items-center gap-2">
          <span className="mono-label flex items-center gap-1 text-muted-foreground">
            <Download aria-hidden="true" className="size-3" />
            <span className="tabular-nums">{agent.installCount}</span>
          </span>
          <FavoriteButton
            agentId={agent.id}
            className="relative z-10"
            initialIsFavorite={isFavorite}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
      <div className="flex-1">
        <h3 className="truncate font-display font-semibold text-foreground text-lg">
          {agent.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-pretty text-muted-foreground text-sm leading-relaxed">
          {agent.description}
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
