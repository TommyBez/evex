import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description: "Labels a clear bug report with the bug taxonomy label.",
  async test(t) {
    const turn = await t.send(`
<github_issue_context>
repository: example/widget
issue_number: 12
sender: reporter
title: Login crashes when session cookie is missing
existing_labels: (none)
thin_issue: no
body:
## Steps to reproduce
1. Clear cookies
2. Open /account
3. Click Save

## Expected
Redirect to login.

## Actual
Unhandled TypeError in session.ts:42.

## Environment
Node 24, Chrome 131, macOS 15.
</github_issue_context>

Triage this newly opened GitHub issue. Apply taxonomy labels with triage_issue.
`);

    t.succeeded();
    t.calledTool("triage_issue");
    const call = turn.requireToolCall("triage_issue");
    const labels = (call.input.labels ?? []) as readonly string[];
    t.check(labels.includes("bug"), equals(true).gate());
    t.check(call.input.requestRepro === false, equals(true).soft());
    t.check(t.reply, includes("triage_issue").soft());
  },
});
