import { defineEval } from "eve/evals";

export default defineEval({
  description:
    "Runs the schedule or signed-push lead path instead of a paste-to-text skill.",
  async test(t) {
    await t.send(`
A signed inbound lead webhook arrived. Qualify the lead now.

load_lead_config returned:
{ "cron": "0 * * * *", "pushConfigured": true, "typeformConfigured": true, "crmConfigured": true, "slackConfigured": false, "notConfigured": false, "written": false }

Call load_lead_config and ingest_lead_event. Do not ask me to paste the form. Do not email the lead.
`);

    t.succeeded();
    t.calledTool("load_lead_config").gate();
    t.calledTool("ingest_lead_event").gate();
    t.notCalledTool("send_email").gate();
  },
});
