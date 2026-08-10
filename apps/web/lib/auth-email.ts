import 'server-only'

import { createHash } from 'node:crypto'
import { after } from 'next/server'
import { createElement } from 'react'
import { Resend } from 'resend'
import { AuthOtpEmail } from '@/emails/auth-otp-email'
import { shouldBypassAuthOtp } from '@/lib/auth-environment'
import { env } from '@/lib/env'

export const AUTH_OTP_EXPIRES_IN_SECONDS = 5 * 60
export const AUTH_OTP_EXPIRES_IN_MINUTES = 5

type AuthOtpType =
  | 'change-email'
  | 'email-verification'
  | 'forget-password'
  | 'sign-in'

interface SendAuthOtpEmailInput {
  email: string
  otp: string
  type: AuthOtpType
}

let resend: Resend | null = null

function getResendClient(): Resend {
  if (resend) {
    return resend
  }

  const apiKey = env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is required to send OTP emails')
  }

  resend = new Resend(apiKey)
  return resend
}

function getSender(): string {
  const from = env.RESEND_FROM_EMAIL
  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is required to send OTP emails')
  }

  return from.includes('<') ? from : `evex <${from}>`
}

function getOtpCopy(type: AuthOtpType): { purpose: string; subject: string } {
  switch (type) {
    case 'forget-password':
      return {
        purpose: 'reset your password',
        subject: 'Your evex password reset code',
      }
    case 'email-verification':
      return {
        purpose: 'verify your email address',
        subject: 'Your evex verification code',
      }
    case 'change-email':
      return {
        purpose: 'change your email address',
        subject: 'Your evex email change code',
      }
    case 'sign-in':
      return {
        purpose: 'access your evex account',
        subject: 'Your evex access code',
      }
    default:
      throw new Error('Unsupported OTP email type')
  }
}

function getIdempotencyKey(email: string, otp: string): string {
  const digest = createHash('sha256')
    .update(`${email}:${otp}`)
    .digest('hex')
    .slice(0, 32)

  return `auth-otp/${digest}`
}

function getTextBody({
  expiresInMinutes,
  otp,
  purpose,
}: {
  expiresInMinutes: number
  otp: string
  purpose: string
}): string {
  return [
    `Your evex code is ${otp}.`,
    `Use it to ${purpose}. It expires in ${expiresInMinutes} minutes.`,
    'If you did not request this code, you can ignore this email.',
  ].join('\n')
}

async function deliverAuthOtpEmail({
  email,
  otp,
  type,
}: SendAuthOtpEmailInput): Promise<void> {
  const { purpose, subject } = getOtpCopy(type)
  const { error } = await getResendClient().emails.send(
    {
      from: getSender(),
      react: createElement(AuthOtpEmail, {
        expiresInMinutes: AUTH_OTP_EXPIRES_IN_MINUTES,
        otp,
        purpose,
      }),
      subject,
      tags: [{ name: 'email_type', value: 'auth_otp' }],
      text: getTextBody({
        expiresInMinutes: AUTH_OTP_EXPIRES_IN_MINUTES,
        otp,
        purpose,
      }),
      to: email,
    },
    {
      idempotencyKey: getIdempotencyKey(email, otp),
    },
  )

  if (error) {
    throw new Error(`Failed to send OTP email: ${error.message}`)
  }
}

export function sendAuthOtpEmail(input: SendAuthOtpEmailInput): Promise<void> {
  if (shouldBypassAuthOtp) {
    return Promise.resolve()
  }

  after(() => deliverAuthOtpEmail(input))

  return Promise.resolve()
}
