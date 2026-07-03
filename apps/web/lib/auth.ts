import { betterAuth } from 'better-auth'
import { emailOTP } from 'better-auth/plugins'
import { AUTH_OTP_EXPIRES_IN_SECONDS, sendAuthOtpEmail } from '@/lib/auth-email'
import { shouldBypassAuthOtp } from '@/lib/auth-environment'
import { pool } from '@/lib/db'
import { env, isDevelopment, isVercelPreview } from '@/lib/env'
import { githubUsernameKey, readGithubUsername } from '@/lib/github'

function getOrigin(value: string | undefined): string | null {
  if (!value) {
    return null
  }
  const url = value.includes('://') ? value : `https://${value}`
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

function uniqueOrigins(values: (string | null)[]): string[] {
  const seen = new Set<string>()
  const unique: string[] = []
  for (const value of values) {
    if (!value) {
      continue
    }
    if (seen.has(value)) {
      continue
    }
    seen.add(value)
    unique.push(value)
  }
  return unique
}

function getRequiredPreviewOrigin(): string {
  const origin = getOrigin(env.VERCEL_BRANCH_URL)
  if (!origin) {
    throw new Error('VERCEL_BRANCH_URL is required when VERCEL_ENV=preview')
  }
  return origin
}

const previewOrigin = isVercelPreview ? getRequiredPreviewOrigin() : null

function getAuthBaseUrl(): string | undefined {
  if (previewOrigin) {
    return previewOrigin
  }

  if (env.BETTER_AUTH_URL) {
    return env.BETTER_AUTH_URL
  }
  if (env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`
  }
  return env.V0_RUNTIME_URL
}

function getTrustedOrigins(): string[] {
  if (previewOrigin) {
    return uniqueOrigins([previewOrigin, getOrigin(env.VERCEL_URL)])
  }

  return uniqueOrigins([
    getOrigin(env.BETTER_AUTH_URL),
    getOrigin(env.V0_RUNTIME_URL),
    getOrigin(env.VERCEL_URL),
    getOrigin(env.VERCEL_PROJECT_PRODUCTION_URL),
    ...(isDevelopment
      ? ['http://localhost:3000', 'http://127.0.0.1:3000']
      : []),
  ])
}

// GitHub OAuth is optional: env.ts guarantees the id/secret pair is either
// fully present or fully absent, so the provider is only registered when
// configured and better-auth never sees a half-configured provider.
const githubProvider =
  env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          overrideUserInfoOnSignIn: true,
          mapProfileToUser: (profile: { login?: unknown }) => {
            const githubUsername = readGithubUsername(profile.login)

            return githubUsername
              ? { githubUsername: githubUsernameKey(githubUsername) }
              : {}
          },
        },
      }
    : {}

export const auth = betterAuth({
  database: pool,
  baseURL: getAuthBaseUrl(),
  user: {
    additionalFields: {
      githubUsername: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  account: {
    accountLinking: {
      updateUserInfoOnLink: true,
    },
  },
  socialProviders: githubProvider,
  plugins: [
    emailOTP({
      allowedAttempts: shouldBypassAuthOtp ? 100 : 3,
      disableSignUp: false,
      expiresIn: AUTH_OTP_EXPIRES_IN_SECONDS,
      sendVerificationOTP: sendAuthOtpEmail,
      storeOTP: shouldBypassAuthOtp
        ? {
            hash: async () => 'development-otp',
          }
        : 'hashed',
    }),
  ],
  trustedOrigins: getTrustedOrigins(),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  ...(isDevelopment
    ? {
        advanced: {
          // In dev (v0 preview iframe), force cross-site cookies so the
          // session cookie is stored by the browser.
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})
