import { headers } from 'next/headers'
import { EVEX_REGISTRY_NAMESPACE } from '@/lib/registry'

// Resolve the public base URL of this deployment so we can build absolute
// registry URLs for the `npx shadcn add` command.
export async function getBaseUrl(): Promise<string> {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // Fall back to the request host (covers previews and the v0 runtime).
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  if (host) {
    return `${proto}://${host}`
  }

  if (process.env.V0_RUNTIME_URL) {
    return process.env.V0_RUNTIME_URL
  }
  return 'http://localhost:3000'
}

export function buildInstallCommand(baseUrl: string, slug: string): string {
  return `npx shadcn@latest add ${baseUrl}/r/${slug}.json`
}

export function buildRegistryCatalogUrl(baseUrl: string): string {
  return `${baseUrl}/r/registry.json`
}

export function buildNamespaceSetupCommand(baseUrl: string): string {
  const registryUrl = `${baseUrl}/r/{name}.json`
  return `npx shadcn@latest registry add ${EVEX_REGISTRY_NAMESPACE}=${registryUrl}`
}

export function buildNamespacedInstallCommand(slug: string): string {
  return `npx shadcn@latest add ${EVEX_REGISTRY_NAMESPACE}/${slug}`
}
