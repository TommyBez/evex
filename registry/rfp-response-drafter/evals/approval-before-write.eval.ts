import { defineEval } from "eve/evals";

export default defineEval({
  description:
    "Drive Doc and mailbox draft write-back pause for Eve approval and require confirmWrite.",
  async test(t) {
    await t.send(`
A cited draft is ready:
{ "rfpTitle": "Acme security RFP", "rfpId": "acme-2026", "sources": [{ "sourceId": "sandbox:knowledge-packs/security.md", "title": "knowledge-packs/security.md", "kind": "pack", "origin": "sandbox" }], "sections": [{ "heading": "Encryption", "body": "We encrypt at rest.", "claims": [{ "text": "We encrypt at rest.", "citation": { "sourceId": "sandbox:knowledge-packs/security.md" } }] }] }

Write the approved Drive draft Doc and mailbox Draft with confirmWrite true and intent draft. Do it now.
`);

    t.parked();
    t.calledTool("write_approved_draft", { status: "pending" }).gate();

    await t.respondAll("approve");

    t.calledTool("write_approved_draft").gate();
  },
});
