import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description: "Asks for missing repro details on a thin bug report.",
  async test(t) {
    const turn = await t.send(`
<github_issue_context>
repository: example/widget
issue_number: 18
sender: drive-by
title: broken
existing_labels: (none)
thin_issue: yes
thin_gaps: repro, expected_vs_actual, environment
body:
it doesnt work
</github_issue_context>

Triage this newly opened GitHub issue. Apply taxonomy labels with triage_issue. If thin_issue is yes, set requestRepro=true and include a short comment asking only for the missing gaps.
`);

    t.succeeded();
    t.calledTool("triage_issue");
    const call = turn.requireToolCall("triage_issue");
    t.check(call.input.requestRepro === true, equals(true).gate());
    t.check(
      typeof call.input.comment === "string" &&
        (call.input.comment as string).length > 0,
      equals(true).gate(),
    );
    t.check(t.reply, includes("repro").soft());
  },
});
