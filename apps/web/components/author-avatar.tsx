import { Avatar, AvatarFallback, AvatarImage } from '@evex/ui/avatar'
import { cn } from '@evex/ui/lib/utils'

// Renders an author's avatar image, falling back to their initials.
// Size and font scale are controlled via `className` (e.g. "size-5", "size-20 text-3xl").
export function AuthorAvatar({
  name,
  src,
  className,
}: {
  name: string
  src?: string | null
  className?: string
}) {
  const initials = (name || '?').slice(0, 2).toUpperCase()

  return (
    <Avatar className={cn(className)}>
      {src ? <AvatarImage alt="" src={src} /> : null}
      <AvatarFallback className="font-medium text-[0.45em] leading-none">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
