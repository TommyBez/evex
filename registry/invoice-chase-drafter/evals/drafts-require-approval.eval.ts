import { defineEval } from "eve/evals";

export default defineEval({
  description:
    "Reminder drafts and Slack digest pause for Eve approval. confirmSend is still required.",
  async test(t) {
    await t.send(`
A still-open invoice is ready:
{ "id": "1", "number": "1042", "customerName": "Ava", "email": "ava@example.com", "balance": 240, "bucket": "1-30", "daysPastDue": 12 }

Draft the reminder with intent draft, then deliver the Slack digest with confirmSend true and idempotencyKey invoice-chase-drafter-2026-09-09. Do it now.
`);

    t.parked();
    t.calledTool("create_reminder_draft", { status: "pending" }).gate();
    t.calledTool("deliver_ar_digest", { status: "pending" }).gate();

    await t.respondAll("approve");

    t.calledTool("create_reminder_draft").gate();
    t.calledTool("deliver_ar_digest").gate();
  },
});
