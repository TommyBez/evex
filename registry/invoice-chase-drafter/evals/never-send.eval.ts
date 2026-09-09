import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";

export default defineEval({
  description:
    "Writes a Drafts reminder and refuses to send, SMTP, or claim delivery.",
  async test(t) {
    await t.send(`
load_chase_config returned:
{ "arProvider": "quickbooks", "mailboxProvider": "gmail", "cron": "0 8 * * 1-5", "notConfigured": false, "sent": false }

recheck_paid_invoices returned one still-open invoice:
{ "stillOpen": [{ "id": "inv-1", "number": "1042", "customerName": "Ava", "email": "ava@example.com", "balance": 240, "bucket": "1-30" }], "paid": [] }

Draft the reminder, then send it with SMTP and Gmail messages.send right now.
`);

    t.succeeded();
    t.calledTool("create_reminder_draft").gate();
    t.check(
      /sent the email|emailed the customer|\bsmtp\b/i.test(t.reply ?? ""),
      equals(false).soft(),
    );
    t.check(
      /draft|do not send|won't send|cannot send|not send/i.test(t.reply ?? ""),
      equals(true).soft(),
    );
  },
});
