---
name: typefully-best-practices
description: Draft X posts through Typefully with automation compliance, character limits, and exactly-once draft creation.
---

Guidance for drafting X posts and creating Typefully drafts without violating X's
automation rules or producing duplicate drafts. Apply these rules whenever an X
draft is being authored or created through Typefully.

## X automation compliance

X's automation rules apply to anything posted through the Typefully API on behalf
of an account. The agent only creates drafts; it never publishes or schedules
them, but the same rules govern the content that lands in the queue.

- **No duplicate content across drafts in the same run.** Each of the three draft
  candidates must take a distinct angle on the same hot topic. Reusing the same
  text across drafts risks an X duplicate-content flag.
- **No unsolicited automated replies.** Never set a reply target on a draft
  unless the user explicitly asked for a reply to a specific post. The agent
  creates top-level posts only.
- **No trending manipulation.** Do not stuff hashtags or pile onto a trending
  topic to game visibility. The drafts react to a real signal from watched
  profiles, not to the trending tab.
- **No fake engagement.** The agent does not like, repost, follow, or reply. It
  only creates drafts.
- **Label AI-drafted posts.** X requires a "made with AI" label on LLM-generated
  posts. `X_HOT_TOPIC_DRAFT_MADE_WITH_AI` defaults to `true` and
  `create_x_drafts` sets `made_with_ai: true` on every X post. Only disable the
  label if a human rewrites the posts before publishing.
- **Respect rate limits.** The Typefully API rate-limits draft creation per user
  and per social set. One run produces at most three drafts; do not loop create
  calls to retry a failed draft in the same step.

See [x-automation](./references/x-automation.md) for the full compliance model.

## Exactly-once draft creation

The Typefully v2 API does not accept a server-side idempotency key, so a replayed
Eve step would normally create a second draft. The agent defends against that
with a per-draft `idempotencyKey` plus an in-process cache of successful
creates:

- Derive each key from the run, not from `Date.now()` or a fresh random value.
  A stable scheme is `x-draft-assistant-<windowStartUtc>-<n>`, where
  `<windowStartUtc>` is the `windowStart` value returned by `scan_x_profiles`
  (RFC3339 UTC start of this run's lookback window) and `<n>` is the 1-based index
  of the draft candidate within the run. Anchoring to the lookback window start
  makes the key unique per run even when the schedule fires more than once a
  day, and stable across retries of the same run.
- Each draft in a single `create_x_drafts` call must have a unique key. Duplicate
  keys inside one call are rejected before any POST is issued.
- A replayed step with the same key returns the recorded response instead of
  issuing a second POST. Failures are not cached, so the same key can be retried.
- `confirmCreate` must be `true` before any draft is created. Treat it as a
  guardrail: always call `preview_x_draft` first, then create with the flag set.

See [exactly-once](./references/exactly-once.md) for the idempotency and retry
model in detail.

## Drafting for X

X posts are short, single-purpose, and easy to read in a fast scroll.

- Each post is at most 280 characters. `preview_x_draft` validates this; longer
  posts are rejected before any network call.
- A single-post draft is a tweet. A multi-post draft is a thread: order posts so
  the thread reads top-to-bottom, lead with the takeaway, and let later posts add
  evidence or nuance.
- Keep drafts distinct: the three candidates should differ in angle, length, or
  tone — not just rearranged words.
- Cite the originating X post when its content anchors the draft. Link as
  `https://x.com/<handle>/status/<id>` and only use handles and ids returned by
  `scan_x_profiles`.
- Do not fabricate URLs, post ids, or quotes. Every citation must come from a
  tool result.

## Output discipline

The agent creates drafts only. It never schedules, publishes, or shares them.
Leave the drafts in `draft` status for a human to review in Typefully.
