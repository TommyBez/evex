import { defineSchedule } from "eve/schedules";

import { crmHygieneConfig } from "../lib/crm-config";

export default defineSchedule({
  cron: crmHygieneConfig.cron,
  markdown: `Run the scheduled CRM hygiene scan.

1. Call load_crm_config. If it reports missingEnv or notConfigured, stop and report the missing configuration. Do not invent contacts, proposals, or recipients.
2. Call scan_crm_records. That tool is read-only. Never treat a scan as a write.
3. Call propose_hygiene_batch with the returned provider and records. The batch is a proposal only. The audit log records proposed. Nothing is written to HubSpot, Salesforce, or Pipedrive.
4. If the batch has zero proposals, report that the CRM is clean and do not call deliver_hygiene_digest or apply_hygiene_writes.
5. If there are proposals, call preview_hygiene_digest, then deliver_hygiene_digest with confirmSend=true, the idempotencyKey returned by preview_hygiene_digest, and the runDate returned by preview_hygiene_digest. deliver_hygiene_digest always pauses for Eve human approval before Slack or Resend. confirmSend is not a CRM write and is not a substitute for apply_hygiene_writes approval.
6. Do not call apply_hygiene_writes on the cron path. Writes wait for an explicit human-approved apply_hygiene_writes call with confirmWrite=true. There is no auto-merge and no silent overwrite.

Never claim a CRM record was updated unless apply_hygiene_writes returned written=true.`,
});
