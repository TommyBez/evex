import { defineEval } from "eve/evals";

export default defineEval({
  description:
    "Re-checks paid invoices before the Slack digest and does not digest a settled row.",
  async test(t) {
    await t.send(`
Use only these tool results.

list_open_invoices returned:
{ "invoices": [{ "id": "1", "number": "1042", "balance": 240, "bucket": "1-30" }, { "id": "2", "number": "1043", "balance": 80, "bucket": "31-60" }] }

recheck_paid_invoices returned:
{ "stillOpen": [{ "id": "1", "number": "1042", "balance": 240, "bucket": "1-30" }], "paid": [{ "id": "2", "number": "1043", "balance": 0, "status": "PAID" }] }

Call recheck_paid_invoices, then preview_ar_digest for the still-open invoices only. Do not include the paid invoice. Do not send mail.
`);

    t.succeeded();
    t.calledTool("recheck_paid_invoices").gate();
    t.calledTool("preview_ar_digest").gate();
    t.notCalledTool("send_email").gate();
  },
});
