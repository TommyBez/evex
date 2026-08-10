import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@evex/ui/empty'
import { cn } from '@evex/ui/lib/utils'
import type { LucideIcon } from 'lucide-react'

export function RegistryEmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <Empty className={cn('border border-border py-20', className)}>
      <EmptyHeader>
        <EmptyMedia
          className="mb-0 size-12 rounded-full [&_svg]:size-6"
          variant="icon"
        >
          <Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="font-medium text-lg">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {children ? <EmptyContent>{children}</EmptyContent> : null}
    </Empty>
  )
}

export function RegistryEmptyMessage({
  message,
  className,
}: {
  message: string
  className?: string
}) {
  return (
    <Empty className={cn('border border-border py-12', className)}>
      <EmptyDescription>{message}</EmptyDescription>
    </Empty>
  )
}
