// Client-safe helpers for package-manager-aware install commands. The
// selected manager is shared by every install affordance (install card,
// mobile install bar, agent-card copy buttons) and persisted across visits.

export const PACKAGE_MANAGERS = [
  { id: 'npm', label: 'npm', runner: 'npx' },
  { id: 'pnpm', label: 'pnpm', runner: 'pnpm dlx' },
  { id: 'yarn', label: 'yarn', runner: 'yarn dlx' },
  { id: 'bun', label: 'bun', runner: 'bunx --bun' },
] as const

export type PackageManagerId = (typeof PACKAGE_MANAGERS)[number]['id']

export const DEFAULT_PACKAGE_MANAGER: PackageManagerId = 'npm'

// Resolve an untrusted persisted value into a known manager, defaulting safely.
export function parsePackageManager(
  value: string | null | undefined,
): PackageManagerId {
  const match = PACKAGE_MANAGERS.find((manager) => manager.id === value)
  return match ? match.id : DEFAULT_PACKAGE_MANAGER
}

export function buildInstallCommandForManager(
  manager: PackageManagerId,
  slug: string,
): string {
  const match = PACKAGE_MANAGERS.find((entry) => entry.id === manager)
  const runner = match?.runner ?? 'npx'
  return `${runner} shadcn@latest add @evex/${slug}`
}
