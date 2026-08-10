'use client'

import { Button } from '@evex/ui/button'
import { cn } from '@evex/ui/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@evex/ui/tooltip'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { toggleFavorite } from '@/app/actions/favorites'

export function FavoriteButton({
  agentId,
  className,
  initialIsFavorite,
  isAuthenticated,
  showLabel = false,
}: {
  agentId: string
  className?: string
  initialIsFavorite: boolean
  isAuthenticated: boolean
  showLabel?: boolean
}) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(() => initialIsFavorite)
  const [isPending, startTransition] = useTransition()

  const label = isFavorite ? 'Remove from favorites' : 'Save to favorites'

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.info('Sign in to save favorites.')
      const currentUrl = new URL(window.location.href)
      const target = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
      router.push(`/sign-in?redirect=${encodeURIComponent(target)}`)
      return
    }

    const nextIsFavorite = !isFavorite
    const previousIsFavorite = isFavorite
    setIsFavorite(nextIsFavorite)

    startTransition(async () => {
      try {
        const result = await toggleFavorite(agentId, nextIsFavorite)
        if (!result.ok) {
          setIsFavorite(previousIsFavorite)
          toast.error(result.error)
          return
        }

        setIsFavorite(result.isFavorite)
        posthog.capture('favorite_updated', {
          agent_id: agentId,
          is_favorite: result.isFavorite,
        })
        toast.success(
          result.isFavorite ? 'Saved to favorites' : 'Removed from favorites',
        )
        router.refresh()
      } catch {
        setIsFavorite(previousIsFavorite)
        toast.error('Could not update favorites. Please try again.')
      }
    })
  }

  const button = (
    <Button
      aria-label={label}
      aria-pressed={isFavorite}
      className={cn(
        'rounded-md',
        isFavorite && 'text-brand hover:text-brand',
        className,
      )}
      disabled={isPending}
      onClick={handleClick}
      size={showLabel ? 'sm' : 'icon-sm'}
      type="button"
      variant={isFavorite ? 'secondary' : 'outline'}
    >
      <Heart
        aria-hidden="true"
        className={cn('size-4', isFavorite && 'fill-current')}
      />
      {showLabel ? <span>{isFavorite ? 'Saved' : 'Save'}</span> : null}
    </Button>
  )

  if (showLabel) {
    return button
  }

  // Icon-only mode gets a tooltip so the action is discoverable on hover.
  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
