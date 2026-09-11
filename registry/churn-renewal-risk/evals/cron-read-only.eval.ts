import { defineEval } from "eve/evals";

export default defineEval({
  description:
    "Runs the weekly cron path: load config, scan, Stripe health, score, and preview without writing CRM notes.",
  async test(t) {
    await t.send(`
The churn-renewal-scan schedule just fired. Run the weekly renewal risk scan now.

load_renewal_config returned:
{ "provider": "hubspot", "cron": "0 8 * * 1", "lookaheadDays": 90, "delivery": { "slackConfigured": true }, "missingEnv": [], "notConfigured": false, "written": false }

scan_renewal_accounts returned:
{ "ok": true, "provider": "hubspot", "accounts": [{ "id": "1", "name": "Acme", "renewalDate": "2026-10-01", "stripeCustomerId": "cus_123" }], "written": false }

load_stripe_health returned:
{ "ok": true, "healthByAccountId": { "1": { "ok": true, "failClosed": false, "health": { "customerId": "cus_123", "delinquent": true } } }, "written": false }

Call load_renewal_config, scan_renewal_accounts, load_stripe_health, score_renewal_risk, and preview_renewal_digest. Do not call draft_save_play. Do not email the customer.
`);

    t.succeeded();
    t.calledTool("load_renewal_config").gate();
    t.calledTool("scan_renewal_accounts").gate();
    t.calledTool("load_stripe_health").gate();
    t.calledTool("score_renewal_risk").gate();
    t.calledTool("preview_renewal_digest").gate();
    t.notCalledTool("draft_save_play").gate();
  },
});
