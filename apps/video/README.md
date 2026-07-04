# @evex/video

Remotion app that produces a launch video for every agent in the evex registry, built on [remocn](https://remocn.dev) components (the full remocn catalog is installed under `src/components/remocn`).

Each agent in `registry/<slug>` gets one 1280×720 @ 30fps composition (~14s) with three beats:

1. **Intro** — kicker, agent name, and category over a muted neuro-noise shader.
2. **Payoff** — one benefit line with the key phrase shifting to the category accent color.
3. **Install CTA** — a terminal typing `npx shadcn@latest add @evex/<slug>`, closing on `evex.sh`.

## Commands

```bash
pnpm --filter @evex/video dev          # Remotion Studio (preview all compositions)
pnpm --filter @evex/video render <slug> out/<slug>.mp4   # render one agent video
pnpm --filter @evex/video render:all   # render every agent video into out/
```

Composition ids match the agent slugs (`code-reviewer`, `x-draft-assistant`, …).

## Adding or editing a video

Agent copy lives in `src/data/agents.ts` — title, category (drives the accent color), the payoff line (`before` / `highlight` / `after`), and the file count shown in the terminal beat. Add an entry there when a new agent lands in `registry/`; the composition is registered automatically from that list in `src/root.tsx`.

## remocn components

All remocn registry items are installed (they are owned code, not a dependency):

```bash
pnpm dlx shadcn@latest add @remocn/<name>   # run inside apps/video
```

Components land in `src/components/remocn`, the shared core in `src/lib/remocn-ui`. Both directories are excluded from biome (vendored code). The `@remocn` registry is configured in `components.json`.
