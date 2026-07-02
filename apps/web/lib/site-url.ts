import { getSiteUrl } from '@/lib/metadata'

export function buildInstallCommand(slug: string): string {
  return `npx shadcn@latest add @evex/${slug}`
}

export function getAgentUrl(slug: string): string {
  return `${getSiteUrl()}/agents/${slug}`
}

export function getAuthorUrl(githubUsername: string): string {
  return `${getSiteUrl()}/authors/${githubUsername}`
}

export function getLearnUrl(slug: string): string {
  return `${getSiteUrl()}/learn/${slug}`
}
