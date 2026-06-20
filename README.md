<p align="center">
  <img src="./apps/web/app/icon.svg" alt="evex-new" width="96" height="96" />
</p>

<h1 align="center">evex-new</h1>

<p align="center">
  <strong>The eve agent registry.</strong><br />
  Discover, contribute, and install standalone eve agents with a single shadcn command.
</p>

<p align="center">
  <a href="https://evex-new.sh"><strong>Live → evex-new.sh</strong></a>
  &nbsp;·&nbsp;
  <a href="https://eve.dev/docs/introduction">eve docs</a>
</p>

<p align="center">
  <a href="https://evex-new.sh"><img src="https://img.shields.io/badge/site-evex-new.sh-006bff?style=flat-square" alt="evex-new.sh" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://ui.shadcn.com"><img src="https://img.shields.io/badge/shadcn-registry-000?style=flat-square&logo=shadcnui&logoColor=white" alt="shadcn registry" /></a>
</p>

---

## What is evex-new?

[evex-new](https://evex-new.sh) is a community registry for [eve](https://eve.dev) agents. Browse code-owned agent apps, install one into a project folder in seconds, and add your own through a pull request.

```bash
# one-time setup
npx shadcn@latest registry add @evex-new=https://evex-new.sh/r/{name}.json

# install any agent app by slug
mkdir code-reviewer
cd code-reviewer
npx shadcn@latest add @evex-new/code-reviewer

pnpm install
pnpm dev
```

Direct URL installs work too:

```bash
npx shadcn@latest add https://evex-new.sh/r/code-reviewer.json
```

## Features

- **Browse** — search and filter agents by category
- **Favorites** — save agents to revisit later
- **Install** — scaffold a standalone eve app via shadcn
- **Contribute** — add or update agents through pull requests
- **Leaderboard** — see what's trending in the community

## Registry

| Resource | URL |
| --- | --- |
| Catalog | `https://evex-new.sh/r/registry.json` |
| Item template | `https://evex-new.sh/r/{name}.json` |

## Agents

Agent apps live under `apps/agents/<slug>`. The initial catalog contains:

- `code-reviewer`
- `linear-sprint-triage`
- `incident-commander`
- `github-release-scout`
- `resend-lifecycle-mailer`

To add an agent, create a new app folder with `registry.json`, include it from
the root `registry.json`, and open a pull request.

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to run the app locally.

```bash
pnpm check    # lint & format
pnpm fix      # auto-fix
pnpm build    # production build
```

## Stack

Turborepo · Next.js · React · Tailwind CSS · shadcn/ui · Eve · Drizzle · Better Auth · Vercel

---

<p align="center">
  <sub>Built for the eve ecosystem · <a href="https://evex-new.sh">evex-new.sh</a></sub>
</p>
