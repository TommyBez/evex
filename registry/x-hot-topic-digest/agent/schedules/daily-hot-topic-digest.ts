import { defineSchedule } from "eve/schedules";

import { hotTopicConfig } from "../lib/hot-topic-config.js";

export default defineSchedule({
  cron: hotTopicConfig.dailyCron,
  markdown: `Run the daily X hot topic digest.

1. Use scan_x_profiles to scan every handle configured in X_HOT_TOPIC_HANDLES, scoped to the last ${hotTopicConfig.lookbackHours} hours (X_HOT_TOPIC_LOOKBACK_HOURS). Only treat posts inside the lookback window as hot-topic candidates.
2. Surface up to ${hotTopicConfig.maxHotTopics} hot topics from those posts.
3. For each topic, call research_hot_topics with focused keyword queries.
4. Compose an HTML digest and call preview_digest_email to review the exact recipients, sender, subject, and HTML.
5. To send for real, call send_digest_email with confirmSend=true and a stable idempotencyKey derived from today's date (for example x-hot-topic-digest-YYYY-MM-DD). Reuse the same idempotencyKey if the step is retried so a replayed send never duplicates the email.

If any required environment variable is missing (X_BEARER_TOKEN, PARALLEL_API_KEY, RESEND_API_KEY, X_HOT_TOPIC_DIGEST_FROM, X_HOT_TOPIC_DIGEST_TO), stop and report the missing configuration. Do not invent handles, topics, sources, or recipients. Never call send_digest_email without confirmSend=true and an idempotencyKey.`,
});
