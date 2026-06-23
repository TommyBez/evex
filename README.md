<p align="center">
  <img src="./apps/web/app/icon.svg" alt="evex logo" width="96" height="96" />
</p>

<h1 align="center">evex</h1>

<p align="center">
  <strong>Install community agents for the eve framework with one command.</strong><br />
  Discover agents built by the community, drop them into your app with <code>shadcn</code>, and publish your own.
</p>

<p align="center">
  <a href="https://evex.sh"><img alt="Live at evex.sh" src="https://shieldcn.dev/badge/live-evex.sh-22c55e.svg?statusDot=true" /></a>
  <a href="https://github.com/TommyBez/evex"><img alt="GitHub stars" src="https://shieldcn.dev/github/stars/TommyBez/evex.svg" /></a>
  <a href="#install-an-agent"><img alt="Install with shadcn" src="https://shieldcn.dev/badge/install-shadcn-000000.svg?logo=shadcnui&logoColor=ffffff" /></a>
  <a href="./CONTRIBUTIONS.md"><img alt="Pull requests welcome" src="https://shieldcn.dev/badge/PRs-welcome-006bff.svg" /></a>
</p>

<p align="center">
  <a href="https://evex.sh"><strong>Live -> evex.sh</strong></a>
  &nbsp;·&nbsp;
  <a href="https://evex.sh/leaderboard">leaderboard</a>
  &nbsp;·&nbsp;
  <a href="https://eve.dev/docs/introduction">eve docs</a>
  &nbsp;·&nbsp;
  <a href="./CONTRIBUTIONS.md">contributing</a>
</p>

---

**evex** is the open registry for [Eve](https://eve.dev) agents. Browse agent
configurations built by the community, add any of them to an existing Eve app
with a single `shadcn` command, and publish your own by opening a pull request —
every agent stays code-owned and reviewed.

## Highlights

- **One command to install** — `npx shadcn@latest add @evex/<agent>` drops an agent's files straight into your Eve app.
- **Code-owned and reviewed** — agents live in source and ship through pull requests; the database only holds runtime state.
- **Browse and discover** — search the catalog, filter by category, and sort by most installed, newest, or name.
- **Inspect before you install** — every agent page lists its files, dependencies, author, and install command.
- **Leaderboard and profiles** — see the most-installed agents and the authors driving them, with profiles tied to a verified GitHub identity.
- **Favorites and install metrics** — sign in with an email code or GitHub to save agents; installs are counted across the registry.

## Install an agent

Every agent has a one-line install. Add one to your project with the `shadcn`
CLI — the same command shown on each agent's page:

```bash
npx shadcn@latest add https://evex.sh/r/code-reviewer.json
```

Swap `code-reviewer` for any agent slug from the catalog. Agents span categories
like **coding**, **devops**, **productivity**, and **support** — browse them all
at [evex.sh](https://evex.sh).

## Publish an agent

Agents are added and updated by pull request, so authorship and review stay in
source control. Each agent is a package under
`packages/agent-registry/agents/<slug>` with its files, dependencies, and
author identity declared in `registry.json`. The full workflow — scaffolding,
validation, and the review checklist — is in
[CONTRIBUTIONS.md](./CONTRIBUTIONS.md).

## Registry API

| Resource | URL |
| --- | --- |
| Catalog | `https://evex.sh/r/registry.json` |
| Item | `https://evex.sh/r/{name}.json` |

The registry serves public agent metadata and files. Runtime data — installs,
favorites, profiles, and auth — lives in the web app's Postgres database.

## Built with

<p align="center">
  <img alt="Turborepo" src="https://shieldcn.dev/badge/-Turborepo-EF4444.svg?logo=turborepo&variant=branded" />
  <img alt="Next.js" src="https://shieldcn.dev/badge/-Next.js-000000.svg?logo=nextdotjs&variant=branded" />
  <img alt="React" src="https://shieldcn.dev/badge/-React-61DAFB.svg?logo=react&variant=branded" />
  <img alt="Tailwind CSS" src="https://shieldcn.dev/badge/-Tailwind_CSS-06B6D4.svg?logo=tailwindcss&variant=branded" />
  <img alt="shadcn/ui" src="https://shieldcn.dev/badge/-shadcn-000000.svg?logo=shadcnui&variant=branded" />
  <img alt="Eve" src="https://shieldcn.dev/badge/-Eve-006bff.svg?variant=branded" />
  <img alt="Drizzle ORM" src="https://shieldcn.dev/badge/-Drizzle-C5F74F.svg?logo=drizzle&variant=branded" />
  <img alt="PostgreSQL" src="https://shieldcn.dev/badge/-PostgreSQL-4169E1.svg?logo=postgresql&variant=branded" />
  <img alt="Better Auth" src="https://shieldcn.dev/badge/-Better_Auth-000000.svg?logo=betterauth&variant=branded" />
  <img alt="Vercel" src="https://shieldcn.dev/badge/-Vercel-000000.svg?logo=vercel&variant=branded" />
</p>

## Local development

```bash
pnpm install
pnpm dev          # web app on http://localhost:3000
```

```bash
pnpm check        # lint + format check (ultracite / biome)
pnpm fix          # auto-fix lint and formatting
pnpm build        # build the web app and agent packages
pnpm db:migrate   # apply database migrations (drizzle)
```

Requires Node >= 24 and pnpm. The web app reads `DATABASE_URL` (Postgres) and
better-auth settings; sign-in uses email one-time codes with optional GitHub
OAuth. See [AGENTS.md](./AGENTS.md) for the full environment and setup notes.

## Star history

<p align="center">
  <a href="https://github.com/TommyBez/evex">
    <img alt="evex star history" src="https://shieldcn.dev/chart/github/stars/TommyBez/evex.svg?color=006bff" />
  </a>
</p>

<p align="center">
  <sub>Badges &amp; charts by <a href="https://shieldcn.dev">shieldcn</a>.</sub>
</p>
