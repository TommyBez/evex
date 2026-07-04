export interface AgentPayoff {
  after: string
  before: string
  highlight: string
}

export interface AgentLaunchData {
  accent: string
  /** 2–4 concrete things the agent does, revealed as a checklist beat. */
  capabilities?: string[]
  category: string
  fileCount: number
  payoff: AgentPayoff
  slug: string
  title: string
}

const ACCENTS: Record<string, string> = {
  coding: '#0ea5e9',
  data: '#22c55e',
  general: '#0ea5e9',
  marketing: '#a855f7',
  productivity: '#d97757',
  research: '#22c55e',
}

export const DEFAULT_ACCENT = '#0ea5e9'

export const accentFor = (category: string): string =>
  ACCENTS[category] ?? DEFAULT_ACCENT

export const AGENTS: AgentLaunchData[] = [
  {
    slug: 'brand-visual-asset-generator',
    title: 'Brand Visual Asset Generator',
    category: 'marketing',
    accent: accentFor('marketing'),
    payoff: {
      before: 'On-brand asset packs, ready in',
      highlight: 'minutes.',
      after: '',
    },
    capabilities: [
      'Extracts your brand with Context.dev',
      'Generates matching SVG assets',
      'Ships a ready-to-use pack',
    ],
    fileCount: 16,
  },
  {
    slug: 'branded-seo-page-builder',
    title: 'Branded SEO Page Builder',
    category: 'marketing',
    accent: accentFor('marketing'),
    payoff: {
      before: 'SEO pages that still look like',
      highlight: 'your brand.',
      after: '',
    },
    capabilities: [
      'Reads your brand and styleguide',
      'Writes SEO-optimized copy',
      'Builds a ready-to-ship page',
    ],
    fileCount: 16,
  },
  {
    slug: 'code-reviewer',
    title: 'Code Reviewer',
    category: 'coding',
    accent: accentFor('coding'),
    payoff: {
      before: 'Every pull request gets a',
      highlight: 'real review.',
      after: '',
    },
    capabilities: [
      'Reviews each pull request',
      'Posts inline comments',
      'Suggests concrete fixes',
    ],
    fileCount: 14,
  },
  {
    slug: 'eve-agent-builder',
    title: 'Eve Agent Builder',
    category: 'coding',
    accent: accentFor('coding'),
    payoff: {
      before: 'Builds, checks and',
      highlight: 'deploys',
      after: 'new Eve agents.',
    },
    capabilities: [
      'Implements a new Eve agent',
      'Runs its checks',
      'Deploys it to Vercel',
      'Verifies the live routes',
    ],
    fileCount: 26,
  },
  {
    slug: 'linear-operations-agent',
    title: 'Linear Operations Agent',
    category: 'productivity',
    accent: accentFor('productivity'),
    payoff: {
      before: 'Your Linear backlog, managed',
      highlight: 'from Slack.',
      after: '',
    },
    capabilities: [
      'Manages your Linear issues',
      'Works right from Slack',
      'Runs on a schedule',
    ],
    fileCount: 27,
  },
  {
    slug: 'openui-assistant',
    title: 'OpenUI Assistant',
    category: 'general',
    accent: accentFor('general'),
    payoff: {
      before: 'Chat that streams real,',
      highlight: 'generative UI.',
      after: '',
    },
    capabilities: [
      'Streams generative UI',
      'Calls live tools',
      'Weather, stocks, and search',
    ],
    fileCount: 17,
  },
  {
    slug: 'postgres-data-analyst',
    title: 'Postgres Data Analyst',
    category: 'data',
    accent: accentFor('data'),
    payoff: {
      before: 'Ask your Postgres anything, right',
      highlight: 'in Slack.',
      after: '',
    },
    capabilities: [
      'Answers questions in Slack',
      'Inspects your schema',
      'Runs read-only SQL',
    ],
    fileCount: 13,
  },
  {
    slug: 'programmatic-seo-agent',
    title: 'Programmatic SEO Agent',
    category: 'marketing',
    accent: accentFor('marketing'),
    payoff: {
      before: 'Organic growth, shipped weekly as',
      highlight: 'pull requests.',
      after: '',
    },
    capabilities: [
      'Finds keyword opportunities',
      'Researches each target',
      'Generates SEO pages',
      'Opens a pull request',
    ],
    fileCount: 19,
  },
  {
    slug: 'supabase-data-analyst',
    title: 'Supabase Data Analyst',
    category: 'data',
    accent: accentFor('data'),
    payoff: {
      before: 'Supabase answers in Slack,',
      highlight: 'read-only',
      after: 'by design.',
    },
    capabilities: [
      'Answers questions in Slack',
      'Lists your tables',
      'Runs read-only SQL',
    ],
    fileCount: 10,
  },
  {
    slug: 'x-draft-assistant',
    title: 'X Draft Assistant',
    category: 'general',
    accent: accentFor('general'),
    payoff: {
      before: 'Three post drafts waiting,',
      highlight: 'every morning.',
      after: '',
    },
    capabilities: [
      'Scans the X profiles you pick',
      "Surfaces the day's hot topics",
      'Drafts three posts in Typefully',
    ],
    fileCount: 24,
  },
  {
    slug: 'x-hot-topic-digest',
    title: 'X Hot Topic Digest',
    category: 'research',
    accent: accentFor('research'),
    payoff: {
      before: 'What X is talking about, in',
      highlight: 'your inbox.',
      after: '',
    },
    capabilities: [
      'Scans the X profiles you pick',
      "Surfaces the day's hot topics",
      'Emails you an HTML digest',
    ],
    fileCount: 18,
  },
]
