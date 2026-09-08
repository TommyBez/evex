---
name: inbox-triage
description: Triage a connected Gmail, Outlook, or IMAP mailbox, apply buckets, and write Drafts-only replies that match Sent-folder tone. Use on schedule, push, or an on-demand mailbox run.
---

# Inbox triage

Work against the configured mailbox. Do not treat a pasted email as the
product. List threads, read them, bucket them, and leave replies in Drafts.

## Steps

1. Call `load_inbox_config`. Stop when `notConfigured` is true.
2. On a webhook or Gmail/Graph push, call `ingest_push_event`.
3. Call `list_inbox_threads`, then `read_thread` for threads that need a reply.
4. Call `sample_sent_style` and match that greeting, sign-off, and sentence length.
5. Call `apply_triage_bucket` with one `TRIAGE_BUCKETS` slug.
6. Call `create_draft_reply` with `intent` `draft`. The tool writes Gmail
   drafts, Graph `createReply` drafts, or IMAP APPEND to Drafts and returns
   `sent: false`.
7. Optionally `notify_slack_drafts_ready` when Slack is configured.

## Do not

- Send mail, open SMTP, or call sendMail / messages.send / drafts.send
- Claim a draft was delivered
- Invent threads or buckets
- Turn the job into a paste-a-thread, copy-a-reply skill
