'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export type CopyStatus = 'idle' | 'copied' | 'failed'

const DEFAULT_RESET_MS = 2000
const DEFAULT_ERROR_MESSAGE = 'Could not copy. Please copy manually.'

/**
 * Copy-to-clipboard state machine shared by every copy affordance (install
 * command bar, agent-card copy button, sticky mobile install bar). Owns the
 * transient `copied`/`failed` status, resets it after both success and failure
 * so the UI never gets stuck, and clears its pending timeout on unmount.
 */
export function useCopyToClipboard({
  resetMs = DEFAULT_RESET_MS,
}: {
  resetMs?: number
} = {}) {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const resetTimeoutRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current)
      }
    },
    [],
  )

  const copy = async (
    text: string,
    options?: { successMessage?: string; errorMessage?: string },
  ): Promise<boolean> => {
    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current)
    }

    let didCopy = false
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
      didCopy = true
      if (options?.successMessage) {
        toast.success(options.successMessage)
      }
    } catch {
      setStatus('failed')
      toast.error(options?.errorMessage ?? DEFAULT_ERROR_MESSAGE)
    }

    resetTimeoutRef.current = window.setTimeout(() => {
      setStatus('idle')
      resetTimeoutRef.current = null
    }, resetMs)

    return didCopy
  }

  return { status, copied: status === 'copied', copy }
}
