'use client'

import { cn } from '@evex/ui/lib/utils'
import { useEffect, useRef } from 'react'
import { forceReflow } from '@/components/transitions/force-reflow'

const DEFAULT_SWAP_DURATION_MS = 200

// transitions-dev "text states swap": the old label exits upward with blur,
// the new label enters from below. The displayed text is driven imperatively
// (frozen initial children + manual textContent) so React never reconciles the
// node mid-animation. See packages skill 04-text-states-swap.md.
export function TextSwap({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const initial = useRef(text).current
  const previous = useRef(text)

  useEffect(() => {
    const element = ref.current
    if (!element || previous.current === text) {
      return
    }

    // Reduced motion: CSS transitions are disabled, so swap the label
    // immediately instead of holding it for the (now invisible) exit timer.
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReducedMotion) {
      element.textContent = text
      previous.current = text
      return
    }

    const duration =
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--text-swap-dur',
        ),
      ) || DEFAULT_SWAP_DURATION_MS

    element.classList.add('is-exit')
    const timer = window.setTimeout(() => {
      element.textContent = text
      element.classList.remove('is-exit')
      element.classList.add('is-enter-start')
      forceReflow(element) // so the new label transitions back from below
      element.classList.remove('is-enter-start')
    }, duration)

    previous.current = text
    return () => window.clearTimeout(timer)
  }, [text])

  return (
    <span className={cn('t-text-swap', className)} ref={ref}>
      {initial}
    </span>
  )
}
