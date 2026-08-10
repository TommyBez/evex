# X Hot Topic Digest

A scheduled Eve agent that scans a configured set of X (Twitter) profiles every day, surfaces hot topics from their recent posts, researches each topic with the [Parallel](https://parallel.ai/) web search API, and delivers an HTML digest by email through [Resend](https://resend.com).

It runs on a cron schedule, reads only public posts via the X API v2, and previews every email in dry-run mode before sending anything for real.

## What it does

1. **Scan X profiles** — pulls recent posts (excluding retweets) from each handle in `X_HOT_TOPIC_HANDLES` using X API v2 app-only bearer auth.
2. **Surface hot topics** — clusters the posts into up to `X_HOT_TOPIC_MAX_TOPICS` themes based on recurrence and engagement.
3. **Research with Parallel** — for each topic, calls the Parallel Search API with focused keyword queries and returns ranked web sources with provenance.
4. **Send a digest email** — composes a single HTML email with origin posts and research sources, previews it with `preview_digest_email`, then sends it through Resend only when `send_digest_email` is called with `confirmSend: true` and a stable `idempotencyKey` (so a replayed step never duplicates the email).

## Installation

```bash
npx shadcn@latest add @evex/x-hot-topic-digest
```

## Configuration

Copy `.env.example` into your Eve app environment and fill in the values.

### X credentials

- `X_BEARER_TOKEN` — app-only bearer token from the X Developer Console. Required to read public posts.

### Watched profiles and schedule

- `X_HOT_TOPIC_HANDLES` — comma-separated X handles to scan (with or without `@`). Example: `vercel,parallel_ai,anthropicai`.
- `X_HOT_TOPIC_DAILY_CRON` — 5-field cron expression (UTC on Vercel). Defaults to `0 8 * * *` (daily at 08:00 UTC).
- `X_HOT_TOPIC_LOOKBACK_HOURS` — lookback window in hours for posts to scan. Defaults to `24`, so each daily digest only sees posts from the last 24 hours and does not repeat the same topics day over day. Set it lower for more frequent runs or higher for low-volume handles.
- `X_HOT_TOPIC_MAX_TWEETS_PER_PROFILE` — max posts fetched per profile. Defaults to `20`.
- `X_HOT_TOPIC_MAX_TOPICS` — max hot topics surfaced per run. Defaults to `5`.
- `X_HOT_TOPIC_SEARCH_MAX_RESULTS` — max Parallel search results per topic. Defaults to `5`.
- `X_HOT_TOPIC_SEARCH_MODE` — Parallel search mode: `turbo`, `basic`, or `advanced`. Defaults to `basic`.

### Digest delivery (Resend)

- `RESEND_API_KEY` — Resend API key.
- `X_HOT_TOPIC_DIGEST_FROM` — sender email address verified in Resend.
- `X_HOT_TOPIC_DIGEST_TO` — comma-separated recipient email addresses.
- `X_HOT_TOPIC_DIGEST_SUBJECT` — email subject. Defaults to `X Hot Topic Digest`.

Sending is a two-step, non-idempotent-safe operation by design: the agent calls `preview_digest_email` first, then `send_digest_email` with `confirmSend: true` and a stable `idempotencyKey`. The idempotency key is forwarded to Resend as the `Idempotency-Key` header and reused if Eve replays the step, so a retried send never produces a duplicate email.

### Parallel credentials

- `PARALLEL_API_KEY` — Parallel API key from [platform.parallel.ai](https://platform.parallel.ai).

## Smoke test

1. Set `X_BEARER_TOKEN`, `PARALLEL_API_KEY`, `RESEND_API_KEY`, `X_HOT_TOPIC_DIGEST_FROM`, `X_HOT_TOPIC_DIGEST_TO`, and at least one handle in `X_HOT_TOPIC_HANDLES`.
2. Trigger the schedule while iterating in dev:

   ```bash
   curl -X POST http://localhost:3000/eve/v1/dev/schedules/daily-hot-topic-digest
   ```

3. The agent should call `preview_digest_email` to review the digest. Sending is gated on `send_digest_email` being called with `confirmSend: true` and an `idempotencyKey`, so a preview-only run sends nothing.

## Troubleshooting

- **`authRequired: missingEnv X_BEARER_TOKEN`** — the X bearer token is missing or empty.
- **`Could not resolve X user id`** — a handle is wrong, suspended, or the app does not have access to user lookup.
- **`authRequired: missingEnv PARALLEL_API_KEY`** — the Parallel API key is missing.
- **`notConfigured: missingEnv X_HOT_TOPIC_DIGEST_TO`** — no recipients configured. Add at least one email to `X_HOT_TOPIC_DIGEST_TO`.
- **`notConfirmed: true`** — `send_digest_email` was called without `confirmSend: true`. Review the preview first, then call it with the flag set.
- **No email arrives** — the agent only sends when `send_digest_email` is called with `confirmSend: true` and an `idempotencyKey`. Confirm `X_HOT_TOPIC_DIGEST_FROM` is a verified Resend sender.

## Development

```bash
pnpm install
pnpm dev
```

Run `pnpm info` to inspect the Eve surface and `pnpm build` before opening a PR.
