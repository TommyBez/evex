import path from 'node:path'
import { loadRegistry, loadRegistryItem } from 'shadcn/registry'

export const EVEX_REGISTRY_NAME = 'evex-new'
export const EVEX_REGISTRY_NAMESPACE = '@evex-new'

const REGISTRY_FILE = 'registry.json'

function getRegistryCwd(): string {
  const cwd = process.cwd()
  const isWebAppCwd =
    path.basename(cwd) === 'web' && path.basename(path.dirname(cwd)) === 'apps'

  return isWebAppCwd ? path.resolve(cwd, '../..') : cwd
}

function getRegistryLoadOptions() {
  return {
    cwd: getRegistryCwd(),
    registryFile: REGISTRY_FILE,
  }
}

export async function loadEvexRegistry() {
  return await loadRegistry(getRegistryLoadOptions())
}

export async function loadEvexRegistryItem(name: string) {
  return await loadRegistryItem(name, getRegistryLoadOptions())
}
