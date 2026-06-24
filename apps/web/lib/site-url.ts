export function buildInstallCommand(baseUrl: string, slug: string): string {
  return `npx shadcn@latest add ${baseUrl}/r/${slug}`
}
