import { GitPullRequest, Terminal } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'Contribute an Agent',
  description: 'Add an eve agent to evex-new by opening a pull request.',
  path: '/publish',
})

const steps = [
  'Create a new app under apps/agents/<slug>.',
  'Add registry.json with metadata, static author info, files, and targets.',
  'Keep the Eve source inside that app, including agent/ and optional evals/.',
  'Run pnpm check and pnpm build before opening the PR.',
] as const

export default function ContributeAgentPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-10">
      <header className="flex flex-col gap-3">
        <span className="mono-label inline-flex items-center gap-2 text-muted-foreground">
          <GitPullRequest aria-hidden="true" className="size-4 text-brand" />
          pull request only
        </span>
        <h1 className="text-balance font-semibold text-3xl text-foreground">
          Contribute an Agent
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground leading-relaxed">
          evex-new agents live in source control. Additions and changes go
          through a pull request so reviewers can inspect the Eve app,
          dependencies, files, and registry metadata together.
        </p>
      </header>

      <section className="mt-8 grid gap-4">
        {steps.map((step, index) => (
          <Card
            className="flex items-start gap-4 rounded-md border border-border p-5 shadow-[var(--shadow-card)] ring-0"
            key={step}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground text-sm tabular-nums">
              {index + 1}
            </span>
            <p className="text-muted-foreground leading-relaxed">{step}</p>
          </Card>
        ))}
      </section>

      <Card className="mt-6 rounded-md border border-border p-5 shadow-[var(--shadow-card)] ring-0">
        <div className="flex items-center gap-2">
          <Terminal aria-hidden="true" className="size-4 text-brand" />
          <h2 className="font-medium text-foreground text-sm">Validation</h2>
        </div>
        <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-4 font-mono text-muted-foreground text-xs">
          <code>{'pnpm check\npnpm build'}</code>
        </pre>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          render={
            <a
              href="https://github.com/TommyBez/evex-new"
              rel="noreferrer noopener"
              target="_blank"
            >
              <GitPullRequest aria-hidden="true" className="size-4" />
              Open Repository
            </a>
          }
        />
        <Button
          render={<Link href="/">Browse Agents</Link>}
          variant="outline"
        />
      </div>
    </main>
  )
}
