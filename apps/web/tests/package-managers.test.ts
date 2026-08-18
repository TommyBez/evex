import { describe, expect, it } from 'vitest'
import {
  buildInstallCommand,
  buildInstallCommandForManager,
} from '@/lib/package-managers'

describe('buildInstallCommand', () => {
  it('always returns the canonical npx form', () => {
    expect(buildInstallCommand('code-reviewer')).toBe(
      'npx shadcn@latest add @evex/code-reviewer',
    )
    expect(buildInstallCommand('brand-visual-asset-generator')).toBe(
      'npx shadcn@latest add @evex/brand-visual-asset-generator',
    )
  })

  it('matches the server-side helper in site-url', async () => {
    // Keep the client-safe and server-only copies in lockstep without a
    // barrel re-export (ultracite bans those).
    const { buildInstallCommand: serverBuildInstallCommand } = await import(
      '@/lib/site-url'
    )
    expect(buildInstallCommand('code-reviewer')).toBe(
      serverBuildInstallCommand('code-reviewer'),
    )
  })
})

describe('buildInstallCommandForManager', () => {
  it('matches the canonical command for npm', () => {
    expect(buildInstallCommandForManager('npm', 'openui')).toBe(
      buildInstallCommand('openui'),
    )
  })

  it('uses the selected runner for other managers', () => {
    expect(buildInstallCommandForManager('pnpm', 'openui')).toBe(
      'pnpm dlx shadcn@latest add @evex/openui',
    )
    expect(buildInstallCommandForManager('yarn', 'openui')).toBe(
      'yarn dlx shadcn@latest add @evex/openui',
    )
    expect(buildInstallCommandForManager('bun', 'openui')).toBe(
      'bunx --bun shadcn@latest add @evex/openui',
    )
  })
})
