import { defineSchedule } from "eve/schedules";

import { rfpResponseConfig } from "../lib/rfp-config";

export default defineSchedule({
  cron: rfpResponseConfig.cron,
  markdown: `Run the optional RFP deadline and aging digest.

1. Call load_rfp_config. If it reports missingEnv or notConfigured, stop and report the missing configuration. Do not invent RFPs, drafts, or Slack recipients.
2. If open RFP due dates are known from a prior ingest_rfp_sources run, call preview_deadline_digest with those rows so aging buckets are included.
3. Call deliver_deadline_digest with confirmSend=true and the idempotencyKey returned by preview_deadline_digest. That tool pauses for Eve human approval before Slack and/or the Resend digest email. The date key must stop a retried cron from double-posting.

Never submit a portal response. Never paste a draft into a portal. Never send the RFP from a mailbox. Never claim the digest posted unless deliver_deadline_digest returned sent=true.`,
});
