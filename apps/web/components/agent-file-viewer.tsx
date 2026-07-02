'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@evex/ui/accordion'
import { Button } from '@evex/ui/button'
import { Skeleton } from '@evex/ui/skeleton'
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CodeEditor } from '@/components/code-editor'
import { CopyButton } from '@/components/copy-button'
import type { AgentRegistryFile } from '@/lib/agent-types'

function getLineCount(content: string): number {
  if (content.length === 0) {
    return 0
  }
  return content.split('\n').length
}

// Matches CodeEditor's read-only layout: 1.5rem line-height plus 0.5rem
// vertical padding on each side, so the placeholder reserves the exact final
// height and the panel's open animation measures correctly.
const EDITOR_LINE_HEIGHT_REM = 1.5
const EDITOR_VERTICAL_PADDING_REM = 1
// The accordion height transition runs ~200ms; hold the highlighter mount
// until after it so heavy Prism work never competes with the animation.
const PANEL_ANIMATION_MS = 250
const HIGHLIGHT_IDLE_TIMEOUT_MS = 300

/**
 * Syntax highlighting a whole file with Prism is a synchronous, potentially
 * expensive render. Mounting it while the accordion panel is height-animating
 * makes large files open with no animation, and "Expand all" mounts every
 * file in one blocking commit. Instead the panel opens onto an exact-height
 * skeleton and the highlighter mounts after the animation, during idle time —
 * so opens stay smooth and expand-all reacts instantly. Files that were
 * already highlighted once skip the skeleton on re-open.
 */
function FilePanelContent({
  file,
  lineCount,
  loadedFileIds,
}: {
  file: AgentRegistryFile
  lineCount: number
  loadedFileIds: Set<string>
}) {
  const [isReady, setIsReady] = useState(() => loadedFileIds.has(file.id))

  useEffect(() => {
    if (isReady) {
      return
    }

    let idleId: number | null = null
    const markReady = () => {
      loadedFileIds.add(file.id)
      setIsReady(true)
    }
    const timer = window.setTimeout(() => {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(markReady, {
          timeout: HIGHLIGHT_IDLE_TIMEOUT_MS,
        })
        return
      }
      markReady()
    }, PANEL_ANIMATION_MS)

    return () => {
      window.clearTimeout(timer)
      if (idleId !== null) {
        window.cancelIdleCallback(idleId)
      }
    }
  }, [file.id, isReady, loadedFileIds])

  if (!isReady) {
    return (
      <Skeleton
        className="w-full rounded-none"
        style={{
          height: `${EDITOR_VERTICAL_PADDING_REM + lineCount * EDITOR_LINE_HEIGHT_REM}rem`,
        }}
      />
    )
  }

  return (
    // content-visibility lets the browser skip layout/paint for editors that
    // are offscreen — with many files expanded, only the visible ones cost
    // anything per frame. The intrinsic size matches the editor's real height
    // so scrollbar and anchor positions stay stable.
    <div
      style={{
        containIntrinsicBlockSize: `${EDITOR_VERTICAL_PADDING_REM + lineCount * EDITOR_LINE_HEIGHT_REM}rem`,
        contentVisibility: 'auto',
      }}
    >
      <CodeEditor
        aria-label={file.path}
        className="rounded-none border-0"
        path={file.path}
        readOnly
        value={file.content}
      />
    </div>
  )
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
  const [openPathsByGroup, setOpenPathsByGroup] = useState<
    Record<string, string[]>
  >({})
  // Files whose highlighter has mounted once; re-opening them skips the
  // placeholder. A ref so membership changes don't re-render the viewer.
  const loadedFileIdsRef = useRef<Set<string>>(new Set())
  // Expand/collapse-all applies instantly: a dozen concurrent panel height
  // animations jank the whole page, so bulk toggles suppress them and only
  // individual clicks animate.
  const [suppressPanelAnimation, setSuppressPanelAnimation] = useState(false)

  useEffect(() => {
    if (!suppressPanelAnimation) {
      return
    }
    // Two frames: one for the batch-open commit to paint with animations off,
    // one of margin, then individual toggles animate again.
    let secondFrame: number | null = null
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setSuppressPanelAnimation(false)
      })
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      if (secondFrame !== null) {
        cancelAnimationFrame(secondFrame)
      }
    }
  }, [suppressPanelAnimation])

  if (files.length === 0) {
    return null
  }

  const groups = groupFiles(files)
  const openCount = groups.reduce(
    (total, group) => total + (openPathsByGroup[group.label]?.length ?? 0),
    0,
  )
  const allOpen = openCount === files.length

  const toggleAll = () => {
    setSuppressPanelAnimation(true)
    if (allOpen) {
      setOpenPathsByGroup({})
      return
    }
    const next: Record<string, string[]> = {}
    for (const group of groups) {
      next[group.label] = group.files.map((file) => file.path)
    }
    setOpenPathsByGroup(next)
  }

  return (
    <div
      className="grid gap-6"
      data-suppress-panel-animation={suppressPanelAnimation ? '' : undefined}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground text-lg">Files</h2>
          <span className="mono-label font-pixel text-muted-foreground/70 tabular-nums">
            {files.length}
          </span>
        </div>
        <Button
          className="text-muted-foreground hover:text-foreground"
          onClick={toggleAll}
          size="sm"
          type="button"
          variant="ghost"
        >
          {allOpen ? (
            <ChevronsDownUp aria-hidden="true" />
          ) : (
            <ChevronsUpDown aria-hidden="true" />
          )}
          {allOpen ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>
      {groups.map((group) => (
        <section className="min-w-0" key={group.label}>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="mono-label text-muted-foreground">{group.label}</h3>
            <span className="mono-label text-muted-foreground/70">
              {group.files.length}
            </span>
          </div>
          <Accordion
            className="w-full min-w-0"
            multiple
            onValueChange={(value) =>
              setOpenPathsByGroup((prev) => ({
                ...prev,
                [group.label]: value.map((entry) => String(entry)),
              }))
            }
            value={openPathsByGroup[group.label] ?? []}
          >
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
                      <FilePanelContent
                        file={file}
                        lineCount={lineCount}
                        loadedFileIds={loadedFileIdsRef.current}
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
