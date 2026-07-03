import { env } from '@/lib/env'

const isAuthProductionEnvironment = env.VERCEL_ENV
  ? env.VERCEL_ENV === 'production'
  : env.NODE_ENV === 'production'

// Outside production (local dev, Vercel previews) OTP delivery is bypassed:
// no email is sent and any code is accepted, so Resend credentials are not
// required locally.
export const shouldBypassAuthOtp = !isAuthProductionEnvironment
