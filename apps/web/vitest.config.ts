import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // Pure-logic tests import server modules directly; neutralize the
      // Next.js-only 'server-only' guard.
      'server-only': path.resolve(
        import.meta.dirname,
        'tests/stubs/server-only.ts',
      ),
      '@': import.meta.dirname,
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    env: {
      DATABASE_URL: 'postgres://test:test@localhost:5432/test',
    },
  },
})
