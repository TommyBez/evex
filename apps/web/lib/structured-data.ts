import { getAgentMetaDescription } from '@/lib/agent-detail'
import type { AgentWithAuthor } from '@/lib/agent-types'
import { parseDependencies } from '@/lib/agents'
import { getAuthorMetaDescription } from '@/lib/author-detail'
import type { DocsPage } from '@/lib/docs-content'
import { HOME_FAQ_ITEMS } from '@/lib/home-faq-content'
import type { LearnPage } from '@/lib/learn-content'
import { siteConfig } from '@/lib/metadata'
import {
  buildInstallCommand,
  getAgentUrl,
  getAuthorUrl,
  getLeaderboardUrl,
  getLearnUrl,
  getRegistryItemUrl,
  getSiteUrl,
} from '@/lib/site-url'

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
    mainEntity: HOME_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function createAgentListSchema(
  agents: readonly AgentWithAuthor[],
): JsonLdObject {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'ItemList',
    name: 'eve agent registry',
    description: siteConfig.description,
    numberOfItems: agents.length,
    itemListElement: agents.map((agent, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: getAgentUrl(agent.slug),
      name: agent.name,
      description: getAgentMetaDescription(agent),
    })),
  }
}

export function createLearnListSchema(
  pages: readonly LearnPage[],
): JsonLdObject {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'ItemList',
    name: 'AI agent engineering guides',
    description:
      'Decision-focused guides for Eve, AI agents, agent registries, and adjacent frameworks.',
    numberOfItems: pages.length,
    itemListElement: pages.map((page, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: getLearnUrl(page.slug),
      name: page.title,
    })),
  }
}

function getAgentSoftwareRequirements(agent: AgentWithAuthor): string[] {
  const dependencies = parseDependencies(agent.dependencies)
  const docsRequirements =
    agent.docs?.requirements.map(
      (requirement) => `${requirement.name}: ${requirement.body}`,
    ) ?? []

  return [...dependencies, ...docsRequirements]
}

export function createAgentSoftwareSchema(
  agent: AgentWithAuthor,
  installCount: number,
): JsonLdObject {
  const agentUrl = getAgentUrl(agent.slug)
  const softwareRequirements = getAgentSoftwareRequirements(agent)

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'SoftwareApplication',
    name: agent.name,
    description: getAgentMetaDescription(agent),
    url: agentUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    datePublished: agent.createdAt.toISOString(),
    dateModified: agent.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: agent.authorName,
      ...(agent.authorUsername
        ? { url: getAuthorUrl(agent.authorUsername) }
        : {}),
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    installUrl: agentUrl,
    downloadUrl: getRegistryItemUrl(agent.slug),
    codeRepository: REPO_URL,
    isAccessibleForFree: true,
    softwareHelp: {
      '@type': 'CreativeWork',
      text: buildInstallCommand(agent.slug),
    },
    ...(softwareRequirements.length > 0 ? { softwareRequirements } : {}),
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
  const agentUrl = getAgentUrl(agent.slug)

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
        item: agentUrl,
      },
    ],
  }
}

export function createAuthorBreadcrumbSchema(author: {
  githubUsername: string
  name: string
}): JsonLdObject {
  const siteUrl = getSiteUrl()
  const authorUrl = getAuthorUrl(author.githubUsername)

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
        name: author.name,
        item: authorUrl,
      },
    ],
  }
}

export function createLeaderboardSchema(
  topAgents: readonly Pick<AgentWithAuthor, 'name' | 'slug'>[],
  topAuthors: readonly {
    authorName: string
    authorUsername: string
  }[],
): [JsonLdObject, JsonLdObject, JsonLdObject] {
  const siteUrl = getSiteUrl()
  const leaderboardUrl = getLeaderboardUrl()

  return [
    {
      '@context': SCHEMA_CONTEXT,
      '@type': 'ItemList',
      name: 'Top eve agents on evex',
      numberOfItems: topAgents.length,
      itemListElement: topAgents.map((agent, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: agent.name,
        url: getAgentUrl(agent.slug),
      })),
    },
    {
      '@context': SCHEMA_CONTEXT,
      '@type': 'ItemList',
      name: 'Top eve agent authors on evex',
      numberOfItems: topAuthors.length,
      itemListElement: topAuthors.map((author, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: author.authorName,
        url: getAuthorUrl(author.authorUsername),
      })),
    },
    {
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
          name: 'Leaderboard',
          item: leaderboardUrl,
        },
      ],
    },
  ]
}

export function createLearnArticleSchema(page: LearnPage): JsonLdObject {
  const url = getLearnUrl(page.slug)

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    url,
    mainEntityOfPage: url,
    datePublished: page.datePublished,
    dateModified: page.dateModified,
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: getSiteUrl(),
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: getSiteUrl(),
    },
    about: page.primaryKeyword,
    keywords: [page.primaryKeyword, ...page.relatedKeywords],
  }
}

export function createAgentFaqSchema(
  agent: AgentWithAuthor,
): JsonLdObject | null {
  const faqs = agent.docs?.faqs
  if (!faqs || faqs.length === 0) {
    return null
  }

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function createLearnFaqSchema(page: LearnPage): JsonLdObject {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function createDocsArticleSchema(
  page: DocsPage,
  pageUrl: string,
): JsonLdObject {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'TechArticle',
    headline: page.title,
    description: page.description,
    datePublished: page.datePublished,
    dateModified: page.dateModified,
    url: pageUrl,
    author: {
      '@type': 'Organization',
      name: 'evex',
      url: getSiteUrl(),
    },
  }
}

export function createDocsBreadcrumbSchema(
  page: DocsPage,
  pageUrl: string,
): JsonLdObject {
  const siteUrl = getSiteUrl()
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Registry', item: siteUrl },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Docs',
      item: `${siteUrl}/docs`,
    },
  ]
  if (page.slug !== 'introduction') {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: page.shortTitle,
      item: pageUrl,
    })
  }

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

export function createLearnBreadcrumbSchema(page: LearnPage): JsonLdObject {
  const siteUrl = getSiteUrl()
  const learnUrl = `${siteUrl}/learn`
  const pageUrl = getLearnUrl(page.slug)

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
        name: 'Learn',
        item: learnUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: page.shortTitle,
        item: pageUrl,
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
  const profileUrl = getAuthorUrl(author.githubUsername)

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'ProfilePage',
    name: `${author.name} on evex`,
    url: profileUrl,
    description: getAuthorMetaDescription(author),
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
      url: getAgentUrl(agent.slug),
    })),
  }
}
