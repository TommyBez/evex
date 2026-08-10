'use client'

import { CopyButton } from '@/components/copy-button'
import { usePackageManager } from '@/hooks/use-package-manager'
import { buildInstallCommandForManager } from '@/lib/package-managers'

// Copy button that respects the user's selected package manager, so the
// command copied from an agent card matches what the install card shows.
export function InstallCopyButton({
  slug,
  name,
  className,
}: {
  slug: string
  name: string
  className?: string
}) {
  const [packageManager] = usePackageManager()

  return (
    <CopyButton
      className={className}
      label={`Copy install command for ${name}`}
      stopPropagation
      toastMessage="Copied install command"
      value={buildInstallCommandForManager(packageManager, slug)}
    />
  )
}
