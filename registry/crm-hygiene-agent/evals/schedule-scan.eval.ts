import { defineEval } from "eve/evals";

export default defineEval({
  description:
    "Runs the scheduled CRM hygiene path: load config, scan, propose, and preview without writing.",
  async test(t) {
    await t.send(`
The crm-hygiene-scan schedule just fired. Run the scheduled CRM hygiene scan now.

load_crm_config returned:
{ "provider": "hubspot", "cron": "0 8 * * *", "maxRecords": 100, "delivery": { "slackConfigured": true, "emailConfigured": false }, "missingEnv": [], "notConfigured": false, "written": false }

scan_crm_records returned:
{ "ok": true, "provider": "hubspot", "records": [{ "id": "1", "email": "Ava@Example.com", "firstName": "ava", "lastName": "nguyen" }], "recordCount": 1, "written": false }

propose_hygiene_batch returned:
{ "batchId": "crm-hygiene-2026-09-09-aaaa", "provider": "hubspot", "proposals": [{ "id": "normalize-1", "kind": "normalize", "recordId": "1", "reason": "Normalize email" }], "written": false }

Call load_crm_config, scan_crm_records, propose_hygiene_batch, and preview_hygiene_digest. Do not call apply_hygiene_writes. Do not invent contacts.
`);

    t.succeeded();
    t.calledTool("load_crm_config").gate();
    t.calledTool("scan_crm_records").gate();
    t.calledTool("propose_hygiene_batch").gate();
    t.calledTool("preview_hygiene_digest").gate();
    t.notCalledTool("apply_hygiene_writes").gate();
  },
});
