import { defineMcpClientConnection } from 'eve/connections'

import {
  getRequiredAccessToken,
  getSupabaseDataAnalystConfig,
  READ_ONLY_ALLOWED_TOOLS,
} from '../lib/supabase-config.js'

const connectionConfig = getSupabaseDataAnalystConfig()

export default defineMcpClientConnection({
  url: connectionConfig.mcpUrl,
  description:
    'Supabase project analytics: list tables and extensions, execute read-only SQL, inspect migrations, logs, advisors, Edge Functions, project URLs and publishable keys, and search Supabase docs. Use connection_search to discover supabase__ tools, then call them by qualified name (e.g. supabase__list_tables, supabase__execute_sql).',
  auth: {
    principalType: 'app',
    getToken: async () => ({
      token: getRequiredAccessToken(getSupabaseDataAnalystConfig()),
    }),
  },
  tools: {
    allow: [...READ_ONLY_ALLOWED_TOOLS],
  },
})
