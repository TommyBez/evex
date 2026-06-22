import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

// Install counts remain dynamic, but the canonical agent metadata and files
// live in source under packages/agent-registry/agents/*.
export const agentInstallMetric = pgTable('agent_install_metric', {
  slug: text('slug').primaryKey(),
  installCount: integer('installCount').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// A saved agent for a user. The composite primary key prevents duplicate
// favorites and keeps the toggle operation idempotent.
export const agentFavorite = pgTable(
  'agent_favorite',
  {
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    agentSlug: text('agentSlug').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.agentSlug] })],
)

// A user's public profile: bio, avatar image, and social links.
// One row per user, scoped by userId (no RLS on Neon).
export const profile = pgTable('profile', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  bio: text('bio').notNull().default(''),
  avatarUrl: text('avatarUrl'),
  websiteUrl: text('websiteUrl'),
  githubUrl: text('githubUrl'),
  twitterUrl: text('twitterUrl'),
  linkedinUrl: text('linkedinUrl'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export type AgentFavorite = typeof agentFavorite.$inferSelect
export type AgentInstallMetric = typeof agentInstallMetric.$inferSelect
export type Profile = typeof profile.$inferSelect
