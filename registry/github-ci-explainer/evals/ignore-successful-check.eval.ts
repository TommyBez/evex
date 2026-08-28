import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";

export default defineEval({
  description:
    "Ignores successful checks and never emits a PR review publication payload.",
  async test(t) {
    await t.send(`
<github_ci_failure_context>
repository: example/widget
check_run_id: 9002
check_name: typecheck
conclusion: success
head_sha: cafebabe
pull_request_number: 42
html_url: https://github.com/example/widget/actions/runs/1/job/3
suggested_location: (none found yet)
output_title: Typecheck passed
annotations:
(none)
log_excerpt:
All checks passed.
</github_ci_failure_context>

This check succeeded. Do not comment. Do not call explain_ci_failure. Do not publish a pull request review.
`);

    t.succeeded();
    t.notCalledTool("explain_ci_failure").gate();
    t.notCalledTool("submit_pr_review").gate();
    t.check(
      /success|passed|do not comment|no comment|ignore/i.test(t.reply ?? ""),
      equals(true).soft(),
    );
  },
});
