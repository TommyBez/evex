'use client'

import { cn } from '@evex/ui/lib/utils'
import { Textarea } from '@evex/ui/textarea'
import { useTheme } from 'next-themes'
import {
  type CSSProperties,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import {
  languageFromPath,
  SyntaxHighlighter,
  syntaxHighlighterThemes,
} from '@/lib/syntax-highlighter'

interface CodeEditorProps {
  'aria-label'?: string
  className?: string
  minHeight?: string
  onChange?: (value: string) => void
  path?: string
  placeholder?: string
  readOnly?: boolean
  value: string
}

const codeFontStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.875rem',
  lineHeight: '1.5rem',
}

const lineNumberGutterWidth = '4rem'

const unsubscribeFromClientHydration = () => undefined
const subscribeToClientHydration = () => unsubscribeFromClientHydration
const getClientHydrationSnapshot = () => true
const getServerHydrationSnapshot = () => false

const lineNumberStyle: CSSProperties = {
  boxSizing: 'border-box',
  minWidth: lineNumberGutterWidth,
  width: lineNumberGutterWidth,
  paddingLeft: '0.75rem',
  paddingRight: '0.75rem',
  color: 'var(--muted-foreground)',
  opacity: 1,
}

export function CodeEditor({
  value,
  onChange,
  path = '',
  readOnly = false,
  placeholder,
  minHeight,
  className,
  'aria-label': ariaLabel,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme()
  const [scrollPosition, setScrollPosition] = useState({ left: 0, top: 0 })
  const hasMounted = useSyncExternalStore(
    subscribeToClientHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  )
  const isDark = hasMounted && resolvedTheme === 'dark'

  const language = useMemo(() => languageFromPath(path), [path])
  const theme = isDark
    ? syntaxHighlighterThemes.dark
    : syntaxHighlighterThemes.light
  const highlightedValue = value.length > 0 ? value : ' '
  const editorMinHeight = minHeight ?? '12rem'

  const highlighterStyle: CSSProperties = {
    ...codeFontStyle,
    margin: 0,
    minHeight: readOnly ? undefined : editorMinHeight,
    padding: '0.5rem 0',
    background: 'transparent',
    overflow: readOnly ? 'auto' : 'visible',
    color: 'var(--foreground)',
    textShadow: 'none',
    transform: readOnly
      ? undefined
      : `translate(${-scrollPosition.left}px, ${-scrollPosition.top}px)`,
  }

  return (
    <div
      className={cn(
        'w-full min-w-0 max-w-full overflow-hidden rounded-md border border-input bg-transparent text-sm transition-colors',
        !readOnly &&
          'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30',
        readOnly && 'bg-muted/40',
        className,
      )}
      suppressHydrationWarning
    >
      {readOnly ? (
        <SyntaxHighlighter
          aria-label={ariaLabel}
          codeTagProps={{ style: codeFontStyle }}
          customStyle={highlighterStyle}
          language={language}
          lineNumberStyle={lineNumberStyle}
          showLineNumbers
          style={theme}
          tabIndex={0}
        >
          {highlightedValue}
        </SyntaxHighlighter>
      ) : (
        <div
          className="relative min-w-0 max-w-full overflow-hidden"
          style={{ minHeight: editorMinHeight }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <SyntaxHighlighter
              codeTagProps={{ style: codeFontStyle }}
              customStyle={highlighterStyle}
              language={language}
              lineNumberStyle={lineNumberStyle}
              showLineNumbers
              style={theme}
            >
              {highlightedValue}
            </SyntaxHighlighter>
          </div>
          <Textarea
            aria-label={ariaLabel}
            className="relative block min-h-0 w-full min-w-0 max-w-full resize-y overflow-auto rounded-none border-0 bg-transparent py-2 pr-3 pl-0 font-mono text-sm text-transparent leading-6 caret-primary shadow-none outline-none [field-sizing:fixed] selection:bg-ring/25 focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
            onChange={(event) => onChange?.(event.target.value)}
            onScroll={(event) => {
              setScrollPosition({
                left: event.currentTarget.scrollLeft,
                top: event.currentTarget.scrollTop,
              })
            }}
            placeholder={placeholder}
            spellCheck={false}
            style={{
              minHeight: editorMinHeight,
              paddingLeft: lineNumberGutterWidth,
            }}
            value={value}
            wrap="off"
          />
        </div>
      )}
    </div>
  )
}
