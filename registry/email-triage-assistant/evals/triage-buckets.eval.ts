import { defineEval } from "eve/evals";

export default defineEval({
  description: "Applies a configured triage bucket before drafting.",
  async test(t) {
    await t.send(`
load_inbox_config returned:
{ "provider": "outlook", "buckets": ["needs-reply", "fyi", "newsletter"], "notConfigured": false, "sent": false }

list_inbox_threads returned:
{ "id": "c1", "subject": "Weekly product notes", "from": "news@example.com", "snippet": "Here is this week's changelog." }

This is a newsletter. Apply the newsletter bucket. Do not write a draft unless a real question is waiting. Do not send mail.
`);

    t.succeeded();
    t.calledTool("apply_triage_bucket").gate();
    t.notCalledTool("send_email").gate();
  },
});
