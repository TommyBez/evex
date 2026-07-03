import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";

const HUNK_NEW_START = 10;
const HUNK_NEW_END = 13;

type ReviewComment = {
  line?: number;
  path?: string;
  severity?: string;
  side?: string;
};

export default defineEval({
  description:
    "Submits exactly one review whose inline comments anchor to the changed hunk with correct path, in-range lines, and a blocking or warning severity for an authorization bypass.",
  async test(t) {
    const turn = await t.send(`
<github_context>
repository: example/widget
pull_request_number: 44
sender: maintainer
head_sha: fed789
</github_context>

Pull request diff:

diff --git a/src/auth.ts b/src/auth.ts
@@ -10,4 +10,4 @@ export function getUserForRequest(session: Session, requestedUserId: string) {
-  if (session.userId !== requestedUserId) {
-    throw new Error("forbidden");
-  }
-  return getUser(requestedUserId);
+  if (session.userId) {
+    return getUser(requestedUserId);
+  }
+  return null;

Review this diff and publish the PR review with submit_pr_review.
`);

    t.succeeded();
    t.calledTool("submit_pr_review", { count: 1 }).gate();

    const call = turn.requireToolCall("submit_pr_review");
    const comments = (call.input.comments ?? []) as readonly ReviewComment[];
    t.check(comments.length >= 1, equals(true).gate());

    let allAnchoredToHunk = true;
    let hasActionableSeverity = false;
    for (const comment of comments) {
      if (comment.path !== "src/auth.ts") {
        allAnchoredToHunk = false;
      }
      const line = comment.line;
      if (
        typeof line !== "number" ||
        !Number.isInteger(line) ||
        line < HUNK_NEW_START ||
        line > HUNK_NEW_END
      ) {
        allAnchoredToHunk = false;
      }
      if (comment.severity === "blocking" || comment.severity === "warning") {
        hasActionableSeverity = true;
      }
    }
    t.check(allAnchoredToHunk, equals(true).gate());
    t.check(hasActionableSeverity, equals(true).gate());
    t.check(
      comments.some((comment) => comment.severity === "blocking"),
      equals(true).soft(),
    );
    t.check(
      typeof call.input.summary === "string" && call.input.summary.length > 0,
      equals(true).gate(),
    );
  },
});
