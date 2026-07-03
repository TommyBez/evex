import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '@/lib/env'
import {
  account,
  agentFavorite,
  agentInstallMetric,
  profile,
  session,
  user,
  verification,
} from './schema'

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

export const db = drizzle(pool, {
  schema: {
    account,
    agentFavorite,
    agentInstallMetric,
    profile,
    session,
    user,
    verification,
  },
})
