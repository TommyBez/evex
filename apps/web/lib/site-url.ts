export function buildInstallCommand(slug: string): string {
  return `npx shadcn@latest add @evex/${slug}`
}
