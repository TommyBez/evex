'use client'

import { CopyButton } from '@/components/copy-button'

export function InstallCopyButton({
  command,
  name,
  className,
}: {
  command: string
  name: string
  className?: string
}) {
  return (
    <CopyButton
      className={className}
      label={`Copy install command for ${name}`}
      stopPropagation
      toastMessage="Copied install command"
      value={command}
    />
  )
}
