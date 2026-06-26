// Only allow same-origin absolute paths as post-auth redirect targets.
// Rejects external URLs and protocol-relative (//host) values so a crafted
// `?redirect=` cannot turn sign-in into an open redirect.
export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = '/',
): string {
  if (typeof value !== 'string' || value.length === 0) {
    return fallback
  }
  if (!value.startsWith('/')) {
    return fallback
  }
  if (value.startsWith('//') || value.startsWith('/\\')) {
    return fallback
  }
  return value
}
