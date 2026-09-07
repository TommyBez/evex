---
name: competitor-intel-watch
description: Scheduled competitor URL watch with robots.txt, snapshot diffs, threshold gating, and digest delivery.
---

Use this skill on every scheduled watch and any chat request to run the monitor.

## Order of work

1. Call `load_watch_config`. The URL list and thresholds come from environment variables and an optional config file. Never invent a URL.
2. Fetch each listed URL with `fetch_competitor_page`. That tool loads `{origin}/robots.txt` first and skips the page when robots disallows this user-agent or when robots.txt cannot be reached.
3. Diff each successful fetch with `diff_page_snapshot`. The tool writes the new snapshot to the persistent store (JSON file or Upstash Redis). A first-seen URL is a baseline, score 0, not an alert.
4. Deliver only rows where `clearsThreshold` is true. Both `score >= COMPETITOR_INTEL_ALERT_MIN_SCORE` and `changedChars >= COMPETITOR_INTEL_ALERT_MIN_CHANGED_CHARS` must pass. The score is `round(100 * changedChars / max(beforeLength, afterLength, 1))`, capped at 100. Do not invent another metric.
5. Preview with `preview_digest`, then send with `send_digest` only when `confirmSend` is true and an `idempotencyKey` such as `competitor-intel-monitor-YYYY-MM-DD` is set.

## Hard stops

- Empty watch list or missing delivery config: report `missingEnv` and stop.
- `blockedByRobots`: skip that URL. Do not retry with a different user-agent.
- No threshold-clearing changes: do not call `send_digest`.
- `send_digest` without `confirmSend=true`: the tool refuses. Review the preview first.
- `sent: false` with an error: the digest was not delivered. Do not claim it was sent.
