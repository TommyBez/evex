export interface AgentPayoff {
  after: string
  before: string
  highlight: string
}

export interface AgentLaunchData {
  accent: string
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
    fileCount: 18,
  },
]
