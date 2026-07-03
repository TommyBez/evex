const DEFAULT_SUPABASE_MCP_URL = 'https://mcp.supabase.com/mcp'
const ALLOWED_FEATURES = new Set(['database'])
const PROJECT_REF_PATTERN = /^[A-Za-z0-9_-]{6,}$/

export interface SupabaseDataAnalystConfig {
  readonly accessToken: string | null
  readonly features: readonly string[]
  readonly mcpUrl: string
  readonly projectRef: string | null
  readonly readOnly: boolean
}

const trim = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const parseFeatures = (raw: string | undefined): readonly string[] => {
  const requested = (raw ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

  if (requested.length === 0) {
    return ['database']
  }

  const unique = [...new Set(requested.map((feature) => feature.toLowerCase()))]
  for (const feature of unique) {
    if (!ALLOWED_FEATURES.has(feature)) {
      throw new Error(
        `SUPABASE_DATA_ANALYST_FEATURES may only include "database" for this read-only query agent. Received "${feature}".`,
      )
    }
  }

  return unique
}

const parseBoolean = (
  value: string | undefined,
  fallback: boolean,
): boolean => {
  if (value === undefined) {
    return fallback
  }
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true') {
    return true
  }
  if (normalized === 'false') {
    return false
  }
  throw new Error(
    'SUPABASE_DATA_ANALYST_READ_ONLY must be set to "true" or "false".',
  )
}

const parseProjectRef = (value: string | undefined): string | null => {
  const ref = trim(value)
  if (!ref) {
    return null
  }
  if (!PROJECT_REF_PATTERN.test(ref)) {
    throw new Error(
      'SUPABASE_DATA_ANALYST_PROJECT_REF must be a Supabase project ref (alphanumeric, hyphens, underscores).',
    )
  }
  return ref
}

const parseMcpBaseUrl = (value: string | undefined): string => {
  const url = trim(value) ?? DEFAULT_SUPABASE_MCP_URL
  try {
    new URL(url)
  } catch {
    throw new Error(
      `SUPABASE_DATA_ANALYST_MCP_URL must be a valid URL. Received "${url}".`,
    )
  }
  return url
}

const isLocalMcpHost = (baseUrl: string): boolean => {
  const hostname = new URL(baseUrl).hostname
  return (
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  )
}

const assertProjectRefForHost = (
  projectRef: string | null,
  baseUrl: string,
): void => {
  if (projectRef) {
    return
  }
  if (isLocalMcpHost(baseUrl)) {
    return
  }
  throw new Error(
    'SUPABASE_DATA_ANALYST_PROJECT_REF is required for the hosted Supabase MCP server. It scopes the connection to a single project so the account-level access token cannot reach other projects in the same Supabase account. Set it to the target project ref, or point SUPABASE_DATA_ANALYST_MCP_URL at a local Supabase CLI MCP server (http://localhost:54321/mcp) where project scoping is implicit.',
  )
}

const buildMcpUrl = (
  baseUrl: string,
  config: Omit<SupabaseDataAnalystConfig, 'mcpUrl' | 'accessToken'>,
): string => {
  const url = new URL(baseUrl)
  if (config.projectRef) {
    url.searchParams.set('project_ref', config.projectRef)
  }
  url.searchParams.set('read_only', 'true')
  url.searchParams.set('features', config.features.join(','))
  return url.toString()
}

export function getSupabaseDataAnalystConfig(): SupabaseDataAnalystConfig {
  const baseUrl = parseMcpBaseUrl(process.env.SUPABASE_DATA_ANALYST_MCP_URL)
  const features = parseFeatures(process.env.SUPABASE_DATA_ANALYST_FEATURES)
  const projectRef = parseProjectRef(
    process.env.SUPABASE_DATA_ANALYST_PROJECT_REF,
  )
  const readOnly = parseBoolean(
    process.env.SUPABASE_DATA_ANALYST_READ_ONLY,
    true,
  )

  if (!readOnly) {
    throw new Error(
      'SUPABASE_DATA_ANALYST_READ_ONLY cannot be false. This agent only runs read-only SQL queries.',
    )
  }

  assertProjectRefForHost(projectRef, baseUrl)

  const baseConfig = { features, projectRef, readOnly }
  const mcpUrl = buildMcpUrl(baseUrl, baseConfig)

  return {
    ...baseConfig,
    accessToken: trim(process.env.SUPABASE_DATA_ANALYST_ACCESS_TOKEN) ?? null,
    mcpUrl,
  }
}

export function getRequiredAccessToken(
  config: SupabaseDataAnalystConfig,
): string {
  if (!config.accessToken) {
    throw new Error(
      'SUPABASE_DATA_ANALYST_ACCESS_TOKEN is required. Generate a Supabase personal access token and set it here.',
    )
  }
  return config.accessToken
}

export const QUERY_TOOLS = ['list_tables', 'execute_sql'] as const
