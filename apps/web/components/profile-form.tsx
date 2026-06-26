'use client'

import { Button } from '@evex/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@evex/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@evex/ui/field'
import { Input } from '@evex/ui/input'
import { Textarea } from '@evex/ui/textarea'
import { Globe, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useReducer, useRef, useTransition } from 'react'
import { toast } from 'sonner'
import { type ProfileData, saveProfile } from '@/app/actions/profile'
import { AuthorAvatar } from '@/components/author-avatar'
import { GitHubIcon } from '@/components/github-icon'
import { LinkedInIcon } from '@/components/linkedin-icon'
import { XIcon } from '@/components/x-icon'

const MAX_AVATAR_BYTES = 4 * 1024 * 1024

interface ProfileFormState {
  bio: string
  githubUrl: string
  linkedinUrl: string
  preview: string | null
  twitterUrl: string
  websiteUrl: string
}

type ProfileFormAction =
  | {
      field: Exclude<keyof ProfileFormState, 'preview'>
      type: 'fieldChanged'
      value: string
    }
  | { type: 'previewChanged'; value: string | null }

function getInitialProfileFormState(profile: ProfileData): ProfileFormState {
  return {
    bio: profile.bio,
    githubUrl: profile.githubUrl ?? '',
    linkedinUrl: profile.linkedinUrl ?? '',
    preview: profile.avatarUrl,
    twitterUrl: profile.twitterUrl ?? '',
    websiteUrl: profile.websiteUrl ?? '',
  }
}

function profileFormReducer(
  state: ProfileFormState,
  action: ProfileFormAction,
): ProfileFormState {
  switch (action.type) {
    case 'fieldChanged':
      return { ...state, [action.field]: action.value }
    case 'previewChanged':
      return { ...state, preview: action.value }
    default:
      return state
  }
}

export function ProfileForm({
  profile,
  name,
  email,
}: {
  profile: ProfileData
  name: string
  email: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewObjectUrlRef = useRef<string | null>(null)

  const [formState, dispatch] = useReducer(
    profileFormReducer,
    profile,
    getInitialProfileFormState,
  )
  const hasVerifiedGithub = Boolean(profile.githubUsername)
  const { bio, githubUrl, linkedinUrl, preview, twitterUrl, websiteUrl } =
    formState

  useEffect(
    () => () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current)
      }
    },
    [],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error('Avatar must be smaller than 4MB.')
      e.target.value = ''
      return
    }
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current)
    }
    const objectUrl = URL.createObjectURL(file)
    previewObjectUrlRef.current = objectUrl
    dispatch({ type: 'previewChanged', value: objectUrl })
  }

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await saveProfile(formData)
      if (result.ok) {
        toast.success('Profile saved')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form
      className="flex w-full min-w-0 flex-col gap-8"
      onSubmit={handleSubmit}
    >
      <Card className="w-full min-w-0 rounded-md border border-border shadow-(--shadow-card) ring-0">
        <CardHeader>
          <CardTitle className="font-semibold text-lg">Avatar</CardTitle>
          <CardDescription>A square image works best. Max 4MB.</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <AuthorAvatar
              className="size-20 text-3xl"
              name={name || email}
              src={preview}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                type="button"
                variant="outline"
              >
                <Upload aria-hidden="true" className="size-4" />
                Upload Image
              </Button>
              <FieldDescription>PNG, JPEG, WEBP, GIF</FieldDescription>
            </div>
            <input
              accept="image/png,image/jpeg,image/webp,image/gif"
              aria-label="Avatar image file"
              className="sr-only"
              name="avatar"
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full min-w-0 rounded-md border border-border shadow-(--shadow-card) ring-0">
        <CardHeader>
          <CardTitle className="font-semibold text-lg">About</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          <Field>
            <FieldLabel htmlFor="bio">Bio</FieldLabel>
            <Textarea
              id="bio"
              maxLength={500}
              name="bio"
              onChange={(e) =>
                dispatch({
                  field: 'bio',
                  type: 'fieldChanged',
                  value: e.target.value,
                })
              }
              placeholder="Tell people a little about yourself and the agents you build."
              rows={4}
              value={bio}
            />
          </Field>
        </CardContent>
      </Card>

      <Card className="w-full min-w-0 rounded-md border border-border shadow-(--shadow-card) ring-0">
        <CardHeader>
          <CardTitle className="font-semibold text-lg">Links</CardTitle>
          <CardDescription>
            Add your personal website and social profiles.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <FieldGroup>
            <Field>
              <FieldLabel
                className="flex items-center gap-2"
                htmlFor="websiteUrl"
              >
                <Globe
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                Personal Website
              </FieldLabel>
              <Input
                id="websiteUrl"
                inputMode="url"
                name="websiteUrl"
                onChange={(e) =>
                  dispatch({
                    field: 'websiteUrl',
                    type: 'fieldChanged',
                    value: e.target.value,
                  })
                }
                placeholder="yoursite.com"
                type="text"
                value={websiteUrl}
              />
            </Field>
            <Field>
              <FieldLabel
                className="flex items-center gap-2"
                htmlFor="githubUrl"
              >
                <GitHubIcon className="size-4 text-muted-foreground" />
                GitHub
              </FieldLabel>
              <Input
                disabled={hasVerifiedGithub}
                id="githubUrl"
                name={hasVerifiedGithub ? undefined : 'githubUrl'}
                onChange={(e) =>
                  dispatch({
                    field: 'githubUrl',
                    type: 'fieldChanged',
                    value: e.target.value,
                  })
                }
                placeholder="https://github.com/username"
                readOnly={hasVerifiedGithub}
                value={githubUrl}
              />
              {hasVerifiedGithub ? (
                <FieldDescription>
                  Connected as @{profile.githubUsername}.
                </FieldDescription>
              ) : null}
            </Field>
            <Field>
              <FieldLabel
                className="flex items-center gap-2"
                htmlFor="twitterUrl"
              >
                <XIcon className="size-4 text-muted-foreground" />X (Twitter)
              </FieldLabel>
              <Input
                id="twitterUrl"
                name="twitterUrl"
                onChange={(e) =>
                  dispatch({
                    field: 'twitterUrl',
                    type: 'fieldChanged',
                    value: e.target.value,
                  })
                }
                placeholder="https://x.com/username"
                value={twitterUrl}
              />
            </Field>
            <Field>
              <FieldLabel
                className="flex items-center gap-2"
                htmlFor="linkedinUrl"
              >
                <LinkedInIcon className="size-4 text-muted-foreground" />
                LinkedIn
              </FieldLabel>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                onChange={(e) =>
                  dispatch({
                    field: 'linkedinUrl',
                    type: 'fieldChanged',
                    value: e.target.value,
                  })
                }
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button
          className="w-full sm:w-auto"
          onClick={() => router.push('/favorites')}
          type="button"
          variant="ghost"
        >
          Cancel
        </Button>
        <Button className="w-full sm:w-auto" disabled={isPending} type="submit">
          {isPending ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  )
}
