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
import { memo, useEffect, useRef, useState } from 'react'
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
 *
 * Memoized: re-rendering a mounted highlighter re-runs Prism over the whole
 * file, so with many files expanded an unrelated viewer state change (opening
 * another file, batch marks) would otherwise re-parse everything.
 */
const FilePanelContent = memo(function FilePanelContentInner({
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
})

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
  // Bulk toggles apply instantly (a dozen concurrent height animations jank
  // the whole page), so batch-toggled items are marked with a data attribute
  // that zeroes their animation duration. The mark must stay on an item for
  // as long as its panel is open: restoring the duration on an open panel can
  // restart its open animation from zero height (a visible closed→open
  // flicker), so items are only unmarked after they have closed and their
  // panel is unmounted.
  const [instantPaths, setInstantPaths] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const unmarkTimersRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    const timers = unmarkTimersRef.current
    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer)
      }
      timers.clear()
    }
  }, [])

  if (files.length === 0) {
    return null
  }

  const groups = groupFiles(files)
  const openCount = groups.reduce(
    (total, group) => total + (openPathsByGroup[group.label]?.length ?? 0),
    0,
  )
  const allOpen = openCount === files.length

  const cancelUnmark = (path: string) => {
    const timer = unmarkTimersRef.current.get(path)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      unmarkTimersRef.current.delete(path)
    }
  }

  const scheduleUnmark = (path: string) => {
    cancelUnmark(path)
    unmarkTimersRef.current.set(
      path,
      window.setTimeout(() => {
        unmarkTimersRef.current.delete(path)
        setInstantPaths((prev) => {
          if (!prev.has(path)) {
            return prev
          }
          const next = new Set(prev)
          next.delete(path)
          return next
        })
      }, PANEL_ANIMATION_MS + 100),
    )
  }

  const toggleAll = () => {
    if (allOpen) {
      // Mark everything that is about to close so the whole set collapses
      // instantly, then let the marks clear once the panels are gone.
      const closing = new Set(instantPaths)
      for (const paths of Object.values(openPathsByGroup)) {
        for (const path of paths) {
          closing.add(path)
        }
      }
      setInstantPaths(closing)
      for (const path of closing) {
        scheduleUnmark(path)
      }
      setOpenPathsByGroup({})
      return
    }

    const allPaths = new Set(instantPaths)
    const next: Record<string, string[]> = {}
    for (const group of groups) {
      next[group.label] = group.files.map((file) => file.path)
      for (const path of next[group.label]) {
        allPaths.add(path)
        cancelUnmark(path)
      }
    }
    setInstantPaths(allPaths)
    setOpenPathsByGroup(next)
  }

  const changeGroupValue = (groupLabel: string, nextValues: string[]) => {
    const previous = openPathsByGroup[groupLabel] ?? []
    for (const path of previous) {
      // A marked item closed by hand: let its mark clear after unmount so a
      // later open animates again.
      if (!nextValues.includes(path) && instantPaths.has(path)) {
        scheduleUnmark(path)
      }
    }
    for (const path of nextValues) {
      // A marked item re-opened before its mark cleared: keep the mark while
      // it is open — clearing it now would replay its open animation.
      if (!previous.includes(path)) {
        cancelUnmark(path)
      }
    }
    setOpenPathsByGroup((prev) => ({ ...prev, [groupLabel]: nextValues }))
  }

  return (
    <div className="grid gap-6">
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
              changeGroupValue(
                group.label,
                value.map((entry) => String(entry)),
              )
            }
            value={openPathsByGroup[group.label] ?? []}
          >
            {group.files.map((file) => {
              const lineCount = getLineCount(file.content)
              const basename = getFileBasename(file.path)

              return (
                <AccordionItem
                  data-instant-toggle={
                    instantPaths.has(file.path) ? '' : undefined
                  }
                  key={file.id}
                  value={file.path}
                >
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
