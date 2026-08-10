import { initBotId } from 'botid/client/core'
import posthog from 'posthog-js'

const posthogProjectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

if (posthogProjectToken && posthogHost) {
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
