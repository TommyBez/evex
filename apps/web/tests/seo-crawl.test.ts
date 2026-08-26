import { describe, expect, it } from 'vitest'
import { metadata as agentsIndexMetadata } from '@/app/(main)/agents/page'
import { GET as getRegistryCatalog } from '@/app/r/registry.json/route'
import { GET as getRobotsTxt } from '@/app/robots.txt/route'
import { metadata as signInMetadata } from '@/app/sign-in/page'
import { metadata as signUpMetadata } from '@/app/sign-up/page'
import sitemap from '@/app/sitemap'
import {
  METADATA_TITLE_MAX_LENGTH,
  METADATA_TITLE_SUFFIX,
} from '@/lib/agent-detail'
import type { AgentWithAuthor } from '@/lib/agent-types'
import {
  getAuthorMetaDescription,
  getAuthorMetadataTitle,
} from '@/lib/author-detail'
import {
  buildInstallCommand,
  getAgentsUrl,
  getRegistryItemUrl,
} from '@/lib/site-url'
import {
  createAgentSoftwareSchema,
  createAgentsIndexBreadcrumbSchema,
  createAuthorBreadcrumbSchema,
  createLeaderboardSchema,
} from '@/lib/structured-data'

function makeAgent(overrides: Partial<AgentWithAuthor> = {}): AgentWithAuthor {
  return {
    author: { githubUsername: 'octocat', name: 'octocat' },
    authorAvatarUrl: null,
    authorName: 'octocat',
    authorUsername: 'octocat',
    category: 'coding',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    dependencies: 'eve@^0.31.3,zod@4.3.6',
    description: 'Reviews pull requests.',
    docs: {
      faqs: [{ answer: 'Yes.', question: 'Does it work?' }],
      howItWorks: ['It reviews PRs.'],
      overview: ['A reviewer agent.'],
      requirements: [
        {
          body: 'A GitHub App installation.',
          name: 'GitHub App',
        },
      ],
      useCases: [{ body: 'Review PRs.', title: 'Code review' }],
    },
    id: 'agent-a',
    installCount: 12,
    name: 'Code Reviewer',
    slug: 'code-reviewer',
    title: 'Code Reviewer',
    updatedAt: new Date('2026-02-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('registry JSON routes', () => {
  it('sends X-Robots-Tag: noindex on the catalog endpoint', () => {
    const response = getRegistryCatalog()

    expect(response.headers.get('X-Robots-Tag')).toBe('noindex')
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=60')
  })
})

describe('robots.txt', () => {
  it('keeps intentional Disallows and drops sign-in / sign-up blocks', async () => {
    const body = await getRobotsTxt().text()

    expect(body).toContain('Disallow: /api/')
    expect(body).toContain('Disallow: /profile')
    expect(body).toContain('Disallow: /favorites')
    expect(body).not.toContain('Disallow: /sign-in')
    expect(body).not.toContain('Disallow: /sign-up')
  })

  it('leaves page-level noindex as the sign-in / sign-up opt-out', () => {
    expect(signInMetadata.robots).toEqual({
      follow: false,
      googleBot: {
        follow: false,
        index: false,
      },
      index: false,
    })
    expect(signUpMetadata.robots).toEqual({
      follow: false,
      googleBot: {
        follow: false,
        index: false,
      },
      index: false,
    })
  })
})

describe('author metadata helpers', () => {
  it('builds a title that relies on the layout brand suffix', () => {
    expect(getAuthorMetadataTitle({ name: 'Ada Lovelace' })).toBe(
      'Ada Lovelace: eve agents',
    )
  })

  it('keeps the rendered title within the SERP budget', () => {
    const title = getAuthorMetadataTitle({ name: 'Ada Lovelace' })

    expect(`${title}${METADATA_TITLE_SUFFIX}`.length).toBeLessThanOrEqual(
      METADATA_TITLE_MAX_LENGTH,
    )
    expect(title).not.toContain('on evex')
    expect(title.endsWith('evex')).toBe(false)
  })

  it('compacts long display names before falling back to the bare name', () => {
    // 42 chars: descriptive (`: eve agents`, 12) exceeds the 53-char budget.
    const longName = 'A'.repeat(42)
    const compactTitle = getAuthorMetadataTitle({ name: longName })

    expect(compactTitle).toBe(`${longName}: agents`)
    expect(
      `${compactTitle}${METADATA_TITLE_SUFFIX}`.length,
    ).toBeLessThanOrEqual(METADATA_TITLE_MAX_LENGTH)

    // 50 chars: even the compact form exceeds the budget.
    const longerName = 'B'.repeat(50)
    expect(getAuthorMetadataTitle({ name: longerName })).toBe(longerName)
  })

  it('prefers the author bio for the description', () => {
    expect(
      getAuthorMetaDescription({
        agentCount: 3,
        bio: 'Builds reusable eve agents.',
        name: 'Ada Lovelace',
      }),
    ).toBe('Builds reusable eve agents.')
  })

  it('falls back to agent-count copy when bio is missing', () => {
    expect(
      getAuthorMetaDescription({
        agentCount: 3,
        bio: null,
        name: 'Ada Lovelace',
      }),
    ).toBe(
      'All 3 eve agents published by Ada Lovelace on evex, with install counts and one command install for each.',
    )
  })

  it('singularizes the fallback when the author has one agent', () => {
    expect(
      getAuthorMetaDescription({
        agentCount: 1,
        bio: null,
        name: 'Ada Lovelace',
      }),
    ).toBe(
      'All 1 eve agent published by Ada Lovelace on evex, with install counts and one command install for each.',
    )
  })
})

describe('author breadcrumb schema', () => {
  it('emits Registry → author crumbs', () => {
    const schema = createAuthorBreadcrumbSchema({
      githubUsername: 'ada',
      name: 'Ada Lovelace',
    })

    expect(schema['@type']).toBe('BreadcrumbList')
    expect(schema.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        item: 'https://www.evex.sh',
        name: 'Registry',
        position: 1,
      },
      {
        '@type': 'ListItem',
        item: 'https://www.evex.sh/authors/ada',
        name: 'Ada Lovelace',
        position: 2,
      },
    ])
  })
})

describe('leaderboard schema', () => {
  it('emits two ItemLists plus a BreadcrumbList', () => {
    const [agentsList, authorsList, breadcrumb] = createLeaderboardSchema(
      [{ name: 'Code Reviewer', slug: 'code-reviewer' }],
      [{ authorName: 'Ada Lovelace', authorUsername: 'ada' }],
    )

    expect(agentsList).toMatchObject({
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          name: 'Code Reviewer',
          position: 1,
          url: 'https://www.evex.sh/agents/code-reviewer',
        },
      ],
      numberOfItems: 1,
    })
    expect(authorsList).toMatchObject({
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          name: 'Ada Lovelace',
          position: 1,
          url: 'https://www.evex.sh/authors/ada',
        },
      ],
      numberOfItems: 1,
    })
    expect(breadcrumb).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          item: 'https://www.evex.sh',
          name: 'Registry',
          position: 1,
        },
        {
          '@type': 'ListItem',
          item: 'https://www.evex.sh/leaderboard',
          name: 'Leaderboard',
          position: 2,
        },
      ],
    })
  })
})

describe('SoftwareApplication enrichment', () => {
  it('adds repository, download, free, and requirement fields', () => {
    const software = createAgentSoftwareSchema(makeAgent(), 4)

    expect(software.codeRepository).toBe('https://github.com/TommyBez/evex')
    expect(software.isAccessibleForFree).toBe(true)
    expect(software.downloadUrl).toBe(getRegistryItemUrl('code-reviewer'))
    expect(software.downloadUrl).toBe(
      'https://www.evex.sh/r/code-reviewer.json',
    )
    expect(software.softwareRequirements).toEqual([
      'eve@^0.31.3',
      'zod@4.3.6',
      'GitHub App: A GitHub App installation.',
    ])
    expect(software.softwareHelp).toEqual({
      '@type': 'CreativeWork',
      text: buildInstallCommand('code-reviewer'),
    })
    expect(buildInstallCommand('code-reviewer')).toBe(
      'npx shadcn@latest add @evex/code-reviewer',
    )
  })

  it('omits softwareRequirements when none are declared', () => {
    const software = createAgentSoftwareSchema(
      makeAgent({ dependencies: '', docs: null }),
      0,
    )

    expect(software).not.toHaveProperty('softwareRequirements')
  })
})

describe('/agents catalog index', () => {
  it('is listed in sitemap.xml', () => {
    const entries = sitemap()
    const agentsIndex = entries.find(
      (entry) => entry.url === 'https://www.evex.sh/agents',
    )

    expect(agentsIndex).toBeDefined()
    expect(getAgentsUrl()).toBe('https://www.evex.sh/agents')
  })

  it('emits indexable metadata with a self-canonical', () => {
    // createPageMetadata omits `robots` so the root layout's index,follow
    // (plus googleBot preview directives) survive the Next metadata merge.
    expect('robots' in agentsIndexMetadata).toBe(false)
    expect(agentsIndexMetadata.alternates?.canonical).toBe('/agents')
    expect(agentsIndexMetadata.openGraph?.url).toBe('/agents')
    expect(agentsIndexMetadata.title).toBe(
      'Eve agents - install with @evex/<slug>',
    )
    expect(agentsIndexMetadata.description).toBe(
      'Browse community Eve agents, inspect the files, install with npx shadcn@latest add @evex/<slug>.',
    )
    expect(String(agentsIndexMetadata.description).length).toBeLessThanOrEqual(
      155,
    )
    // Layout template is `%s · evex` — helper must not already include the brand.
    expect(String(agentsIndexMetadata.title).endsWith(' · evex')).toBe(false)
    expect(`${agentsIndexMetadata.title} · evex`).toBe(
      'Eve agents - install with @evex/<slug> · evex',
    )
  })

  it('emits Registry → Agents breadcrumbs', () => {
    const schema = createAgentsIndexBreadcrumbSchema()

    expect(schema).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          item: 'https://www.evex.sh',
          name: 'Registry',
          position: 1,
        },
        {
          '@type': 'ListItem',
          item: 'https://www.evex.sh/agents',
          name: 'Agents',
          position: 2,
        },
      ],
    })
  })
})
