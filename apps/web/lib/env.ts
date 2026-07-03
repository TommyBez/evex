import 'server-only'

import { z } from 'zod'

const environmentSchema = z
  .object({
    BETTER_AUTH_SECRET: z.string().min(1).optional(),
    BETTER_AUTH_URL: z.string().min(1).optional(),
    DATABASE_URL: z
      .string()
      .min(
        1,
        'DATABASE_URL is required. Copy apps/web/.env.example to apps/web/.env.local and fill it in.',
      ),
    GITHUB_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
    NEXT_PUBLIC_SITE_URL: z.string().min(1).optional(),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_FROM_EMAIL: z.string().min(1).optional(),
    V0_RUNTIME_URL: z.string().min(1).optional(),
    VERCEL_BRANCH_URL: z.string().min(1).optional(),
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().min(1).optional(),
    VERCEL_URL: z.string().min(1).optional(),
  })
  .superRefine((value, context) => {
    if (
      Boolean(value.GITHUB_CLIENT_ID) !== Boolean(value.GITHUB_CLIENT_SECRET)
    ) {
      context.addIssue({
        code: 'custom',
        message:
          'GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set together (or both left unset).',
      })
    }

    if (Boolean(value.RESEND_API_KEY) !== Boolean(value.RESEND_FROM_EMAIL)) {
      context.addIssue({
        code: 'custom',
        message:
          'RESEND_API_KEY and RESEND_FROM_EMAIL must be set together (or both left unset).',
      })
    }
  })

function loadEnvironment() {
  const parsed = environmentSchema.safeParse({
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NODE_ENV: process.env.NODE_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    V0_RUNTIME_URL: process.env.V0_RUNTIME_URL,
    VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    VERCEL_URL: process.env.VERCEL_URL,
  })

  if (!parsed.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`)
  }

  return parsed.data
}

export const env = loadEnvironment()

export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isVercelPreview = env.VERCEL_ENV === 'preview'
