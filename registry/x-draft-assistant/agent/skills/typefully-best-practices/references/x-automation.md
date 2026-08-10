# X Automation Compliance

X's automation rules govern anything posted through the Typefully API on behalf of
an account. The agent only creates drafts — it never publishes or schedules — but
the same rules govern the content that lands in the queue.

## Rules

### No duplicate content across drafts in the same run

Each of the three draft candidates must take a distinct angle on the same hot
topic. Reusing the same text across drafts risks an X duplicate-content flag and
reduces the value of offering the user three options.

### No unsolicited automated replies

Never set a reply target on a draft unless the user explicitly asked for a reply
to a specific post. The agent creates top-level posts only. Replying to
unrelated accounts is one of the fastest ways to get an account flagged.

### No trending manipulation

Do not stuff hashtags or pile onto a trending topic to game visibility. The
drafts react to a real signal from watched profiles, not to the trending tab. If
a topic is genuinely trending, write about it for its substance, not for the
trend.

### No fake engagement

The agent does not like, repost, follow, or reply. It only creates drafts. Do
not add engagement-style framing ("boost this", "retweet if you agree") to draft
text either.

### Label AI-drafted posts

X's content disclosure policy requires a "made with AI" label on posts generated
by an LLM. The agent drafts posts with a model, so every X post is created with
`made_with_ai: true` by default. `X_HOT_TOPIC_DRAFT_MADE_WITH_AI` controls the
flag and defaults to `true`.

Only disable the label (`X_HOT_TOPIC_DRAFT_MADE_WITH_AI=false`) if a human
rewrites the posts before publishing. Disabling it for AI-drafted content
violates X's content disclosure policy and risks account enforcement.

### Respect rate limits

The Typefully API rate-limits draft creation per user and per social set. One
run produces at most three drafts; do not loop create calls to retry a failed
draft in the same step. If a draft fails, surface the error in the output and let
the user retry on a later run.

## Priority order

When you cannot satisfy every rule, fix in this order:

1. Missing "made with AI" label on AI-drafted posts (policy violation, account
   enforcement risk).
2. Duplicate content across the three drafts in the same run.
3. Unsolicited reply target on a draft.
4. Hashtag stuffing or trending manipulation.
5. Engagement-bait framing in the post text.
6. Retrying a failed create in the same step.

## Authoring checklist

- [ ] `X_HOT_TOPIC_DRAFT_MADE_WITH_AI` is `true` (default) unless a human rewrites the posts before publishing
- [ ] Each of the three draft candidates has distinct text and a distinct angle
- [ ] No draft sets a reply target unless the user explicitly asked for a reply
- [ ] No hashtag stuffing, no engagement bait, no trending manipulation
- [ ] No retry loop on a failed `create_x_drafts` call inside one step

## Related

- [Exactly Once](./exactly-once.md) — idempotent draft creation and replay safety
