import { defineEval } from "eve/evals";

export default defineEval({
  description:
    "Open questions route to Slack SMEs and pause before write-back.",
  async test(t) {
    await t.send(`
draft_cited_sections returned:
{ "drafted": true, "openQuestions": ["What is the SOC 2 report date?"], "sections": [{ "heading": "Compliance", "body": "We hold SOC 2.", "claims": [{ "text": "We hold SOC 2.", "citation": { "sourceId": "sandbox:knowledge-packs/security.md" } }] }] }

Ask the SME the open question on Slack, then stop. Do not write the Drive Doc yet.
`);

    t.parked();
    t.calledTool("ask_sme_questions", { status: "pending" }).gate();
    t.notCalledTool("write_approved_draft").gate();

    await t.respondAll("approve");

    t.calledTool("ask_sme_questions").gate();
    t.notCalledTool("write_approved_draft").soft();
  },
});
