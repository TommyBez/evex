const GITHUB_PROFILE_URL = 'https://github.com'

export function githubUsernameKey(username: string | null | undefined): string {
  return username?.trim().toLowerCase() ?? ''
}

// Case-insensitive identity check between two GitHub usernames (for example
// the viewer's verified username and an agent's registry author). A missing
// username on either side is never a match.
export function isSameGithubUsername(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  const leftKey = githubUsernameKey(left)
  if (!leftKey) {
    return false
  }

  return leftKey === githubUsernameKey(right)
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
