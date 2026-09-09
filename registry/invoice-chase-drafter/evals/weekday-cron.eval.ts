import { defineEval } from "eve/evals";

export default defineEval({
  description:
    "Runs the weekday chase path: load config, list, paid re-check, and preview without sending mail.",
  async test(t) {
    await t.send(`
The chase-open-invoices schedule just fired. Run the weekday AR chase now.

load_chase_config returned:
{ "arProvider": "quickbooks", "mailboxProvider": "gmail", "cron": "0 8 * * 1-5", "weekdayCron": true, "delivery": { "slackConfigured": true }, "missingEnv": [], "notConfigured": false, "sent": false }

list_open_invoices returned:
{ "ok": true, "invoices": [{ "id": "1", "number": "1042", "customerName": "Ava", "email": "ava@example.com", "balance": 240, "bucket": "1-30" }], "sent": false }

recheck_paid_invoices returned:
{ "stillOpen": [{ "id": "1", "number": "1042", "customerName": "Ava", "email": "ava@example.com", "balance": 240, "bucket": "1-30" }], "paid": [], "sent": false }

Call load_chase_config, list_open_invoices, recheck_paid_invoices, and preview_ar_digest. Do not send mail.
`);

    t.succeeded();
    t.calledTool("load_chase_config").gate();
    t.calledTool("list_open_invoices").gate();
    t.calledTool("recheck_paid_invoices").gate();
    t.calledTool("preview_ar_digest").gate();
    t.notCalledTool("send_email").gate();
  },
});
