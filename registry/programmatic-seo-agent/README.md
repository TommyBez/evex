# Programmatic SEO Agent

A scheduled Eve agent that grows a product's organic traffic with programmatic SEO: every week it reads the product's GitHub repository, discovers and validates keyword opportunities with [DataForSEO](https://dataforseo.com), researches each target with the [Parallel](https://parallel.ai/) web search API, generates a batch of SEO-optimized pages that match the repo's content conventions, and opens a pull request for human review.

It never merges anything itself, never writes outside the configured content directory, and skips a week entirely when no keyword clears the search-volume bar — quality over quantity, by design.

## What it does

1. **Checks out the product repo into the sandbox** — at session start the sandbox clones `PSEO_GITHUB_REPO` into `/workspace/repo` using eve's credential brokering, so the GitHub token is injected at the firewall and never enters the sandbox process. The agent explores the real tree with the built-in `bash`/`glob`/`grep`/`read_file` tools and writes generated pages into the checkout, so pages match the existing content format (extension, frontmatter, components, internal links).
2. **Discovers keywords** — `discover_keywords` expands product-derived seeds through the DataForSEO Labs `keyword_ideas` endpoint, returning volume, difficulty, intent, and CPC.
3. **Validates page patterns** — `validate_keywords` checks the exact template permutations (for example `<product> for <persona>`) against Google Ads search volumes before any page is written; anything below `PSEO_MIN_SEARCH_VOLUME` is dropped.
4. **Researches each target** — `research_keyword` calls the Parallel Search API with focused queries and returns ranked excerpts with provenance; every factual claim on a page must trace back to them.
5. **Generates pages with a vertical skill** — the bundled `programmatic-seo` skill encodes the playbook catalog (comparisons, integrations, use cases, glossaries, …), keyword selection rules, and a strict page-quality bar (unique value per page, hub-and-spoke internal linking, no doorway pages).
6. **Publishes as a pull request from the sandbox** — the agent works like a developer inside its checkout: it creates the idempotent weekly branch (`pseo/<year>-w<week>`), stages only the target directory, commits, pushes, and opens the PR with a `curl` call to the GitHub REST API. Re-running the same week pushes to the same branch and updates the same PR instead of duplicating it.

## Architecture notes

All GitHub interaction happens inside the sandbox, following the same pattern eve's own GitHub channel uses for its sandbox checkout: the token is brokered at the sandbox firewall (a per-domain header transform injects Basic auth on `github.com` for git and Bearer auth on `api.github.com` for the PR API), so it never enters the sandbox process, never appears in command lines or `.git/config`, and can never leak into a generated page or PR body. The agent clones, explores, writes, commits, pushes, and opens the pull request with ordinary `git` and `curl` — no bespoke GitHub tool.

Guardrails are behavioral rather than enforced in code: instructions pin the agent to `pseo/*` branches and the target directory, and the PR is the human review gate. Protecting the default branch (required reviews, no direct pushes) is the repository maintainer's responsibility via branch protection rules — the token you configure is only as powerful as you make it, so a fine-grained token scoped to Contents + Pull requests is recommended.

DataForSEO and Parallel are wrapped as authored tools rather than OpenAPI/MCP connections for the same reason the existing registry agents do it: the tools inject the configured location/language/thresholds and return trimmed, model-sized outputs instead of raw API payloads.

## Installation

```bash
npx shadcn@latest add @evex/programmatic-seo-agent
```

## Configuration

Copy `.env.example` into your Eve app environment and fill in the values.

### Product repository (GitHub)

- `PSEO_GITHUB_REPO` — the product repository that receives the pages, as `owner/repo`.
- `PSEO_GITHUB_TOKEN` — fine-grained personal access token (or GitHub App installation token) with **Contents: read/write** and **Pull requests: read/write** on that repository.
- `PSEO_TARGET_DIR` — directory the agent writes pages into. Defaults to `content/programmatic`.

### Schedule and batch size

- `PSEO_WEEKLY_CRON` — 5-field cron expression (UTC on Vercel). Defaults to `0 7 * * 1` (Mondays at 07:00 UTC).
- `PSEO_MAX_PAGES_PER_RUN` — max pages per weekly batch. Defaults to `20`.
- `PSEO_MIN_SEARCH_VOLUME` — minimum monthly search volume for a keyword to earn a page. Defaults to `30`.

### Keyword data (DataForSEO)

- `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` — API credentials from [app.dataforseo.com](https://app.dataforseo.com/api-access). Both keyword tools use them via Basic auth.
- `PSEO_LOCATION_CODE` — DataForSEO location code. Defaults to `2840` (United States).
- `PSEO_LANGUAGE_CODE` — language code for keyword data. Defaults to `en`.

DataForSEO was chosen over scraping-oriented providers because it exposes purpose-built REST endpoints for keyword ideas and Google Ads search volumes with per-request pricing and no browser infrastructure.

### Web research (Parallel)

- `PARALLEL_API_KEY` — Parallel API key from [platform.parallel.ai](https://platform.parallel.ai).
- `PSEO_SEARCH_MODE` — Parallel search mode: `turbo`, `basic`, or `advanced`. Defaults to `basic`.
- `PSEO_SEARCH_MAX_RESULTS` — max Parallel results per keyword. Defaults to `5`.

## Smoke test

1. Set `PSEO_GITHUB_REPO`, `PSEO_GITHUB_TOKEN`, `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`, and `PARALLEL_API_KEY`.
2. Trigger the schedule while iterating in dev:

   ```bash
   curl -X POST http://localhost:3000/eve/v1/dev/schedules/weekly-programmatic-seo
   ```

3. The agent explores the checkout, selects keywords, writes pages into `/workspace/repo/<PSEO_TARGET_DIR>`, then pushes a `pseo/<year>-w<week>` branch and opens a pull request. Review that PR — nothing is merged automatically.

## Troubleshooting

- **`authRequired: missingEnv DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD`** — DataForSEO credentials are missing.
- **`authRequired: missingEnv PARALLEL_API_KEY`** — the Parallel API key is missing.
- **`notConfigured: missingEnv PSEO_GITHUB_REPO`** — the repo is missing or not in `owner/repo` form.
- **`git push` fails with 403** — the token lacks Contents write access on the repo, or the sandbox backend does not support credential brokering.
- **PR creation via `curl` returns 401/403** — the token lacks Pull requests write access, or the request went to a host other than `api.github.com` (only `github.com` and `api.github.com` carry brokered auth).
- **The weekly run reports "skipped"** — no keyword cleared `PSEO_MIN_SEARCH_VOLUME` after deduplication and coverage checks. This is intended behavior, not a failure.
- **HTTP 404 from GitHub** — the token cannot see the repo, or `PSEO_GITHUB_REPO` is wrong.
- **`/workspace/repo` is missing in the sandbox** — the session-start clone failed: check `PSEO_GITHUB_REPO`, `PSEO_GITHUB_TOKEN`, and that the sandbox backend supports credential brokering (Vercel Sandbox does; plain local Docker does not inject the brokered header).

## Development

```bash
pnpm install
pnpm dev
```

Run `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.
