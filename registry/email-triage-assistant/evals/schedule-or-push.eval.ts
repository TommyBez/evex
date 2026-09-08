import { defineEval } from "eve/evals";

export default defineEval({
  description:
    "Runs the schedule or push mailbox path instead of a paste-to-text skill.",
  async test(t) {
    await t.send(`
A mailbox push notification arrived. Run inbox triage now.

load_inbox_config returned:
{ "provider": "imap", "cron": "0 */2 * * *", "buckets": ["needs-reply"], "slackConfigured": false, "pushConfigured": true, "notConfigured": false, "sent": false }

Call load_inbox_config, ingest_push_event, and list_inbox_threads. Do not ask me to paste the email. Do not send mail.
`);

    t.succeeded();
    t.calledTool("load_inbox_config").gate();
    t.calledTool("ingest_push_event").gate();
    t.calledTool("list_inbox_threads").gate();
    t.notCalledTool("send_email").gate();
  },
});
