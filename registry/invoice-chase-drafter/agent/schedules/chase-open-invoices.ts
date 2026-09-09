import { defineSchedule } from "eve/schedules";

import { invoiceChaseConfig } from "../lib/chase-config";

export default defineSchedule({
  cron: invoiceChaseConfig.cron,
  markdown: `Run the weekday AR chase.

1. Call load_chase_config. If it reports missingEnv or notConfigured, stop and report the missing configuration. Do not invent invoices, drafts, or Slack recipients.
2. Call list_open_invoices. That tool is read-only. It ages unpaid QuickBooks or Xero invoices into buckets. Never treat a list as a mailbox send.
3. Call recheck_paid_invoices with the returned invoices. Drop every row that is now paid. Do not draft or digest a paid invoice.
4. For each still-open overdue invoice that has a customer email, call create_reminder_draft with intent=draft. That tool pauses for Eve human approval, writes Gmail drafts.create or Graph Drafts only, and always returns sent=false. Never send mail. Never use SMTP. Never call messages.send, drafts.send, or sendMail.
5. Call preview_ar_digest with the still-open invoices, then deliver_ar_digest with confirmSend=true, the idempotencyKey returned by preview_ar_digest, and the runDate returned by preview_ar_digest. deliver_ar_digest always pauses for Eve human approval before Slack. The date key must stop a retried cron from double-posting.

Never claim a reminder left Drafts. Never claim Slack posted unless deliver_ar_digest returned sent=true.`,
});
