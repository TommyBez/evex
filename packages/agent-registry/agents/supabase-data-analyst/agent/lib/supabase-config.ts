const DEFAULT_SUPABASE_MCP_URL = 'https://mcp.supabase.com/mcp'
const DEFAULT_FEATURES: readonly string[] = ['database', 'docs']
const ALLOWED_FEATURES = new Set([
  'account-management',
  'branching',
  'database',
  'debugging',
  'development',
  'edge-functions',
  'storage',
  'docs',
])
const PROJECT_REF_PATTERN = /^[A-Za-z0-9_-]{6,}$/
const READ_ONLY_FEATURES = new Set([
  'database',
  'docs',
  'development',
  'debugging',
])

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
    return DEFAULT_FEATURES
  }

  const unique = [...new Set(requested.map((feature) => feature.toLowerCase()))]
  for (const feature of unique) {
    if (!ALLOWED_FEATURES.has(feature)) {
      throw new Error(
        `SUPABASE_DATA_ANALYST_FEATURES contains unknown feature "${feature}". Allowed: ${[
          ...ALLOWED_FEATURES,
        ].join(', ')}.`,
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
  return value.trim().toLowerCase() !== 'false'
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

const buildMcpUrl = (
  baseUrl: string,
  config: Omit<SupabaseDataAnalystConfig, 'mcpUrl' | 'accessToken'>,
): string => {
  const url = new URL(baseUrl)
  if (config.projectRef) {
    url.searchParams.set('project_ref', config.projectRef)
  }
  if (config.readOnly) {
    url.searchParams.set('read_only', 'true')
  }
  if (config.features.length > 0) {
    url.searchParams.set('features', config.features.join(','))
  }
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

export const READ_ONLY_ALLOWED_TOOLS = [
  'list_tables',
  'list_extensions',
  'list_migrations',
  'execute_sql',
  'get_logs',
  'get_advisors',
  'generate_typescript_types',
  'list_edge_functions',
  'get_edge_function',
  'list_branches',
  'list_storage_buckets',
  'get_storage_config',
  'search_docs',
] as const

export const READ_ONLY_BLOCKED_TOOLS = [
  'apply_migration',
  'deploy_edge_function',
  'create_project',
  'pause_project',
  'restore_project',
  'create_branch',
  'delete_branch',
  'merge_branch',
  'reset_branch',
  'rebase_branch',
  'update_storage_config',
] as const

export const assertReadOnlyFeatureSurface = (
  features: readonly string[],
): void => {
  const disallowed = features.filter(
    (feature) => !READ_ONLY_FEATURES.has(feature),
  )
  if (disallowed.length > 0) {
    throw new Error(
      `SUPABASE_DATA_ANALYST_FEATURES includes write-capable feature groups (${disallowed.join(
        ', ',
      )}). Remove them or set SUPABASE_DATA_ANALYST_READ_ONLY=true with features limited to ${[
        ...READ_ONLY_FEATURES,
      ].join(', ')}.`,
    )
  }
}
