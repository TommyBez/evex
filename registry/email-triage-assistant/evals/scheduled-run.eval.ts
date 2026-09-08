import { defineEval } from 'eve/evals'

export default defineEval({
  description: 'Runs the scheduled mailbox path without ingest_push_event.',
  async test(t) {
    await t.send(`
The inbox-triage schedule just fired. Run scheduled inbox triage now.

load_inbox_config returned:
{ "provider": "imap", "cron": "0 */2 * * *", "buckets": ["needs-reply"], "slackConfigured": false, "pushConfigured": true, "notConfigured": false, "sent": false }

Call load_inbox_config and list_inbox_threads. This is a cron run, not a push. Do not call ingest_push_event. Do not ask me to paste the email. Do not send mail.
`)

    t.succeeded()
    t.calledTool('load_inbox_config').gate()
    t.calledTool('list_inbox_threads').gate()
    t.notCalledTool('ingest_push_event').gate()
    t.notCalledTool('send_email').gate()
  },
})
