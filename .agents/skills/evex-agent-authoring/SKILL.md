---
name: evex-agent-authoring
description: Use when creating, modifying, or reviewing installable Eve agents in the evex repository under packages/agent-registry/agents/<slug>. Guides repo-specific standards for package layout, registry.json, README/install surface, env examples, validation, and alignment with the code-reviewer and postgres-data-analyst reference agents.
---

# Evex Agent Authoring

Use this skill for Evex repository standards, not for explaining the Eve
framework. Before writing code, always read the relevant guide in
`node_modules/eve/docs/`.

## Start Here

1. Inspect the closest in-repo reference agent before designing a new shape:
   - `packages/agent-registry/agents/code-reviewer/` for GitHub PR review,
     structured publishing, rate limiting, agent skills, and evals.
   - `packages/agent-registry/agents/postgres-data-analyst/` for Slack,
     Vercel Connect credentials, external data access, env parsing, and
     read-only policy enforcement.
2. Confirm the agent is meant to install into an existing Eve app. Do not create
   a standalone app scaffold or publish app-level project files.
3. Keep canonical metadata and installable files source-owned under
   `packages/agent-registry/agents/<slug>/`. Runtime database state is not the
   source of truth for agent metadata.

## Package Shape

Create each agent under:

```text
packages/agent-registry/agents/<slug>/
  .env.example       # when installed files read environment variables
  package.json
  README.md
  registry.json
  tsconfig.json
  agent/             # Eve source files; choose layout from Eve docs
  evals/             # when behavior should be regression-tested
```

Use only the directories that the agent actually needs. Keep generated output
such as `.eve/`, `.output/`, `dist/`, and `node_modules/` out of the PR.

For `package.json`:

- Use a private ESM package with Node `>=24`.
- Keep runtime packages in `dependencies` and type/tooling packages in
  `devDependencies`.
- Keep local scripts aligned with the reference agents: `build`, `check`,
  `dev`, `info`, `start`, `typecheck`, and `eval` only when evals exist.
- Put the GitHub username in `author` so scaffolding can seed `registry.json`.

## Implementation Standards

Do not restate Eve framework layout, channel, tool, connection, schedule, skill,
or eval semantics in this skill. For those decisions, read the current docs in
the installed Eve bundle at `node_modules/eve/docs/`, then compare the closest
reference agent in this repo.

After choosing the Eve-side shape, apply only Evex-specific constraints here:

- Keep installed source files inside paths the registry can publish.
- Keep runtime dependencies reflected in `registry.json.dependencies`.
- Declare every installed-file environment variable in `.env.example`.
- Make README setup steps match the actual channels, connections, routes,
  credentials, and smoke tests implemented by the agent.
- Follow the repo's TypeScript, Ultracite, and reference-agent style.

## Registry Contract

Each agent has exactly one registry item in `registry.json`.

- `name` must match the folder slug.
- `author` must be the author's GitHub username.
- `dependencies` is the public install dependency list. Keep it intentionally
  aligned with runtime dependencies; after `registry.json` exists, the generator
  does not infer it from `package.json`.
- `files` must list every installed file. Allowed source paths are `README.md`,
  `.env.example`, `agent/**`, and `evals/**`.
- Do not publish `package.json`, `tsconfig.json`, lockfiles, build output, or
  monorepo config through the registry item.
- Target `README.md` to `~/agent/README.md` and `.env.example` to
  `~/.env.example`.
- If any installed `agent/**` file reads `process.env`, include `.env.example`
  in `files` and declare every non-built-in env var there.
- Update `meta.updatedAt` when the agent's public package changes.

For a new agent, scaffold the initial registry file after the package source,
README, and package dependencies exist:

```bash
pnpm --filter @evex/agent-registry registry:scaffold <slug>
```

Then edit `registry.json` manually. Treat it as source of truth.

## README Standards

The README is installed into the consumer's Eve app, so write it for the user
who ran:

```bash
npx shadcn@latest add https://evex.sh/r/<slug>
```

Include:

- What the agent does and the surface it runs on.
- Required channels, connectors, webhooks, permissions, and routes.
- Environment variables from `.env.example`, with clear separation between
  different credential types.
- Deployment or HTTPS exposure requirements.
- Smoke tests using realistic prompts or webhook events.
- Troubleshooting for the most likely setup failures.

Do not describe installing a full app from scratch. Do not rely on the app's
`components.json` or any root registry path as the public install command.

## Generated Registry

The catalog is embedded in `packages/agent-registry/src/generated/registry.ts`,
generated from the agent sources by `scripts/generate-registry.mjs`. The
`@evex/agent-registry` build runs the generator with `--check`, so any change
to an agent's `registry.json`, installed files, or dependency list leaves the
generated file out of date and **fails the build**:

```text
src/generated/registry.ts is out of date. Run "pnpm --filter @evex/agent-registry generate".
```

After editing an agent, regenerate before committing:

```bash
pnpm --filter @evex/agent-registry generate
```

Do not hand-edit `src/generated/registry.ts`; regenerate it from sources.

## Evals And Tests

Add evals when behavior is easy to regress or when the agent publishes external
artifacts. Follow `code-reviewer/evals/` for structure.

At minimum, validate a new or changed agent with:

```bash
pnpm --filter @evex/agent-registry generate   # required: build --check fails otherwise
pnpm --filter @evex/agent-registry run check
pnpm --dir packages/agent-registry/agents/<slug> typecheck
pnpm --dir packages/agent-registry/agents/<slug> info
```

For broader changes, also run:

```bash
pnpm check
pnpm build
```

If root validation is blocked by unrelated local state, report that explicitly
and keep the narrow agent-registry validation clean. Do not pretend generation
or build succeeded when it did not.

## Pre-PR Checklist

- Read the relevant Eve docs in `node_modules/eve/docs/` and mirror the closest
  in-repo reference agent.
- Keep package shape, scripts, TypeScript style, and dependency placement
  aligned with the reference agents.
- Ensure env vars used in installed files are declared in `.env.example`.
- Ensure `registry.json.files` includes every publishable file and excludes
  app-level or generated files.
- Regenerate `packages/agent-registry/src/generated/registry.ts`.
- Verify README setup steps match the actual channel/connection code.
- Keep user-facing install copy on the `https://evex.sh/r/<slug>` path.
- Preserve unrelated working-tree changes.
