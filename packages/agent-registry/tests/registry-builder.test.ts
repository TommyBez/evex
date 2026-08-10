import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildCodeowners, buildRegistry } from '../scripts/lib/registry-builder.mts'

let workDir: string
let agentsDir: string

interface AgentFixtureOptions {
  dependencies?: Record<string, string>
  registryOverrides?: Record<string, unknown>
}

async function writeAgentFixture(
  slug: string,
  options: AgentFixtureOptions = {},
): Promise<string> {
  const dependencies = options.dependencies ?? { eve: '^0.31.3' }
  const agentRoot = path.join(agentsDir, slug)
  await fs.mkdir(path.join(agentRoot, 'agent'), { recursive: true })

  await fs.writeFile(
    path.join(agentRoot, 'agent', 'agent.ts'),
    'export default {}\n',
  )
  await fs.writeFile(path.join(agentRoot, 'README.md'), `# ${slug}\n`)
  await fs.writeFile(
    path.join(agentRoot, 'package.json'),
    JSON.stringify({ name: slug, author: 'octocat', dependencies }, null, 2),
  )

  const registry = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    items: [
      {
        name: slug,
        type: 'registry:item',
        title: slug,
        description: 'A test agent.',
        author: 'octocat',
        categories: ['general'],
        dependencies: Object.entries(dependencies).map(
          ([name, range]) => `${name}@${range}`,
        ),
        files: [
          {
            path: 'agent/agent.ts',
            type: 'registry:file',
            target: '~/agent/agent.ts',
          },
          {
            path: 'README.md',
            type: 'registry:file',
            target: '~/agent/README.md',
          },
        ],
        meta: {
          slug,
          category: 'general',
          createdAt: '2026-06-22T00:00:00.000Z',
          updatedAt: '2026-06-22T00:00:00.000Z',
        },
        ...options.registryOverrides,
      },
    ],
  }
  await fs.writeFile(
    path.join(agentRoot, 'registry.json'),
    JSON.stringify(registry, null, 2),
  )

  return agentRoot
}

beforeEach(async () => {
  workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'evex-registry-test-'))
  agentsDir = path.join(workDir, 'agents')
  await fs.mkdir(agentsDir, { recursive: true })
})

afterEach(async () => {
  await fs.rm(workDir, { recursive: true, force: true })
})

describe('buildRegistry', () => {
  it('builds a catalog and embeds file content for a valid agent', async () => {
    await writeAgentFixture('valid-agent')

    const result = await buildRegistry(agentsDir)

    expect(result.errors).toEqual([])
    expect(result.agentSlugs).toEqual(['valid-agent'])
    expect(result.catalog.items).toHaveLength(1)
    for (const file of result.catalog.items[0]?.files ?? []) {
      expect(file.content).toBeUndefined()
    }
    const item = result.itemsByName['valid-agent']
    expect(
      item?.files.some((file) => file.content?.includes('export default {}')),
    ).toBe(true)
  })

  it('maps every agent directory to its author in CODEOWNERS', async () => {
    await writeAgentFixture('owned-agent')

    const result = await buildRegistry(agentsDir)
    const codeowners = buildCodeowners(result.itemsByName, 'fallback-owner')

    expect(codeowners).toContain('* @fallback-owner')
    expect(codeowners).toContain('/registry/owned-agent/ @octocat')
  })

  it('reports a file that exists on disk but is not declared', async () => {
    const agentRoot = await writeAgentFixture('undeclared-file')
    await fs.writeFile(
      path.join(agentRoot, 'agent', 'extra.ts'),
      'export const extra = true\n',
    )

    const result = await buildRegistry(agentsDir)

    expect(result.errors.join('\n')).toContain(
      '"agent/extra.ts" exists on disk but is not declared',
    )
  })

  it('reports a declared file that is missing on disk', async () => {
    const agentRoot = await writeAgentFixture('missing-file')
    await fs.rm(path.join(agentRoot, 'agent', 'agent.ts'))

    const result = await buildRegistry(agentsDir)

    expect(result.errors.join('\n')).toContain(
      '"agent/agent.ts" does not exist on disk',
    )
  })

  it('reports env vars used without a matching .env.example entry', async () => {
    const agentRoot = await writeAgentFixture('env-agent')
    await fs.writeFile(
      path.join(agentRoot, 'agent', 'agent.ts'),
      'export const key = process.env.MY_SECRET\n',
    )

    const result = await buildRegistry(agentsDir)

    expect(result.errors.join('\n')).toContain('MY_SECRET')
  })

  it('reports registry.json dependencies that diverge from package.json', async () => {
    await writeAgentFixture('dep-mismatch', {
      registryOverrides: {
        dependencies: ['eve@^0.31.3', 'zod@4.3.6'],
      },
    })

    const result = await buildRegistry(agentsDir)

    expect(result.errors.join('\n')).toContain(
      '"zod@4.3.6" is missing from package.json',
    )
  })

  it('reports a version mismatch for a shared dependency', async () => {
    await writeAgentFixture('version-skew', {
      dependencies: { eve: '^0.31.3', zod: '4.4.3' },
      registryOverrides: {
        dependencies: ['eve@^0.31.3', 'zod@4.3.6'],
      },
    })

    const result = await buildRegistry(agentsDir)

    expect(result.errors.join('\n')).toContain('version mismatch')
  })

  it('reports agents pinning different eve versions', async () => {
    await writeAgentFixture('eve-a', { dependencies: { eve: '^0.31.3' } })
    await writeAgentFixture('eve-b', { dependencies: { eve: '^0.19.0' } })

    const result = await buildRegistry(agentsDir)

    expect(result.errors.join('\n')).toContain(
      'all agents must pin the same "eve" version',
    )
  })

  it('reports schema violations with the agent slug', async () => {
    await writeAgentFixture('bad-meta', {
      registryOverrides: {
        meta: {
          slug: 'bad-meta',
          category: 'general',
          createdAt: 'not-a-date',
          updatedAt: '2026-06-22T00:00:00.000Z',
        },
      },
    })

    const result = await buildRegistry(agentsDir)

    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors.join('\n')).toContain('bad-meta')
  })

  it('reports an item name that does not match the folder slug', async () => {
    await writeAgentFixture('folder-slug', {
      registryOverrides: { name: 'other-name' },
    })

    const result = await buildRegistry(agentsDir)

    expect(result.errors.join('\n')).toContain('must match the agent folder')
  })
})
