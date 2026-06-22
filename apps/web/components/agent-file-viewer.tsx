'use client'

import { CodeEditor } from '@/components/code-editor'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { AgentRegistryFile } from '@/lib/agent-types'

export function AgentFileViewer({ files }: { files: AgentRegistryFile[] }) {
  if (files.length === 0) {
    return null
  }

  return (
    <Accordion className="w-full min-w-0">
      {files.map((file) => (
        <AccordionItem key={file.id} value={file.path}>
          <AccordionTrigger className="min-w-0 gap-4 py-3 hover:no-underline">
            <span className="min-w-0 truncate font-mono text-sm">
              {file.path}
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
  )
}
