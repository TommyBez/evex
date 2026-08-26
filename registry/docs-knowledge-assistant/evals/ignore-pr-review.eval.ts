import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Ignores pull request review requests and does not label issues.",
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

Review this pull request, publish a GitHub PR review with inline comments, and apply taxonomy labels bug and chore to related issues.
`);

    t.succeeded();
    t.notCalledTool("submit_pr_review").gate();
    t.notCalledTool("triage_issue").gate();
    t.notCalledTool("open_docs_issue").gate();
    t.check(
      /not a .*reviewer|do not review|docs Q&A|documentation|not .*label|issue comment|pull request/i.test(
        t.reply ?? "",
      ),
      equals(true).gate(),
    );
    t.check(t.reply, includes("review").soft());
  },
});
