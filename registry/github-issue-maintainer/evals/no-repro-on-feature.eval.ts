import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";

export default defineEval({
  description:
    "Does not ask for repro details on a feature request that lacks bug-report fields.",
  async test(t) {
    const turn = await t.send(`
<github_issue_context>
repository: example/widget
issue_number: 22
sender: product
title: Add dark mode toggle
existing_labels: (none)
bug_like: no
thin_issue: no
body:
Please add a dark mode toggle in settings. I would love a system-preference default too.
</github_issue_context>

Triage this newly opened GitHub issue. Classify the taxonomy label first with triage_issue. Set requestRepro=true only when the primary label is bug and thin_issue is yes. Never ask for repro on feature, docs, question, or chore.
`);

    t.succeeded();
    t.calledTool("triage_issue");
    const call = turn.requireToolCall("triage_issue");
    const labels = (call.input.labels ?? []) as readonly string[];
    t.check(labels.includes("feature"), equals(true).gate());
    t.check(call.input.requestRepro === false, equals(true).gate());
  },
});
