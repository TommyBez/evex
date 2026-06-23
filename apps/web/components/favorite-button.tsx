'use client'

import { Heart } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { toggleFavorite } from '@/app/actions/favorites'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setIsFavorite(initialIsFavorite)
  }, [initialIsFavorite])

  const label = isFavorite ? 'Remove from favorites' : 'Save to favorites'

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.info('Sign in to save favorites.')
      const query = searchParams.toString()
      const target = query ? `${pathname}?${query}` : pathname
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

  return (
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
}
