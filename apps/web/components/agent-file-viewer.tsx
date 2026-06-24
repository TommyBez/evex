'use client'

import { CodeEditor } from '@/components/code-editor'
import { CopyButton } from '@/components/copy-button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { AgentRegistryFile } from '@/lib/agent-types'

function getLineCount(content: string): number {
  if (content.length === 0) {
    return 0
  }
  return content.split('\n').length
}

interface FileGroup {
  files: AgentRegistryFile[]
  label: string
}

function getFileGroupLabel(path: string): string {
  if (path.startsWith('agent/subagents/')) {
    return 'Subagents'
  }
  if (path.includes('/skills/')) {
    return 'Skills'
  }
  if (path.includes('/tools/')) {
    return 'Tools'
  }
  return 'Core'
}

function getFileBasename(path: string): string {
  return path.split('/').at(-1) ?? path
}

function groupFiles(files: readonly AgentRegistryFile[]): FileGroup[] {
  const groups = new Map<string, AgentRegistryFile[]>()

  for (const file of files) {
    const label = getFileGroupLabel(file.path)
    const group = groups.get(label)
    if (group) {
      group.push(file)
    } else {
      groups.set(label, [file])
    }
  }

  const order = ['Core', 'Skills', 'Subagents', 'Tools'] as const
  return order.flatMap((label) => {
    const groupFiles = groups.get(label)
    return groupFiles ? [{ files: groupFiles, label }] : []
  })
}

export function AgentFileViewer({ files }: { files: AgentRegistryFile[] }) {
  if (files.length === 0) {
    return null
  }

  const groups = groupFiles(files)

  return (
    <div className="grid gap-6">
      {groups.map((group) => (
        <section className="min-w-0" key={group.label}>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="mono-label text-muted-foreground">{group.label}</h3>
            <span className="mono-label text-muted-foreground/70">
              {group.files.length}
            </span>
          </div>
          <Accordion className="w-full min-w-0">
            {group.files.map((file) => {
              const lineCount = getLineCount(file.content)
              const basename = getFileBasename(file.path)

              return (
                <AccordionItem key={file.id} value={file.path}>
                  <AccordionTrigger className="min-w-0 gap-3 py-3 hover:no-underline">
                    <span className="grid min-w-0 flex-1 gap-0.5 text-left">
                      <span className="min-w-0 truncate font-mono text-sm">
                        {basename}
                      </span>
                      <span className="min-w-0 truncate font-mono text-muted-foreground text-xs">
                        {file.path}
                      </span>
                    </span>
                    {lineCount > 0 ? (
                      <span className="mono-label shrink-0 whitespace-nowrap pt-0.5 text-muted-foreground/70 tabular-nums">
                        {lineCount} {lineCount === 1 ? 'line' : 'lines'}
                      </span>
                    ) : null}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="w-full min-w-0 overflow-hidden rounded-md border border-border">
                      <div className="flex items-center gap-2 border-border border-b bg-muted px-3 py-1.5">
                        <span className="block min-w-0 flex-1 truncate font-mono text-muted-foreground text-xs">
                          {file.path}
                        </span>
                        <CopyButton
                          label={`Copy ${basename}`}
                          size="icon-xs"
                          toastMessage="Copied file contents"
                          value={file.content}
                        />
                      </div>
                      <CodeEditor
                        aria-label={file.path}
                        className="rounded-none border-0"
                        path={file.path}
                        readOnly
                        value={file.content}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </section>
      ))}
    </div>
  )
}
