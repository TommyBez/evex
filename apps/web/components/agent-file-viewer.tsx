'use client'

import { CodeEditor } from '@/components/code-editor'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { AgentRegistryFile } from '@/lib/agent-types'

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
  return order
    .map((label) => ({
      files: groups.get(label) ?? [],
      label,
    }))
    .filter((group) => group.files.length > 0)
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
            {group.files.map((file) => (
              <AccordionItem key={file.id} value={file.path}>
                <AccordionTrigger className="min-w-0 gap-4 py-3 hover:no-underline">
                  <span className="grid min-w-0 gap-0.5 text-left">
                    <span className="min-w-0 truncate font-mono text-sm">
                      {getFileBasename(file.path)}
                    </span>
                    <span className="min-w-0 truncate font-mono text-muted-foreground text-xs">
                      {file.path}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="w-full min-w-0 overflow-hidden rounded-md border border-border">
                    <div className="border-border border-b bg-muted px-4 py-2">
                      <span className="block truncate font-mono text-muted-foreground text-xs">
                        {file.path}
                      </span>
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
            ))}
          </Accordion>
        </section>
      ))}
    </div>
  )
}
