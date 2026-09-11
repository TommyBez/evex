import { defineSchedule } from "eve/schedules";

import { rfpResponseConfig } from "../lib/rfp-config";

export default defineSchedule({
  cron: rfpResponseConfig.cron,
  markdown: `Run the optional RFP deadline and aging digest.

1. Call load_rfp_config. If it reports missingEnv or notConfigured, stop and report the missing configuration. Do not invent RFPs, drafts, or Slack recipients.
2. Call ingest_rfp_sources to list and export the configured Drive RFP and knowledge folders into /workspace. Then call load_open_rfps so preview has structured rows from those files or the persisted deadline store. Do this every run. load_rfp_config alone is not enough.
3. Call preview_deadline_digest with the rows from load_open_rfps. If that list is empty, stop. Do not invent due dates.
4. Call deliver_deadline_digest with confirmSend=true and the idempotencyKey returned by preview_deadline_digest. That tool pauses for Eve human approval before Slack and/or the Resend digest email. The date key is claimed atomically before the first send so overlapping crons do not double-post.

Never submit a portal response. Never paste a draft into a portal. Never send the RFP from a mailbox. Never claim the digest posted unless deliver_deadline_digest returned sent=true.`,
});
