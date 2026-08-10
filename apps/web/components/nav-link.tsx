'use client'

import { cn } from '@evex/ui/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Header nav link that knows when its section is active, so the user always
 * sees where they are. `activePrefixes` marks nested routes (e.g. /agents/*)
 * as belonging to a section whose href is different (e.g. /).
 */
export function NavLink({
  href,
  activePrefixes = [],
  className,
  children,
}: {
  href: string
  activePrefixes?: readonly string[]
  className?: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isActive =
    pathname === href ||
    activePrefixes.some((prefix) => pathname.startsWith(prefix))

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'font-medium text-sm transition-colors',
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  )
}
