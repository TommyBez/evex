# X Draft Assistant

A scheduled Eve agent that scans a configured set of X (Twitter) profiles every day, surfaces hot topics from their recent posts, researches each topic with the [Parallel](https://parallel.ai/) web search API, and creates **three draft candidates** for X in [Typefully](https://typefully.com) so a human can review and publish them.

It runs on a cron schedule, reads only public posts via the X API v2, previews every draft in dry-run mode before creating anything for real, and never schedules or publishes the drafts.

## What it does

1. **Scan X profiles** — pulls recent posts (excluding retweets) from each handle in `X_HOT_TOPIC_HANDLES` using X API v2 app-only bearer auth.
2. **Surface hot topics** — clusters the posts into up to `X_HOT_TOPIC_MAX_TOPICS` themes based on recurrence and engagement.
3. **Research with Parallel** — for each topic, calls the Parallel Search API with focused keyword queries and returns ranked web sources with provenance.
4. **Draft three X post candidates** — writes exactly `X_HOT_TOPIC_DRAFT_COUNT` (default 3) distinct candidates from the researched topics. Each candidate is either a single tweet or a short thread (1-5 posts), each post at most 280 characters, each candidate a different angle on the same signal.
5. **Create drafts in Typefully** — previews every candidate with `preview_x_draft`, then creates them in Typefully through `create_x_drafts` only when `confirmCreate: true` and a stable, unique `idempotencyKey` per draft are provided. The idempotency key is held in an in-process cache and reused if Eve replays the step, so a retried create never produces a duplicate draft.

## Installation

```bash
npx shadcn@latest add https://evex.sh/r/x-draft-assistant
```

## Configuration

Copy `.env.example` into your Eve app environment and fill in the values.

### X credentials

- `X_BEARER_TOKEN` — app-only bearer token from the X Developer Console. Required to read public posts.

### Watched profiles and schedule

- `X_HOT_TOPIC_HANDLES` — comma-separated X handles to scan (with or without `@`). Example: `vercel,parallel_ai,anthropicai`.
- `X_HOT_TOPIC_DAILY_CRON` — 5-field cron expression (UTC on Vercel). Defaults to `0 8 * * *` (daily at 08:00 UTC).
- `X_HOT_TOPIC_LOOKBACK_HOURS` — lookback window in hours for posts to scan. Defaults to `24`, so each daily run only sees posts from the last 24 hours and does not repeat the same topics day over day. Set it lower for more frequent runs or higher for low-volume handles.
- `X_HOT_TOPIC_MAX_TWEETS_PER_PROFILE` — max posts fetched per profile. Defaults to `20`. Clamped to the X API maximum of 100 and the minimum of 5; values above 100 are silently lowered to 100 rather than rejected, so a misconfigured run still returns posts instead of a 400.
- `X_HOT_TOPIC_MAX_TOPICS` — max hot topics surfaced per run. Defaults to `5`.
- `X_HOT_TOPIC_SEARCH_MAX_RESULTS` — max Parallel search results per topic. Defaults to `5`.
- `X_HOT_TOPIC_SEARCH_MODE` — Parallel search mode: `turbo`, `basic`, or `advanced`. Defaults to `basic`.

### Draft candidates

- `X_HOT_TOPIC_DRAFT_COUNT` — number of distinct X draft candidates to produce per run. Defaults to `3`.
- `X_HOT_TOPIC_DRAFT_MADE_WITH_AI` — whether to label every X post with the X "made with AI" content disclosure. Defaults to `true` because the agent drafts posts with an LLM. Set to `false` only if a human rewrites the posts before publishing.
- `X_HOT_TOPIC_DRAFT_TAG` — optional Typefully tag slug to attach to every created draft. Tags must already exist in the social set; the agent does not create tags. Leave empty to skip tagging.

### Typefully credentials

- `TYPEFULLY_API_KEY` — Typefully API key from [typefully.com/?settings=api](https://typefully.com/?settings=api).
- `TYPEFULLY_SOCIAL_SET_ID` — the Typefully social set id (the account) to create drafts under. Find it by listing your social sets via the Typefully API, or copy it from the Typefully URL for the account you want to post to.

Creating drafts is a two-step, exactly-once-safe operation by design: the agent calls `preview_x_draft` first, then `create_x_drafts` with `confirmCreate: true` and a unique `idempotencyKey` per draft. The Typefully v2 API does not accept a server-side idempotency key, so the agent holds an in-process cache of successful creates keyed by the caller-provided idempotency key. A replayed Eve step with the same key returns the recorded response with `replayed: true` instead of issuing a second POST, so a retried create never duplicates a draft — as long as the replay happens in the same Node process. A replay that crosses a process boundary (serverless cold start, redeploy, restart) sees an empty cache and will POST again; a durable store (Redis, Postgres) would be needed to close that gap and is out of scope here. The recommended key is derived from the run's lookback window start (`scan_x_profiles` `windowStart`), so it is unique per run even when the schedule fires more than once a day, and stable across retries of the same run.

When `X_HOT_TOPIC_DRAFT_MADE_WITH_AI` is `true` (the default), every X post in every created draft is labeled with the X "made with AI" content disclosure, since the agent drafts posts with an LLM. Set it to `false` only if a human rewrites the posts before publishing.

### Parallel credentials

- `PARALLEL_API_KEY` — Parallel API key from [platform.parallel.ai](https://platform.parallel.ai).

## Smoke test

1. Set `X_BEARER_TOKEN`, `PARALLEL_API_KEY`, `TYPEFULLY_API_KEY`, `TYPEFULLY_SOCIAL_SET_ID`, and at least one handle in `X_HOT_TOPIC_HANDLES`.
2. Trigger the schedule while iterating in dev:

   ```bash
   curl -X POST http://localhost:3000/eve/v1/dev/schedules/daily-x-drafts
   ```

3. The agent should call `preview_x_draft` to review the three candidates. Creating is gated on `create_x_drafts` being called with `confirmCreate: true` and a unique `idempotencyKey` per draft, so a preview-only run creates nothing.
4. After the run, open Typefully for the configured social set: the three drafts should appear in `draft` status, not scheduled and not published.

## Troubleshooting

- **`authRequired: missingEnv X_BEARER_TOKEN`** — the X bearer token is missing or empty.
- **`Could not resolve X user id`** — a handle is wrong, suspended, or the app does not have access to user lookup.
- **`authRequired: missingEnv PARALLEL_API_KEY`** — the Parallel API key is missing.
- **`authRequired: missingEnv TYPEFULLY_API_KEY`** — the Typefully API key is missing.
- **`notConfigured: missingEnv TYPEFULLY_SOCIAL_SET_ID`** — no social set configured. Set `TYPEFULLY_SOCIAL_SET_ID` to the Typefully account id you want to create drafts under.
- **`notConfirmed: true`** — `create_x_drafts` was called without `confirmCreate: true`. Review the preview first, then call it with the flag set.
- **`Duplicate idempotencyKey`** — two drafts in one `create_x_drafts` call shared a key. Each draft needs its own key (e.g. `x-draft-assistant-2026-06-26T08:00:00Z-1`, `-2`, `-3`).
- **`Typefully API 404` for the social set** — `TYPEFULLY_SOCIAL_SET_ID` points at a social set the API key cannot access. Confirm the id and that the key belongs to the same user or team.
- **`Typefully API 429`** — draft creation rate limit hit. Do not retry inside the same step; defer to a later run and reuse the same idempotency keys so a successful retry does not duplicate the drafts.
- **No drafts appear in Typefully** — the agent only creates drafts when `create_x_drafts` is called with `confirmCreate: true` and a unique `idempotencyKey` per draft. Confirm the run reached the create step and that `TYPEFULLY_SOCIAL_SET_ID` matches the account you are looking at.

## X automation compliance

The agent only creates drafts — it never publishes, schedules, replies, likes, or reposts. Each run produces at most three drafts with distinct text, never duplicates, never sets a reply target unless the user explicitly asks for a reply to a specific post, and labels every X post with the "made with AI" disclosure by default (configurable via `X_HOT_TOPIC_DRAFT_MADE_WITH_AI`) since the posts are drafted by an LLM. See the `typefully-best-practices` skill loaded by the agent for the full compliance model.

## Development

```bash
pnpm install
pnpm dev
```

Run `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.
