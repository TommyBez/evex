import { defineMcpClientConnection } from 'eve/connections'

import {
  getRequiredAccessToken,
  getSupabaseDataAnalystConfig,
  QUERY_TOOLS,
} from '../lib/supabase-config.js'

const connectionConfig = getSupabaseDataAnalystConfig()

export default defineMcpClientConnection({
  url: connectionConfig.mcpUrl,
  description:
    'Read-only SQL analytics for a single Supabase project. The only available tools are supabase__list_tables (schema inspection) and supabase__execute_sql (read-only SELECT). No write, migration, Edge Function, branch, storage, logs, advisors, account, or docs tools are exposed. Use connection_search to discover these tools, then call them by qualified name.',
  auth: {
    principalType: 'app',
    getToken: async () => ({
      token: getRequiredAccessToken(getSupabaseDataAnalystConfig()),
    }),
  },
  tools: {
    allow: [...QUERY_TOOLS],
  },
})
