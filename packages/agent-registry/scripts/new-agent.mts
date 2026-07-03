import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const EVE_VERSION_SOURCE_AGENT = 'code-reviewer'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(scriptDir, '..')
const agentsDir = path.join(packageRoot, '..', '..', 'registry')

function titleizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

async function readEveRange(): Promise<string> {
  const referencePackagePath = path.join(
    agentsDir,
    EVE_VERSION_SOURCE_AGENT,
    'package.json',
  )
  try {
    const referencePackage = JSON.parse(
      await fs.readFile(referencePackagePath, 'utf8'),
    ) as { dependencies?: Record<string, string> }
    return referencePackage.dependencies?.eve ?? 'latest'
  } catch {
    return 'latest'
  }
}

function buildPackageJson(slug: string, author: string, eveRange: string) {
  return {
    name: slug,
    version: '0.1.0',
    private: true,
    type: 'module',
    engines: {
      node: '>=24',
    },
    scripts: {
      dev: 'eve dev',
      eval: 'eve eval',
      'eve:build': 'eve build',
      info: 'eve info --json',
      start: 'eve start',
      typecheck: 'tsc --noEmit --pretty false',
    },
    dependencies: {
      eve: eveRange,
    },
    devDependencies: {
      '@types/node': '^24',
      typescript: '5.7.3',
    },
    author,
  }
}

const TSCONFIG_TEMPLATE = `{
  "extends": "../tsconfig.agent.json",
  "include": ["agent/**/*.ts", "evals/**/*.ts"]
}
`

function buildReadme(slug: string): string {
  const title = titleizeSlug(slug)
  return `# ${title}

Describe what this agent does in one or two sentences. This paragraph becomes
the registry description shown on evex.sh.

## Setup

\`\`\`bash
npx shadcn@latest add @evex/${slug}
\`\`\`
`
}

const AGENT_TEMPLATE = `import { defineAgent } from "eve";

export default defineAgent({
  model: "deepseek/deepseek-v4-flash",
});
`

function buildInstructions(slug: string): string {
  return `# ${titleizeSlug(slug)}

Describe the agent's role, the tasks it handles, and the boundaries it must
respect. These instructions are the agent's system prompt.
`
}

const EVALS_CONFIG_TEMPLATE = `import { defineEvalConfig } from "eve/evals";

export default defineEvalConfig({
  timeoutMs: 120_000,
});
`

function buildSmokeEval(slug: string): string {
  return `import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  name: "${slug}-introduces-itself",
  input: "What can you help me with?",
  expect: [includes("help")],
});
`
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function main(): Promise<void> {
  const slug = process.argv.at(2)
  const author = process.argv.at(3)

  if (!(slug && author)) {
    throw new Error(
      'Usage: pnpm --filter @evex/agent-registry registry:new <agent-slug> <github-username>',
    )
  }

  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`"${slug}" is not a valid slug (lowercase kebab-case).`)
  }

  const agentRoot = path.join(agentsDir, slug)
  if (await fileExists(agentRoot)) {
    throw new Error(`${agentRoot} already exists.`)
  }

  const eveRange = await readEveRange()

  await fs.mkdir(path.join(agentRoot, 'agent'), { recursive: true })
  await fs.mkdir(path.join(agentRoot, 'evals'), { recursive: true })

  await fs.writeFile(
    path.join(agentRoot, 'package.json'),
    `${JSON.stringify(buildPackageJson(slug, author, eveRange), null, 2)}\n`,
  )
  await fs.writeFile(path.join(agentRoot, 'tsconfig.json'), TSCONFIG_TEMPLATE)
  await fs.writeFile(path.join(agentRoot, 'README.md'), buildReadme(slug))
  await fs.writeFile(path.join(agentRoot, 'agent', 'agent.ts'), AGENT_TEMPLATE)
  await fs.writeFile(
    path.join(agentRoot, 'agent', 'instructions.md'),
    buildInstructions(slug),
  )
  await fs.writeFile(
    path.join(agentRoot, 'evals', 'evals.config.ts'),
    EVALS_CONFIG_TEMPLATE,
  )
  await fs.writeFile(
    path.join(agentRoot, 'evals', `${slug}.eval.ts`),
    buildSmokeEval(slug),
  )

  process.stdout.write(`Created ${agentRoot}.

Next steps:
  1. Implement the agent under ${slug}/agent/ and update README.md.
  2. Add runtime dependencies to package.json.
  3. Run: pnpm --filter @evex/agent-registry registry:scaffold ${slug}
  4. Review registry.json (categories, meta.category), then run:
     pnpm --filter @evex/agent-registry generate
`)
}

await main()
