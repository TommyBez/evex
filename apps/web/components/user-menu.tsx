'use client'

import { Button } from '@evex/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@evex/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthorAvatar } from '@/components/author-avatar'
import { authClient } from '@/lib/auth-client'

export function UserMenu({ name, email }: { name: string; email: string }) {
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Account menu"
            className="size-9 rounded-full p-0"
            size="icon"
            variant="outline"
          >
            <AuthorAvatar className="size-9" name={name || email} />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate font-medium text-sm">{name}</span>
            <span className="truncate font-normal text-muted-foreground text-xs">
              {email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/favorites">Favorites</Link>} />
        <DropdownMenuItem render={<Link href="/profile">Edit Profile</Link>} />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
