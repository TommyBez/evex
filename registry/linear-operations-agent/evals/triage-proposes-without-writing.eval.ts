import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Triages an issue from provided Linear data as an evidence-backed proposal without applying any Linear writes.",
  async test(t) {
    await t.send(`
Triage this Linear issue.

The get_issue tool returned:

{
  "id": "a1b2c3d4-0000-4000-8000-000000000001",
  "identifier": "OPS-231",
  "title": "App crashes when opening settings",
  "description": "Since the last release, tapping Settings crashes the app on Android. Several users reported it in support. Stack trace attached in the first comment points to a null preferences store.",
  "state": { "name": "Triage" },
  "priority": 0,
  "labels": [],
  "assignee": null,
  "team": { "key": "OPS", "name": "Operations" }
}

The list_issues duplicate search for "settings crash Android" returned:

{ "issues": [] }

All the Linear data you need is provided above. Proceed according to your instructions: propose a triage outcome (type, priority, labels, next step) backed only by the evidence above, and ask for approval before any change. Do not call any Linear tools in this run, and do not apply the proposal with save_issue — a proposal is not an executed action.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("save_issue").gate();
    t.notCalledTool("linear__save_issue").gate();
    t.notCalledTool("save_project").gate();
    t.notCalledTool("linear__save_project").gate();
    t.check(t.reply, includes("OPS-231").gate());
    const replyLower = (t.reply ?? "").toLowerCase();
    t.check(replyLower, includes("propos").gate());
    t.check(replyLower, includes("approval").soft());
  },
});
