import { defineSchedule } from "eve/schedules";

import { hotTopicConfig } from "../lib/hot-topic-config.js";

export default defineSchedule({
  cron: hotTopicConfig.dailyCron,
  markdown: `Run the daily X draft assistant.

1. Use scan_x_profiles to scan every handle configured in X_HOT_TOPIC_HANDLES, scoped to the last ${hotTopicConfig.lookbackHours} hours (X_HOT_TOPIC_LOOKBACK_HOURS). Only treat posts inside the lookback window as hot-topic candidates.
2. Surface up to ${hotTopicConfig.maxHotTopics} hot topics from those posts.
3. For each topic, call research_hot_topics with focused keyword queries.
4. Draft exactly ${hotTopicConfig.draft.count} distinct X post candidates (single tweets or short threads, 280 chars per post, different angles) from the researched topics. Cite originating posts as https://x.com/<handle>/status/<id> only with handles and ids returned by scan_x_profiles.
5. Call preview_x_draft to review the drafts, post lengths, target social set, tag, and madeWithAi flag (defaults to true because the posts are drafted by an LLM).
6. To create the drafts in Typefully, call create_x_drafts with confirmCreate=true and a stable, unique idempotencyKey per draft. The recommended scheme is x-draft-assistant-<windowStartUtc>-<n>, where <windowStartUtc> is the windowStart value returned by scan_x_profiles (RFC3339 UTC, e.g. 2026-06-26T08:00:00Z) and <n> is the 1-based candidate index in this run. Using the lookback window start makes the key unique per run even when the schedule fires more than once a day, and stable across retries of the same run. Reuse the same key if the step is retried so a replayed create does not duplicate the draft.

If any required environment variable is missing (X_BEARER_TOKEN, PARALLEL_API_KEY, TYPEFULLY_API_KEY, TYPEFULLY_SOCIAL_SET_ID), stop and report the missing configuration. Do not invent handles, topics, sources, or draft text. Never call create_x_drafts without confirmCreate=true and a unique idempotencyKey per draft. Do not publish or schedule the drafts; the agent only creates them. Do not disable the X "made with AI" disclosure (X_HOT_TOPIC_DRAFT_MADE_WITH_AI) unless a human rewrites the posts before publishing.`,
});
