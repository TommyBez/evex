const GITHUB_PROFILE_URL = 'https://github.com'

export function githubUsernameKey(username: string | null | undefined): string {
  return username?.trim().toLowerCase() ?? ''
}

// Case-insensitive identity check between two GitHub usernames (for example
// the viewer's verified username and an agent's registry author). Returns
// null when either side is missing: a signed-out visitor, or an account with
// no verified username, is an unknown author and not a confirmed non-author,
// so callers that report this must never flatten it to false.
export function isSameGithubUsername(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean | null {
  const leftKey = githubUsernameKey(left)
  const rightKey = githubUsernameKey(right)
  if (!(leftKey && rightKey)) {
    return null
  }

  return leftKey === rightKey
}

export function githubProfileUrl(username: string): string {
  return `${GITHUB_PROFILE_URL}/${encodeURIComponent(username)}`
}

export function readGithubUsername(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const username = value.trim()

  return username.length > 0 ? username : null
}
