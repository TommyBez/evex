# Contributing Agents

evex agents are source-owned packages reviewed through pull requests. The
database stores runtime state only; canonical agent metadata, files,
dependencies, and author identity live in the agent package registry file.

Every rule below is enforced automatically: `registry.json` is validated
against a Zod schema (`packages/agent-registry/src/schema.ts`) by the
registry generator, and CI runs the full validation, typecheck, test, and
build pipeline on every pull request.

## Quick start

```bash
# 1. Scaffold a complete agent package skeleton
pnpm --filter @evex/agent-registry registry:new <slug> <github-username>

# 2. Implement the agent under packages/agent-registry/agents/<slug>/agent/
#    and update README.md + package.json dependencies

# 3. Generate registry.json from the package sources
pnpm --filter @evex/agent-registry registry:scaffold <slug>

# 4. Review registry.json (categories, meta.category), then validate
pnpm --filter @evex/agent-registry generate
pnpm check && pnpm typecheck && pnpm test
```

## Package layout

Each agent lives under:

```text
packages/agent-registry/agents/<slug>/
  .env.example       # required when the agent reads environment variables
  package.json
  tsconfig.json      # extends ../../tsconfig.agent.json (repo-only, not published)
  README.md
  agent/
    agent.ts
    ...
  evals/
    evals.config.ts
    *.eval.ts
  registry.json
```

The `agent/` directory contains the Eve source that will be installed into a
consumer Eve app. `README.md` is installed as the agent readme. Repo-only
files (`package.json`, `tsconfig.json`, lockfiles) are never published.

Agent packages are pnpm workspace members: `pnpm --filter <slug> typecheck`,
`dev`, `eval`, and `info` work from the repo root, and `turbo run typecheck`
covers every agent. A separate CI smoke test also installs each changed agent
with `--ignore-workspace` to prove it works standalone.

## Author identity

`registry.json` must define top-level `author` as the GitHub username of the
agent author. This is required by the schema and is the canonical public
author identity for the registry item. `package.json.author` must match when
present (the generator enforces it). User/profile enrichment in the web app
is joined only through a verified GitHub OAuth username stored on the user
account; manually edited profile links are never used for ownership.

## Dependencies

`registry.json.dependencies` (the public install list) and
`package.json.dependencies` (local development) must stay in sync: the
generator fails when a dependency is missing on either side or the versions
diverge. Keep tooling and type-only packages in `devDependencies` — those are
not published.

All agents must pin the same `eve` version; bumps happen in lockstep across
the catalog and the generator rejects skew.

## Editing registry.json

Each agent `registry.json` contains exactly one `registry:item` validated by
the schema:

- `name` and `meta.slug` must equal the agent folder slug (kebab-case).
- `title`, `description`, and `author` are required and non-empty.
- `categories` must include `meta.category`.
- `meta.createdAt` / `meta.updatedAt` are ISO datetimes.
- `dependencies` entries use the `name@range` format.
- `files` declares every installed file. Declared paths must be `README.md`,
  `.env.example`, or live under `agent/` or `evals/`, and the list must match
  the files on disk exactly — undeclared files on disk are an error, as are
  declared files that do not exist.
- `.env.example` is required when installed files read `process.env`, and it
  must declare every referenced variable.
- Unknown keys (including `meta.author`) are rejected.

Re-running `registry:scaffold` on an existing agent requires `--force`, since
it overwrites manual edits (categories, dates, curated dependency list).

## Generated output

`packages/agent-registry/src/generated/registry.ts` is **not committed**. It
is regenerated automatically on `pnpm install` (root postinstall) and by the
package `build`. After editing an agent, run
`pnpm --filter @evex/agent-registry generate` to refresh it locally; the item
endpoints embed file contents, while the catalog endpoint keeps descriptors
only.

## Validate

```bash
pnpm --filter @evex/agent-registry generate   # validate + regenerate
pnpm check                                    # lint + registry validation
pnpm typecheck                                # web app, packages, all agents
pnpm test                                     # schema/generator/contract tests
pnpm build                                    # full build
```

CI runs the same pipeline on every pull request, plus the standalone
install smoke test for changed agents.

## Review checklist

Automation covers schema shape, file/dependency sync, and env coverage.
Reviewers focus on what machines cannot judge:

- `author` really is the PR author's GitHub username.
- The agent does what the README/description claims, and instructions and
  skills are appropriate.
- Declared dependencies are reasonable for what the agent does.
- `.env.example` values are placeholders, never real credentials.
