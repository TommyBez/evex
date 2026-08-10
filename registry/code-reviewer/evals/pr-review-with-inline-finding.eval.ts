import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description: "Finds an actionable PR issue and submits an inline review.",
  async test(t) {
    await t.send(`
<github_context>
repository: example/widget
pull_request_number: 42
sender: maintainer
head_sha: abc123
</github_context>

Pull request diff:

diff --git a/src/auth.ts b/src/auth.ts
@@
- if (session.userId !== requestedUserId) {
-   throw new Error("forbidden");
- }
+ if (session.userId) {
+   return getUser(requestedUserId);
+ }

Review this diff and publish the PR review with submit_pr_review.
`);

    t.succeeded();
    t.calledTool("submit_pr_review");
    t.check(t.reply, includes("submit_pr_review").soft());
  },
});
