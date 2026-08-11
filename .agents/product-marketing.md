# Product Marketing Context

*Last updated: 2026-08-11*

> Auto-drafted via the product-marketing skill (Step 3) from README, homepage/docs copy, gtm/STATE.md, and the directory shortlist. Prefer this file for positioning and voice. Prefer `gtm/STATE.md` for live metrics and open GTM decisions. Tommy’s edits always win. Replaces the stale 2026-06-19 “evex-new” brief.

## Product Overview
**One-liner:** evex is the open registry for Eve agents: browse community agents, inspect every file, install with one `eve add` command.

**What it does:** evex packages reusable Eve agent configurations as shadcn-compatible registry items. Developers browse the catalog, preview every file and dependency before install, then add an agent with `eve add https://www.evex.sh/r/<slug>.json`. Authors publish by pull request so every agent stays code-owned and reviewed. After install, the agent runs from files in the project with no runtime dependency on evex.

**Product category:** Eve agent registry / shadcn-compatible agent distribution (developers search “eve agents,” “eve registry,” “install eve agent”).

**Product type:** Community registry (catalog + install + publish). Not a hosted agent runtime. Not a paid marketplace.

**Business model:** Free and open source (MIT). No paid tier today. Do not invent pricing in copy.

## Target Audience
**Target companies:** Indie developers, AI-native product teams, and engineering orgs already building on (or evaluating) Eve, Vercel’s agent framework.

**Decision-makers:** Primary: individual Eve developers and agent authors. Secondary: DevEx/platform leads and founders who want reusable agent patterns without every teammate reinventing the `agent/` folder.

**Primary use case:** Find a useful Eve agent, inspect what it will write into the project, install it with one command.

**Jobs to be done:**
- Find a ready-made Eve agent for a workflow and install it quickly.
- Evaluate what an agent will add before trusting it.
- Publish an agent so others can reuse it through a standard path.

**Use cases:**
- Add a coding, devops, productivity, research, support, marketing, or data agent to an Eve app.
- Publish under `registry/<slug>` via PR (see https://evex.sh/docs/publishing).
- Discover agents through categories, author pages, favorites, and the leaderboard.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Eve developer (User) | Speed, clarity, low setup friction | Wiring an agent from scratch is slow and uncertain | Find an agent, inspect the files, install with a repeatable command |
| Agent author (Champion) | Reach, credibility, reuse | Sharing folders via repos/snippets is manual and inconsistent | Publish once via PR, get a registry page, GitHub-tied identity |
| DevEx / platform lead (Technical influencer) | Standardization, reuse | Teams reinvent the same agent scaffolding | Common distribution path and a visible catalog |
| Eng manager / founder (Decision maker) | Faster experimentation | Agent work becomes one-off and hard to scale | Successful patterns become discoverable and reusable |

## Problems & Pain Points
**Core problem:** Reusable Eve agents are hard to discover, evaluate, standardize, and install. Without a registry, people copy folders from docs, gists, or GitHub by hand.

**Why alternatives fall short:**
- **agentcn** (closest direct): same `shadcn` install mechanic and larger star count today; thinner product surface today (catalog UX, file preview, author profiles, leaderboard, favorites, first-party publishing docs) versus evex’s full registry loop and PR-owned catalog.
- **awesome-eve / eveagents.dev-style lists:** discovery without one-command install or inspect-before-install.
- **Copy-paste from GitHub / docs:** no catalog, no preview UX, no repeatable `eve add` path; easy to miss dependencies and layout.
- Framework docs help you start; they do not solve distribution of community agents.

**What it costs them:** Slower time to first useful agent, duplicated setup, missed dependencies, low reuse, low confidence in what lands in the repo.

**Emotional tension:** Developers want a working agent, not another half-documented folder. Speed versus trust.

## Competitive Landscape
**Direct:** agentcn (shadcn-labs): same install mechanic and larger star count today; thinner product surface today versus evex’s full registry loop. Also atom-eve, eve-directory (nolly-studio), bergside/awesome-eve-agents + eveagents.dev (own CLI): competing “Eve registry / catalog” claims with thinner browse/inspect/publish loops or list+CLI hybrids.

**Secondary:** awesome-eve lists, GitHub folders, starter templates, docs snippets — discovery or one-off copy without standardized install + file preview.

**Indirect:** Build every agent from scratch, or avoid specialized agents entirely — slower experimentation and less reuse.

## Differentiation
**Key differentiators:**
- One-command install: always `eve add https://www.evex.sh/r/<slug>.json`.
- Inspect-before-install: files, dependencies, author, and command on every agent page.
- Code-owned publish path: agents live in source and ship through reviewed pull requests.
- Full product surface: browse/search/sort, author profiles, favorites, leaderboard, publishing docs.
- Uses Eve's own CLI over a standard, directly addressable registry item URL.
- After install: no runtime dependency on evex; you own the files.

**How we do it differently:** Treat agents as auditable registry items (browse → inspect → install → own), not as opaque bundles or link dumps.

**Why that's better:** Faster setup with a clearer trust surface, and a path from individual experiments to reusable, reviewable community assets.

**Why customers choose us:** Fastest path from “I need an agent for this job” to “it’s in my Eve project and I can see every file.”

## Objections
| Objection | Response |
|-----------|----------|
| “I can just copy this from GitHub.” | Copying works once. evex makes install repeatable, preserves the `agent/` layout, surfaces dependencies, and keeps the agent browseable for the next person. |
| “I do not trust community agents.” | Transparent files, GitHub-verified author identity, PR review. Inspect exactly what you add before you run the command. |
| “We are not using Eve.” | evex is Eve-native. Outside Eve, you are outside the best-fit audience today. |
| “Isn’t this just agentcn?” | Same install mechanic, different product. evex is the full registry loop (preview, profiles, leaderboard, favorites, publish-via-PR). Compete on transparency and the loop, not star count. |
| “Why so few agents / authors?” | Honest: early. Quality and the publish path matter more than inflating the catalog. Point authors to https://evex.sh/docs/publishing. |

**Anti-persona:** Non-technical end users; teams looking for a hosted agent runtime or “autonomous employee”; teams not using Eve; consumer “there’s an AI for that” browsers with no Eve context.

## Switching Dynamics
**Push:** Manual copy-paste, inconsistent folders, low discoverability, unclear dependencies, repeated reinvention.

**Pull:** One-command install through the Eve CLI, file preview, GitHub-verified authors, PR review, catalog + leaderboard.

**Habit:** Private snippets, “we’ll build it ourselves,” bookmarking random GitHub folders, defaulting to whichever recipe repo they already starred.

**Anxiety:** Agent quality, security, maintenance, fit for this project.

## Customer Language
**How they describe the problem:**
- "I want an agent that is one command away."
- "Show me what files this agent will add before I install it."
- "I need a ready-made Eve agent, not another folder to wire up."

**How they describe us:**
- "the eve agent registry"
- "Install community agents with one command"
- "Browse → inspect → install"
- "Preview every file before install, then add any agent with one eve command." (homepage)

**Words to use:** evex, Eve, registry, `eve add`, install, publish, community agents, one command, preview/inspect files, pull request, code-owned, GitHub-verified, leaderboard.

**Words to avoid:** `evex-new`, `@evex-new`; shadcn commands as public install copy; bare `eve add <slug>` without the Evex item URL; hosted agent platform; no-code; autonomous employee; plug-and-play magic; marketplace/commerce language (unless commerce becomes real); inflated “thriving community” claims while supply is still mono-author; raw DB install totals as social proof; AI clichés and stock emphasis; em dashes in drafts Tommy will publish.

**Glossary:**
| Term | Meaning |
|------|---------|
| Eve | Vercel’s OSS agent framework (eve.dev); defines the `agent/` convention |
| evex | The open registry / community distribution layer for reusable Eve agents |
| agent | Bundle of config, instructions, skills, tools, and optional subagents under `agent/` |
| registry item | shadcn-compatible package representation of an agent |
| `eve add https://www.evex.sh/r/<slug>.json` | Canonical install command |
| north star | Unique non-author users who copy an install command |

## Brand Voice
**Tone:** Developer-native, direct, concise, credible.

**Style:** Technical but readable. Prefer commands, paths, concrete workflows. No hype.

**Personality:** Precise, transparent, pragmatic, community-driven, low-fluff.

**Copy rules (Tommy / gtm STATE):**
- LinkedIn drafts in **Italian**; X drafts in **English**.
- Install command always `eve add https://www.evex.sh/r/<slug>.json`.
- Avoid AI clichés and stock emphasis phrases.
- Prefer periods/commas over em dashes in drafts Tommy will publish.
- Typefully drafts always include a suggested publish datetime + one-line rationale in a comment.
- Include a link to evex.sh or the repo in social post bodies.
- Social reply drafts are for Tommy to post; agents never publish replies.

## Proof Points
**Metrics:**
- North star (confirmed): unique non-author users who copy an install command (`agent_install_command_copied` with `viewer_is_author: false` in PostHog). Live baselines and ops numbers live in `gtm/STATE.md` only.
- Do **not** cite raw DB/`agent_install_metric` totals (~1.7k) as social proof: historically bot-exposed (registry crawlers such as BlockDex). Prefer filtered PostHog north star when it moves.
- Do **not** claim a large multi-author community while the catalog is small and mono-author (11 agents, TommyBez at last STATE refresh). Multi-author supply is the goal, not current proof.
- Visit ≠ install: after launch traffic, the story is inspect files → copy this exact command.

**Customers:** None named yet. Do not invent logos.

**Testimonials:** None captured yet. Do not invent quotes.
> "Review the generated files and configure any credentials required by the agent before running it." — product docs language (transparency, not a customer quote)

**Value themes:**
| Theme | Proof |
|-------|-------|
| Faster time-to-install | Canonical `eve add https://www.evex.sh/r/<slug>.json` on every agent page |
| Transparency before trust | Agent pages expose files, deps, author, command; docs: audit before you trust |
| Code-owned distribution | Agents in `registry/`, ship by PR; DB holds runtime state only |
| Own the files after install | No runtime dependency on evex once written |
| Author path | https://evex.sh/docs/publishing |

**Messaging risks (active):**
1. Community overclaim while supply is mono-author.
2. Poisoned install social proof from bot traffic on `/r/*`.
3. Awareness fluff over CTA: the gap after launch traffic is the trust/copy step on agent pages.

## Goals
**Business goal:** Grow both sides of the registry: more quality agents from more authors, more non-author installs, repeat publishers.

**Conversion action:** Primary (demand): non-author copies the install command (north star) and adds an agent to an Eve project. Secondary (supply): open a PR that publishes or updates an agent / land on publishing docs.

**Current metrics:** See `gtm/STATE.md` (launch day 2026-08-11 ended north star = 0; do not invent numbers here).
