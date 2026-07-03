import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Submits a no-findings review with an empty comments list for an innocuous PR diff.",
  async test(t) {
    const turn = await t.send(`
<github_context>
repository: example/widget
pull_request_number: 43
sender: maintainer
head_sha: def456
</github_context>

Pull request diff:

diff --git a/src/copy.ts b/src/copy.ts
@@
-export const emptyState = "No items";
+export const emptyState = "No matching items";

Review this diff and publish the PR review with submit_pr_review.
`);

    t.succeeded();
    t.calledTool("submit_pr_review");
    const call = turn.requireToolCall("submit_pr_review");
    const comments = (call.input.comments ?? []) as readonly unknown[];
    t.check(comments.length === 0, equals(true).gate());
    t.check(t.reply, includes("No actionable").soft());
  },
});
