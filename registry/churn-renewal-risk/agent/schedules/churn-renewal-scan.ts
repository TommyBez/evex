import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack";
import { churnRenewalConfig } from "../lib/renewal-config";

export const CHURN_RENEWAL_SCAN_PROMPT = `Run the weekly churn and renewal risk scan.

1. Call load_renewal_config. If it reports missingEnv or notConfigured, stop and report the missing configuration. Do not invent accounts, Stripe health, or Slack recipients.
2. Call scan_renewal_accounts. That tool is read-only. Never treat a scan as a CRM write.
3. Call load_stripe_health with the returned accounts. If health fail-closes, skip that account. Do not invent a Healthy score.
4. Call score_renewal_risk with the accounts and healthByAccountId. The durable cursor and audit log record scored buckets. Nothing is written to HubSpot or Salesforce.
5. If there are zero movers, report that and do not call deliver_renewal_digest or draft_save_play.
6. If there are movers, call preview_renewal_digest, then deliver_renewal_digest with confirmSend=true, the idempotencyKey returned by preview_renewal_digest, and the runDate returned by preview_renewal_digest. deliver_renewal_digest always pauses for Eve human approval before Slack. confirmSend is not a CRM write and is not a customer email. The date key must stop a retried cron from double-posting.
7. Do not call draft_save_play on the cron path. CRM notes wait for an explicit human-approved draft_save_play call with confirmWrite=true. Never email the customer. Never use SMTP. Never call messages.send, drafts.send, or sendMail.

Never claim a CRM note was written unless draft_save_play returned written=true. Never claim a customer was emailed. The Slack digest is not a customer email.`;

export default defineSchedule({
  cron: churnRenewalConfig.cron,
  async run({ to, waitUntil, appAuth }) {
    const channelId = churnRenewalConfig.slackChannelId;
    if (!channelId) {
      return;
    }

    waitUntil(
      to(slack, { channelId }).send(CHURN_RENEWAL_SCAN_PROMPT, {
        auth: appAuth,
      }),
    );
  },
});
