import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildIndexNowPayload,
  INDEXNOW_KEY,
  INDEXNOW_SITE_URL,
  listIndexNowAgentsFromCatalog,
  listIndexNowUrls,
  parseIndexNowKeyFile,
  submitIndexNow,
} from '../lib/indexnow.ts'
import { listLearnPages } from '../lib/learn-content.ts'

const DRY_RUN_FLAG = '--dry-run'
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(scriptDir, '..')
const keyFilePath = path.join(webRoot, 'public', `${INDEXNOW_KEY}.txt`)
const catalogPath = path.resolve(
  webRoot,
  '../../packages/agent-registry/generated/catalog.json',
)

interface RegistryCatalogFile {
  items: { meta: { slug: string } }[]
}

async function readCatalog(): Promise<RegistryCatalogFile> {
  try {
    const contents = await readFile(catalogPath, 'utf8')
    return JSON.parse(contents) as RegistryCatalogFile
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error'
    throw new Error(
      `Unable to read ${catalogPath}. Run pnpm install first (${reason}).`,
    )
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes(DRY_RUN_FLAG)
  const key = parseIndexNowKeyFile(await readFile(keyFilePath, 'utf8'))
  const agents = listIndexNowAgentsFromCatalog(await readCatalog())
  const learnPages = listLearnPages()
  const urls = listIndexNowUrls(INDEXNOW_SITE_URL, agents, learnPages)
  const payload = buildIndexNowPayload(urls, key, INDEXNOW_SITE_URL)

  if (dryRun) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`)
    return
  }

  const result = await submitIndexNow({
    key,
    siteUrl: INDEXNOW_SITE_URL,
    urls,
  })

  if (result.status === 'error') {
    process.stderr.write(`${result.message}\n`)
    process.exitCode = 1
    return
  }

  process.stdout.write(
    `Submitted ${result.count} URLs to IndexNow (HTTP ${result.httpStatus}). keyLocation=${payload.keyLocation}\n`,
  )
}

await main()
