import generatedCatalog from '../generated/catalog.json'
import type { RegistryCatalog } from './types'

// Lightweight entry point that exposes only the catalog metadata, without
// pulling in the per-item file loaders. Import this (as
// `@evex/agent-registry/catalog`) from bundles where size matters, e.g. the
// web app middleware.
//
// The generator validates every item against the Zod schema before emitting
// the artifacts, so the JSON can be trusted to match the public types (the
// contract tests in tests/contract.test.ts re-verify this on every run).
const catalog = generatedCatalog as unknown as RegistryCatalog

export function getRegistryCatalog(): RegistryCatalog {
  return catalog
}
