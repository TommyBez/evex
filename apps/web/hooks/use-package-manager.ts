'use client'

import { useCallback, useSyncExternalStore } from 'react'
import {
  DEFAULT_PACKAGE_MANAGER,
  type PackageManagerId,
  parsePackageManager,
} from '@/lib/package-managers'

const STORAGE_KEY = 'evex.package-manager'
const CHANGE_EVENT = 'evex:package-manager-change'

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  // Keep other open tabs in sync too.
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

function getSnapshot(): PackageManagerId {
  try {
    return parsePackageManager(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return DEFAULT_PACKAGE_MANAGER
  }
}

function getServerSnapshot(): PackageManagerId {
  return DEFAULT_PACKAGE_MANAGER
}

/**
 * The user's preferred package manager for install commands, synced across
 * every component that renders one (and across tabs). Persisted so returning
 * visitors see commands for their toolchain immediately.
 */
export function usePackageManager() {
  const packageManager = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  const setPackageManager = useCallback((next: PackageManagerId) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage can be unavailable (private browsing); the selection simply
      // won't persist across reloads.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  return [packageManager, setPackageManager] as const
}
