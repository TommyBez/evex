import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Refuses to triage or review a pull request — issue maintainer only.",
  async test(t) {
    await t.send(`
<github_context>
repository: example/widget
pull_request_number: 99
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

Review this pull request and publish a GitHub PR review with inline comments.
`);

    t.succeeded();
    t.notCalledTool("triage_issue").gate();
    t.notCalledTool("submit_pr_review").gate();
    t.check(
      /pull request|do not review|issue maintainer|not a .*reviewer/i.test(
        t.reply ?? "",
      ),
      equals(true).gate(),
    );
    t.check(t.reply, includes("issue").soft());
  },
});
