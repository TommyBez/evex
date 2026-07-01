import type { AgentWithAuthor } from '@/lib/agent-types'
import { getSiteUrl, siteConfig } from '@/lib/metadata'
import { buildInstallCommand } from '@/lib/site-url'

const SCHEMA_CONTEXT = 'https://schema.org'
const REPO_URL = 'https://github.com/TommyBez/evex'

type JsonLdObject = Record<string, unknown>

export function createOrganizationSchema(): JsonLdObject {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Organization',
    name: siteConfig.name,
    url: getSiteUrl(),
    description: siteConfig.description,
    sameAs: [REPO_URL, 'https://x.com/TommyBez85'],
  }
}

export function createWebsiteSchema(): JsonLdObject {
  const siteUrl = getSiteUrl()

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteUrl,
    description: siteConfig.description,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteUrl,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function createHomeFaqSchema(): JsonLdObject {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is evex?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'evex is the community registry for eve agents. It lets developers browse reusable agent configurations, preview every file before install, and add agents to eve projects with one shadcn command.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I install an eve agent from evex?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Run npx shadcn@latest add @evex/{slug} from your eve app root. The command writes the agent files under agent/ in the layout expected by eve.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I publish an agent to evex?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Open a pull request to the evex repository with your agent under packages/agent-registry/agents/{slug}, including a registry.json manifest. After merge, the agent appears in the public catalog and shadcn registry.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is eve?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'eve is a framework for building durable backend AI agents with instructions, skills, tools, connections, and subagents. evex distributes ready-made agent configurations into eve projects.',
        },
      },
    ],
  }
}

export function createAgentListSchema(
  agents: readonly AgentWithAuthor[],
): JsonLdObject {
  const siteUrl = getSiteUrl()

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'ItemList',
    name: 'eve agent registry',
    description: siteConfig.description,
    numberOfItems: agents.length,
    itemListElement: agents.map((agent, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/agents/${agent.slug}`,
      name: agent.name,
    })),
  }
}

export function createAgentSoftwareSchema(
  agent: AgentWithAuthor,
  installCount: number,
): JsonLdObject {
  const siteUrl = getSiteUrl()
  const agentUrl = `${siteUrl}/agents/${agent.slug}`

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'SoftwareApplication',
    name: agent.name,
    description: agent.description,
    url: agentUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    datePublished: agent.createdAt.toISOString(),
    dateModified: agent.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: agent.authorName,
      ...(agent.authorUsername
        ? { url: `${siteUrl}/authors/${agent.authorUsername}` }
        : {}),
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    installUrl: agentUrl,
    softwareHelp: {
      '@type': 'CreativeWork',
      text: buildInstallCommand(agent.slug),
    },
    ...(installCount > 0
      ? {
          interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/InstallAction',
            userInteractionCount: installCount,
          },
        }
      : {}),
  }
}

export function createAgentBreadcrumbSchema(
  agent: AgentWithAuthor,
): JsonLdObject {
  const siteUrl = getSiteUrl()

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Registry',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: agent.name,
        item: `${siteUrl}/agents/${agent.slug}`,
      },
    ],
  }
}

export function createAuthorProfileSchema(
  author: {
    name: string
    githubUsername: string
    bio: string | null
    agentCount: number
    totalInstalls: number
  },
  agents: readonly AgentWithAuthor[],
): JsonLdObject {
  const siteUrl = getSiteUrl()
  const profileUrl = `${siteUrl}/authors/${author.githubUsername}`

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'ProfilePage',
    name: `${author.name} on evex`,
    url: profileUrl,
    description:
      author.bio ??
      `${author.name} publishes eve agents on evex with ${author.agentCount} agents and ${author.totalInstalls} total installs.`,
    mainEntity: {
      '@type': 'Person',
      name: author.name,
      identifier: author.githubUsername,
      url: profileUrl,
      ...(author.bio ? { description: author.bio } : {}),
    },
    hasPart: agents.map((agent) => ({
      '@type': 'SoftwareApplication',
      name: agent.name,
      url: `${siteUrl}/agents/${agent.slug}`,
    })),
  }
}
