import { defineSchedule } from "eve/schedules";

import { watchConfig } from "../lib/watch-config.js";

export default defineSchedule({
  cron: watchConfig.cron,
  markdown: `Run the scheduled competitor intel watch.

1. Call load_watch_config. If it reports missingEnv or an empty URL list, stop and report the missing configuration. Do not invent URLs, scores, excerpts, or recipients.
2. For every URL in the returned watch list, call fetch_competitor_page. If the tool returns blockedByRobots or ok=false, record the skip and continue to the next URL. Never fetch a URL that is not on the watch list.
3. For every successful fetch, call diff_page_snapshot with the returned text, hash, and fetchedAt. Persist happens inside that tool. First-seen pages are baselines and must not be treated as alerts.
4. Keep only changes where clearsThreshold is true. Score and changedChars already come from the tool — do not invent a different score.
5. If no change cleared the thresholds, report that nothing is being delivered and do not call send_digest.
6. If one or more changes cleared the thresholds, call preview_digest with those changes, then send_digest with confirmSend=true and a stable idempotencyKey derived from today's date (for example competitor-intel-monitor-YYYY-MM-DD). Reuse the same key if the step is retried.
7. If send_digest returns sent=false with an error, report that the digest was not delivered. Do not retry send_digest in the same run.

Never claim a page changed unless diff_page_snapshot said it changed. Never send when confirmSend is not true.`,
});
