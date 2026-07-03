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
  `npx shadcn@latest add @evex/<slug>`. Never scaffold a standalone app or
  publish app-level project files.
- Canonical metadata and installable files are source-owned under
  `registry/<slug>/`; the runtime database is never the source of truth.
- `registry/` is its own pnpm workspace with its own lockfile. Run
  `pnpm registry:install` from the repo root before agent-local commands,
  and run agent scripts as `pnpm --dir registry --filter <slug> <script>`.
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
`pnpm --dir registry --filter <slug> typecheck` passes.

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

Done when `pnpm --dir registry --filter <slug> typecheck` and
`pnpm --dir registry --filter <slug> info` succeed.

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

## 5. README

Write for the consumer who ran `npx shadcn@latest add @evex/<slug>`. It
installs as `~/agent/README.md`, and its title and first paragraph seed the
registry `title`/`description` shown on evex.sh. Include:

- What the agent does and the surface it runs on.
- Required channels, connectors, webhooks, permissions, and routes.
- Environment variables from `.env.example`, separated by credential type.
- Deployment or HTTPS exposure requirements.
- Smoke tests using realistic prompts or webhook events.
- Troubleshooting for the most likely setup failures.

Do not describe installing a full app from scratch, and keep all
user-facing install copy on the `@evex/<slug>` shadcn path — never the
app's `components.json` or a root registry path.

Done when every setup step matches a channel, connection, route, or
credential that exists in the code.

## 6. Security and evals

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

Done when `pnpm --dir registry --filter <slug> eval` passes (skip when the
agent has no evals).

## 7. Validate

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
