---
name: evex-agent-authoring
description: Use when creating, modifying, or reviewing an installable Eve agent under registry/<slug> in the evex repository.
---

# Evex Agent Authoring

This skill carries evex repository standards only. It never restates:

- **Eve framework semantics** — agent layout, tools, connections, channels,
  schedules, skills, evals. Read the docs shipped with the installed eve
  package (`registry/<slug>/node_modules/eve/docs/`, present after
  `pnpm registry:install`) and mirror a reference agent: list the current
  catalog (`ls registry/`) and pick the agent whose surface overlaps most —
  channels, connections, credentials, schedules, evals. Agents come and go,
  so choose from what is there now, never from memory.
- **The registry contract** — package layout, `registry.json` field rules,
  dependency/author sync, eve version pinning, slug policy, generated
  output. `CONTRIBUTIONS.md` at the repo root is canonical and matches what
  the generator enforces; consult it instead of memory.

Ground rules for every branch:

- Agents install into an existing Eve app via
  `eve add https://www.evex.sh/r/<slug>.json`. Never scaffold a standalone app
  or publish app-level project files.
- Canonical metadata and installable files are source-owned under
  `registry/<slug>/`; the runtime database is never the source of truth.
- `registry/` is its own pnpm workspace with its own lockfile. Run
  `pnpm registry:install` from the repo root before agent-local commands,
  and run agent scripts as `pnpm --dir registry --filter <slug> run
  <script>` — always with explicit `run`, since script names like `info`
  collide with pnpm builtins.
- Keep generated output (`.eve/`, `.output/`, `dist/`, `node_modules/`) and
  real credentials out of the PR. Preserve unrelated working-tree changes.

Work the steps in order; each ends on a checkable bound.

## 1. Design

Before writing code:

1. Read the relevant guides in the eve docs and inspect the chosen
   reference agent.
2. Trace one core scenario end-to-end with realistic data: what arrives,
   what the agent must already know, each decision and action in order,
   where a human must stop the flow, what returns to the user.
3. Derive the surface from the trace: every distinct action becomes a tool
   or connection, and every decision gets an owner — the model
   (instructions or skill), code (validation inside a tool), or a human
   (approval).

Done when the trace names every tool, connection, channel, schedule, and
environment variable the agent needs, and no decision is unowned.

## 2. Scaffold

```bash
pnpm --filter @evex/agent-registry registry:new <slug> <github-username>
pnpm registry:install
```

The slug is the permanent public install name — read `CONTRIBUTIONS.md`
("Slugs") before picking one. The scaffold seeds `package.json` (private
ESM, Node `>=24`, the standard script set, `author` set to the GitHub
username, the catalog-wide pinned `eve` version), `tsconfig.json` extending
`../tsconfig.agent.json`, and stub `agent/` and `evals/` files.

Done when the package contains only the directories the agent needs and
`pnpm --dir registry --filter <slug> run typecheck` passes.

## 3. Implement

Eve-side shape comes from the docs and reference agents. The evex-side
constraints:

- Installable source lives only in publishable paths: `README.md`,
  `.env.example`, `agent/**`, `evals/**`. Everything else is repo-only and
  never published.
- Declare every environment variable read by `agent/**` files in
  `.env.example`, placeholder values only (`CI` and `NODE_ENV` exempt) —
  the generator enforces coverage.
- Runtime packages go in `package.json.dependencies` (they become the
  public install list); tooling and type-only packages in
  `devDependencies`.
- Follow the repo's TypeScript, Ultracite, and reference-agent style.

Done when `pnpm --dir registry --filter <slug> run typecheck` and
`pnpm --dir registry --filter <slug> run info` succeed.

## 4. Registry item

After the source, README, and package dependencies are final:

```bash
pnpm --filter @evex/agent-registry registry:scaffold <slug>   # --force to overwrite
```

Then edit `registry.json` by hand — it is the source of truth. Review
`title`, `description`, `categories`, `meta.category`, and dates; the full
field contract is in `CONTRIBUTIONS.md` ("Editing registry.json"). The
generator enforces exact two-way sync between `registry.json.dependencies`
and `package.json.dependencies`, matching `author`, and a complete `files`
list (undeclared files on disk are errors too). Bump `meta.updatedAt`
whenever the published package changes.

Done when `pnpm --filter @evex/agent-registry generate` succeeds. It
validates everything above and writes `.github/CODEOWNERS` — commit that
diff; the JSON artifacts under `packages/agent-registry/generated/` are
gitignored, never committed or hand-edited.

## 5. Editorial docs (`meta.docs`)

Every agent ships editorial documentation in `registry.json` under
`meta.docs`. It renders on the agent's evex.sh page (About / How it works /
Use cases / Requirements / FAQ), in the `/agents/<slug>.md` markdown mirror,
and in `llms-full.txt` — it is the main body of indexable content for the
agent, so treat it as product copy, not filler.

Shape (validated by `registryItemDocsSchema`):

- `overview`: 2-3 paragraphs (40-80 words each). What the agent does, how
  you interact with it (channel/trigger), why it is useful.
- `howItWorks`: 4-6 steps, each a full sentence describing the real flow —
  name the actual channels, tools, skills, and evals in the package.
- `useCases`: 3-4 concrete scenarios (`title` + 25-50 word `body`).
- `requirements`: one entry per env var or external dependency, sourced
  from `.env.example` and `dependencies` (`[]` only if truly none).
- `faqs`: 3-5 Q&A a developer would actually ask (install, customization,
  model, limits), 20-60 word answers.

Rules: plain English prose, no markdown syntax inside strings, every claim
grounded in the package sources, mention the eve framework naturally
(once or twice, never keyword-stuffed). Bump `meta.updatedAt` whenever docs
change. The scaffold seeds placeholders — replacing all of them is part of
"done" for a new agent.

## 6. README

Write for the consumer who ran
`eve add https://www.evex.sh/r/<slug>.json`. It installs as
`~/agent/README.md`, and its title and first paragraph seed the registry
`title`/`description` shown on evex.sh. Include:

- What the agent does and the surface it runs on.
- Required channels, connectors, webhooks, permissions, and routes.
- Environment variables from `.env.example`, separated by credential type.
- Deployment or HTTPS exposure requirements.
- Smoke tests using realistic prompts or webhook events.
- Troubleshooting for the most likely setup failures.

Do not describe installing a full app from scratch. Keep all user-facing
install copy on the full `eve add https://www.evex.sh/r/<slug>.json` command;
never substitute a shadcn command, a bare slug, `components.json`, or an
unqualified registry path.

Done when every setup step matches a channel, connection, route, or
credential that exists in the code.

## 7. Security and evals

Gate the agent before validation:

- Auth on any exposed route is real; anonymous access only by explicit
  choice.
- Every tool or connection that spends money, sends messages, mutates or
  deletes external state carries an `approval` policy — mechanics in the
  eve docs; grep `registry/*/agent` for `approval` to find working
  patterns in the current catalog.
- Secrets stay out of installed files, tool output, and model context.

Add evals when behavior is easy to regress or the agent publishes external
artifacts, following an existing `registry/*/evals/` directory for
structure. Minimum bar when they exist:

- One smoke eval per core job.
- One negative eval proving the agent does not act when it should not.
- If any tool requires approval, one eval covering the pause → approve →
  resume cycle.

Done when `pnpm --dir registry --filter <slug> run eval` passes (skip when
the agent has no evals).

## 8. Validate

Rerun after every registry-affecting change — scaffold, `registry.json`
edit, installed file added, removed, or edited:

```bash
pnpm --filter @evex/agent-registry generate   # validate + artifacts + CODEOWNERS
pnpm check
pnpm typecheck
pnpm typecheck:agents
pnpm test
pnpm build
```

On a validation error, fix the source (`registry.json`, missing files,
`.env.example`, `package.json`) and rerun `generate`. CI runs this same
pipeline plus a standalone install smoke test (`pnpm install
--ignore-workspace`) for changed agents.

Done when `pnpm build` passes. If root validation is blocked by unrelated
local state, report that explicitly and keep
`pnpm --filter @evex/agent-registry run check` green — never report a gate
as passed when it did not run or did not pass.
