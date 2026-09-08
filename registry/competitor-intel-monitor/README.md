# Competitor Intel Monitor

Scheduled competitor URL monitor that diffs pages and delivers scored Slack or email digests.

It runs on a cron schedule, fetches each configured URL only when that origin's `robots.txt` allows it, diffs the page against a persistent snapshot store, and delivers a digest only when a change clears your alert thresholds.

## What it does

1. **Watch on a schedule** — `watch-competitor-pages` fires on `COMPETITOR_INTEL_CRON` (default `0 8 * * *` UTC).
2. **Fetch with robots.txt** — `fetch_competitor_page` loads `{origin}/robots.txt` first and skips disallowed or unreachable robots files.
3. **Diff against a store** — `diff_page_snapshot` compares normalized text to the last snapshot (JSON file or optional Upstash Redis) and writes the new snapshot.
4. **Gate on thresholds** — delivery happens only when `score >= COMPETITOR_INTEL_ALERT_MIN_SCORE` and `changedChars >= COMPETITOR_INTEL_ALERT_MIN_CHANGED_CHARS`. First-seen pages are baselines, not alerts.
5. **Preview, then send** — `preview_digest` builds the Slack and email draft. `send_digest` requires `confirmSend: true` and a stable `idempotencyKey` so a replayed step does not duplicate delivery.

## Installation

```bash
npx shadcn@latest add @evex/competitor-intel-monitor
```

## Configuration

Copy `.env.example` into your Eve app environment.

### URL list and schedule

- `COMPETITOR_INTEL_URLS` — comma-separated `https` URLs to watch.
- `COMPETITOR_INTEL_URLS_FILE` — optional JSON (`{ "urls": [], "alert": { "minScore": 25, "minChangedChars": 40 } }`) or a text file with one URL per line. URLs are unioned with the env list.
- `COMPETITOR_INTEL_CRON` — 5-field cron (UTC on Vercel). Defaults to `0 8 * * *`.
- `COMPETITOR_INTEL_USER_AGENT` — sent on page and robots.txt fetches. Defaults to `EveCompetitorIntelMonitor/1.0`.

### Alert thresholds

- `COMPETITOR_INTEL_ALERT_MIN_SCORE` — 0–100. Score is `round(100 * changedChars / max(beforeLength, afterLength, 1))`. Defaults to `25`.
- `COMPETITOR_INTEL_ALERT_MIN_CHANGED_CHARS` — minimum added+removed character weight. Defaults to `40`.

### Persistent store

- `COMPETITOR_INTEL_STORE_PATH` — JSON file for snapshots. Defaults to `.data/competitor-intel-store.json`. Use a durable volume in production.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — when both are set, snapshots are stored in Redis instead of the file.

### Optional Slack (Vercel Connect)

Uses the Eve Slack channel (`agent/channels/slack.ts`) with Vercel Connect.
Create a Slack connector and attach triggers to `/eve/v1/slack`
(`vercel connect create slack --triggers`, or `eve add channel/slack`).

- `COMPETITOR_INTEL_SLACK_CONNECT_UID` — Connect Slack connector UID.
- `COMPETITOR_INTEL_SLACK_CHANNEL_ID` — Slack channel id for the digest.

Leave either empty to skip Slack. `send_digest` still pauses for Eve
approval before the channel send.

### Email digest (Resend)

- `RESEND_API_KEY` — Resend API key.
- `COMPETITOR_INTEL_DIGEST_FROM` — sender address verified in Resend.
- `COMPETITOR_INTEL_DIGEST_TO` — comma-separated recipient addresses.
- `COMPETITOR_INTEL_DIGEST_SUBJECT` — subject prefix. Defaults to `Competitor intel digest`.

At least one delivery target (Slack Connect UID + channel id, or a complete email trio) is required before `send_digest` will send. Sending is two-step: `preview_digest`, then `send_digest` with `confirmSend: true` and an `idempotencyKey` such as `competitor-intel-monitor-YYYY-MM-DD`. `send_digest` always pauses for Eve human approval before Slack or Resend.

## Smoke test

1. Set at least one URL in `COMPETITOR_INTEL_URLS` and either Slack Connect (UID + channel id) or Resend + from/to.
2. Trigger the schedule in dev:

   ```bash
   curl -X POST http://localhost:3000/eve/v1/dev/schedules/watch-competitor-pages
   ```

3. First run stores baselines and should not send. A later run with a real page change that clears the thresholds should call `preview_digest`. Sending still requires `confirmSend: true`.

## Troubleshooting

- **`notConfigured: missingEnv COMPETITOR_INTEL_URLS`** — no https URLs in env or the config file.
- **`blockedByRobots`** — that origin's robots.txt disallows this user-agent, or robots.txt could not be fetched. The agent skips the page.
- **`clearsThreshold: false`** — the page changed but stayed under `COMPETITOR_INTEL_ALERT_MIN_SCORE` or `COMPETITOR_INTEL_ALERT_MIN_CHANGED_CHARS`.
- **`notConfirmed: true`** — `send_digest` was called without `confirmSend: true`.
- **Slack skipped** — `COMPETITOR_INTEL_SLACK_CONNECT_UID` or `COMPETITOR_INTEL_SLACK_CHANNEL_ID` is empty. That is optional when email is configured.
- **No Slack or email arrives** — the agent only sends after `preview_digest` and `send_digest` with `confirmSend: true`, and after Eve approval. Confirm the Connect UID and channel id, or that `COMPETITOR_INTEL_DIGEST_FROM` is a verified Resend sender.

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
```

Run `pnpm info` to inspect the Eve surface and `pnpm eve:build` before opening a PR.
