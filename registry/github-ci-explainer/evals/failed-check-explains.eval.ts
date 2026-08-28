import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Explains a failed GitHub Actions check with what failed and file:line.",
  async test(t) {
    const turn = await t.send(`
<github_ci_failure_context>
repository: example/widget
check_run_id: 9001
check_name: typecheck
conclusion: failure
head_sha: deadbeef
pull_request_number: 42
html_url: https://github.com/example/widget/actions/runs/1/job/2
suggested_location: src/auth.ts:42
output_title: Typecheck failed
annotations:
- [failure] src/auth.ts:42 Type error: Property 'id' does not exist on type 'Session'.
log_excerpt:
src/auth.ts:42:5 - error TS2339: Property 'id' does not exist on type 'Session'.

42     return session.id;
           ~~

Found 1 error.
</github_ci_failure_context>

Explain this failed GitHub Actions check. Call explain_ci_failure exactly once with whatFailed, file/line when known, a short excerpt, and the full comment body. Do not publish a pull request review. Do not push a fix.
`);

    t.succeeded();
    t.calledTool("explain_ci_failure");
    const call = turn.requireToolCall("explain_ci_failure");

    t.check(typeof call.input.whatFailed === "string", equals(true).gate());
    t.check(call.input.file === "src/auth.ts", equals(true).gate());
    t.check(call.input.line === 42, equals(true).gate());
    t.check(
      typeof call.input.excerpt === "string" &&
        String(call.input.excerpt).length > 0,
      equals(true).gate(),
    );
    t.check(
      typeof call.input.comment === "string" &&
        /src\/auth\.ts:42/.test(String(call.input.comment)),
      equals(true).gate(),
    );
    t.notCalledTool("submit_pr_review").gate();
    t.check(t.reply, includes("explain_ci_failure").soft());
  },
});
