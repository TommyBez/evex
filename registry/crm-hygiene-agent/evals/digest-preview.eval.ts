import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Previews the hygiene digest without delivering or writing to the CRM.",
  async test(t) {
    await t.send(`
Use only these tool results.

propose_hygiene_batch returned:
{
  "batchId": "crm-hygiene-2026-09-09-aaaa",
  "provider": "hubspot",
  "scannedAt": "2026-09-09T08:00:00.000Z",
  "recordCount": 2,
  "proposals": [
    { "id": "dedupe-1", "kind": "dedupe", "recordId": "1", "mergeRecordId": "2", "before": {}, "after": {}, "reason": "Merge duplicate 2 into 1" }
  ],
  "written": false
}

Call preview_hygiene_digest for that batch. Do not call deliver_hygiene_digest or apply_hygiene_writes.
`);

    t.succeeded();
    t.calledTool("preview_hygiene_digest").gate();
    t.notCalledTool("deliver_hygiene_digest").gate();
    t.notCalledTool("apply_hygiene_writes").gate();
    t.check(t.reply, includes("dryRun").soft());
  },
});
