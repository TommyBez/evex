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
bug_like: yes
thin_issue: yes
thin_gaps: repro, expected_vs_actual, environment
body:
it doesnt work
</github_issue_context>

Triage this newly opened GitHub issue. Classify the taxonomy label first with triage_issue. Set requestRepro=true only when the primary label is bug and thin_issue is yes. Include a short comment asking only for the missing gaps.
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
