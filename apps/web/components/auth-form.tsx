'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { BrandMark } from '@/components/brand-mark'
import { GitHubIcon } from '@/components/social-icons'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { authClient } from '@/lib/auth-client'

const OTP_LENGTH = 6
const OTP_SLOT_IDS = [
  'otp-slot-1',
  'otp-slot-2',
  'otp-slot-3',
  'otp-slot-4',
  'otp-slot-5',
  'otp-slot-6',
] as const

function getSubmitLabel({
  isOtpSent,
  isSignUp,
  loading,
}: {
  isOtpSent: boolean
  isSignUp: boolean
  loading: boolean
}): string {
  if (loading) {
    if (!isOtpSent) {
      return 'Sending code...'
    }
    return isSignUp ? 'Creating account...' : 'Checking code...'
  }
  if (isSignUp) {
    return isOtpSent ? 'Create Account' : 'Send Code'
  }
  return isOtpSent ? 'Sign In' : 'Send Code'
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Something went wrong'
}

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleGitHub = async (): Promise<void> => {
    setError(null)
    setGithubLoading(true)
    try {
      const { error } = await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/',
      })
      if (error) {
        setError(error.message ?? 'Something went wrong')
        setGithubLoading(false)
      }
    } catch (error) {
      setError(getErrorMessage(error))
      setGithubLoading(false)
    }
  }

  const requestOtp = async (): Promise<boolean> => {
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      })

      if (error) {
        setError(error.message ?? 'Something went wrong')
        return false
      }

      setIsOtpSent(true)
      setOtp('')
      return true
    } catch (error) {
      setError(getErrorMessage(error))
      return false
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const displayName = name.trim()
      if (isSignUp && !displayName) {
        setError('Enter your name')
        return
      }

      if (!isOtpSent) {
        await requestOtp()
        return
      }

      if (otp.length !== OTP_LENGTH) {
        setError(`Enter the ${OTP_LENGTH}-digit code from your email`)
        return
      }

      const { error } = await authClient.signIn.emailOtp({
        email,
        otp,
        ...(isSignUp ? { name: displayName } : {}),
      })

      if (error) {
        setError(error.message ?? 'Something went wrong')
        return
      }

      router.push('/')
      router.refresh()
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link
          className="mb-6 flex items-center justify-center gap-2 text-foreground"
          href="/"
        >
          <BrandMark className="size-8" />
          <span className="font-semibold text-lg">evex</span>
        </Link>
        <Card className="w-full rounded-md border border-border shadow-[var(--shadow-card)] ring-0">
          <CardHeader>
            <h1 className="font-semibold text-2xl">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <CardDescription>
              {isSignUp
                ? 'Create your account with a one-time email code'
                : 'Sign in with a one-time email code'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            <Button
              className="w-full"
              disabled={githubLoading || loading}
              onClick={handleGitHub}
              type="button"
              variant="outline"
            >
              <GitHubIcon className="size-4" />
              {githubLoading ? 'Redirecting...' : 'Continue with GitHub'}
            </Button>

            <FieldSeparator className="my-6">
              or continue with email
            </FieldSeparator>

            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {isSignUp && (
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      autoComplete="name"
                      disabled={loading || isOtpSent}
                      id="name"
                      onChange={(e) => setName(e.target.value)}
                      required
                      value={name}
                    />
                  </Field>
                )}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    autoComplete="email"
                    disabled={loading || isOtpSent}
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                    value={email}
                  />
                </Field>
                {isOtpSent ? (
                  <Field>
                    <FieldLabel htmlFor="otp">Code</FieldLabel>
                    <InputOTP
                      containerClassName="justify-center"
                      id="otp"
                      maxLength={OTP_LENGTH}
                      onChange={setOtp}
                      value={otp}
                    >
                      <InputOTPGroup>
                        {OTP_SLOT_IDS.map((slotId, index) => (
                          <InputOTPSlot
                            className="size-10 text-base"
                            index={index}
                            key={slotId}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                    <FieldDescription>
                      We sent a code to {email}.
                    </FieldDescription>
                  </Field>
                ) : null}

                {error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <Button className="w-full" disabled={loading} type="submit">
                  {getSubmitLabel({ isOtpSent, isSignUp, loading })}
                </Button>

                {isOtpSent ? (
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      className="h-auto px-0"
                      disabled={loading}
                      onClick={async () => {
                        setError(null)
                        setLoading(true)
                        try {
                          await requestOtp()
                        } finally {
                          setLoading(false)
                        }
                      }}
                      type="button"
                      variant="link"
                    >
                      Resend code
                    </Button>
                    <Button
                      className="h-auto px-0"
                      disabled={loading}
                      onClick={() => {
                        setError(null)
                        setIsOtpSent(false)
                        setOtp('')
                      }}
                      type="button"
                      variant="link"
                    >
                      Use another email
                    </Button>
                  </div>
                ) : null}
              </FieldGroup>
            </form>

            <p className="mt-6 text-center text-muted-foreground text-sm">
              {isSignUp
                ? 'Already have an account? '
                : "Don't have an account? "}
              <Link
                className="font-medium text-foreground underline-offset-4 hover:underline"
                href={isSignUp ? '/sign-in' : '/sign-up'}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
