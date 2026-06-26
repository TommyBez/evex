'use client'

import { Alert, AlertDescription } from '@evex/ui/alert'
import { Button } from '@evex/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@evex/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@evex/ui/field'
import { Input } from '@evex/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@evex/ui/input-otp'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useReducer } from 'react'
import { BrandMark } from '@/components/brand-mark'
import { GitHubIcon } from '@/components/github-icon'
import { TextSwap } from '@/components/transitions/text-swap'
import { useShake } from '@/components/transitions/use-shake'
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

interface AuthFormState {
  email: string
  error: string | null
  githubLoading: boolean
  isOtpSent: boolean
  loading: boolean
  name: string
  otp: string
}

type AuthFormAction =
  | { type: 'patch'; value: Partial<AuthFormState> }
  | { type: 'otpSent' }
  | { type: 'resetOtp' }

const initialAuthFormState: AuthFormState = {
  email: '',
  error: null,
  githubLoading: false,
  isOtpSent: false,
  loading: false,
  name: '',
  otp: '',
}

function authFormReducer(
  state: AuthFormState,
  action: AuthFormAction,
): AuthFormState {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.value }
    case 'otpSent':
      return { ...state, error: null, isOtpSent: true, otp: '' }
    case 'resetOtp':
      return { ...state, error: null, isOtpSent: false, otp: '' }
    default:
      return state
  }
}

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

export function AuthForm({
  mode,
  redirectTo = '/',
}: {
  mode: 'sign-in' | 'sign-up'
  redirectTo?: string
}) {
  const router = useRouter()
  const [state, dispatch] = useReducer(authFormReducer, initialAuthFormState)
  const { ref: otpShakeRef, trigger: shakeOtp } = useShake<HTMLDivElement>()

  const { email, error, githubLoading, isOtpSent, loading, name, otp } = state
  const isSignUp = mode === 'sign-up'
  const switchPath = isSignUp ? '/sign-in' : '/sign-up'
  const switchHref =
    redirectTo === '/'
      ? switchPath
      : `${switchPath}?redirect=${encodeURIComponent(redirectTo)}`

  const handleGitHub = async (): Promise<void> => {
    dispatch({ type: 'patch', value: { error: null, githubLoading: true } })
    try {
      const { error } = await authClient.signIn.social({
        provider: 'github',
        callbackURL: redirectTo,
      })
      if (error) {
        dispatch({
          type: 'patch',
          value: {
            error: error.message ?? 'Something went wrong',
            githubLoading: false,
          },
        })
      }
    } catch (error) {
      dispatch({
        type: 'patch',
        value: { error: getErrorMessage(error), githubLoading: false },
      })
    }
  }

  const requestOtp = async (): Promise<boolean> => {
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      })

      if (error) {
        dispatch({
          type: 'patch',
          value: { error: error.message ?? 'Something went wrong' },
        })
        return false
      }

      dispatch({ type: 'otpSent' })
      return true
    } catch (error) {
      dispatch({ type: 'patch', value: { error: getErrorMessage(error) } })
      return false
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    dispatch({ type: 'patch', value: { error: null, loading: true } })

    try {
      const displayName = name.trim()
      if (isSignUp && !displayName) {
        dispatch({ type: 'patch', value: { error: 'Enter your name' } })
        return
      }

      if (!isOtpSent) {
        await requestOtp()
        return
      }

      if (otp.length !== OTP_LENGTH) {
        dispatch({
          type: 'patch',
          value: {
            error: `Enter the ${OTP_LENGTH}-digit code from your email`,
          },
        })
        shakeOtp()
        return
      }

      const { error } = await authClient.signIn.emailOtp({
        email,
        otp,
        ...(isSignUp ? { name: displayName } : {}),
      })

      if (error) {
        dispatch({
          type: 'patch',
          value: { error: error.message ?? 'Something went wrong' },
        })
        shakeOtp()
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      dispatch({ type: 'patch', value: { error: getErrorMessage(error) } })
      if (isOtpSent) {
        shakeOtp()
      }
    } finally {
      dispatch({ type: 'patch', value: { loading: false } })
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
          <span className="brand-wordmark text-lg">evex</span>
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
                      autoFocus
                      disabled={loading || isOtpSent}
                      id="name"
                      onChange={(e) =>
                        dispatch({
                          type: 'patch',
                          value: { name: e.target.value },
                        })
                      }
                      required
                      value={name}
                    />
                  </Field>
                )}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    autoComplete="email"
                    autoFocus={!isSignUp}
                    disabled={loading || isOtpSent}
                    id="email"
                    onChange={(e) =>
                      dispatch({
                        type: 'patch',
                        value: { email: e.target.value },
                      })
                    }
                    required
                    type="email"
                    value={email}
                  />
                </Field>
                {isOtpSent ? (
                  <Field>
                    <FieldLabel htmlFor="otp">Code</FieldLabel>
                    {/* t-input owns the shake transform; the slots ride along
                        as one unit on an invalid code. */}
                    <div className="t-input" ref={otpShakeRef}>
                      <InputOTP
                        autoFocus
                        containerClassName="justify-center"
                        id="otp"
                        maxLength={OTP_LENGTH}
                        onChange={(value) =>
                          dispatch({ type: 'patch', value: { otp: value } })
                        }
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
                    </div>
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
                  <TextSwap
                    text={getSubmitLabel({ isOtpSent, isSignUp, loading })}
                  />
                </Button>

                {isOtpSent ? (
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      className="h-auto px-0"
                      disabled={loading}
                      onClick={async () => {
                        dispatch({
                          type: 'patch',
                          value: { error: null, loading: true },
                        })
                        try {
                          await requestOtp()
                        } finally {
                          dispatch({
                            type: 'patch',
                            value: { loading: false },
                          })
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
                      onClick={() => dispatch({ type: 'resetOtp' })}
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
                href={switchHref}
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
