import { initBotId } from 'botid/client/core'
import posthog from 'posthog-js'

const posthogProjectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1'])

// Dev servers and end-to-end runs must never reach the analytics project:
// local traffic is not product usage, and mixing it in silently inflates
// every funnel and baseline we later measure against.
function isLocalTraffic(): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  return LOCAL_HOSTNAMES.has(window.location.hostname)
}

if (posthogProjectToken && posthogHost && !isLocalTraffic()) {
  posthog.init(posthogProjectToken, {
    api_host: posthogHost,
    defaults: '2026-01-30',
    capture_exceptions: true,
    debug: process.env.NODE_ENV === 'development',
  })
}

initBotId({
  protect: [
    {
      path: '/api/auth/*',
      method: 'POST',
    },
    {
      path: '/',
      method: 'POST',
    },
    {
      path: '/agents/*',
      method: 'POST',
    },
    {
      path: '/profile',
      method: 'POST',
    },
    {
      path: '/favorites',
      method: 'POST',
    },
  ],
})
