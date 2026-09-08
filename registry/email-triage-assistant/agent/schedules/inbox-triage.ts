import { defineSchedule } from "eve/schedules";

import { emailTriageConfig } from "../lib/email-config";

export default defineSchedule({
  cron: emailTriageConfig.cron,
  markdown: `Run scheduled inbox triage.

1. Call load_inbox_config. If notConfigured is true, stop and report the missing environment variables. Do not invent threads, buckets, or drafts.
2. Call list_inbox_threads for the configured mailbox (Gmail, Outlook, or IMAP).
3. For each thread that needs a human reply, call read_thread.
4. Call sample_sent_style once and write every draft in that sent-folder voice.
5. Call apply_triage_bucket with one configured TRIAGE_BUCKETS slug and a short rationale.
6. Call create_draft_reply with intent draft. That tool writes Gmail drafts, Graph createReply drafts, or IMAP APPEND to Drafts and always returns sent false.
7. If Slack is configured and at least one draft was written, call notify_slack_drafts_ready with the draft count and buckets used.

Never send mail. Never use SMTP. Never call a send, sendMail, or drafts.send API. Never claim a message left Drafts.`,
});
