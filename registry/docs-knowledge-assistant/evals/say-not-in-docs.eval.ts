import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Says the docs do not cover a topic when documentation has no answer.",
  async test(t) {
    await t.send(`
<documentation_context>
path: README.md
content:
# Widget

Widget is a small UI kit. See docs/install.md for installation.
</documentation_context>

<path: docs/install.md>
content:
# Install

Run npm install @example/widget.
</documentation_context>

What is the on-call pager rotation for production incidents? Cite docs if present.
`);

    t.succeeded();
    t.check(
      /do not (have|cover|contain|include)|not (in|covered by) the docs|docs (do not|don't)|no documentation/i.test(
        t.reply ?? "",
      ),
      equals(true).gate(),
    );
    t.notCalledTool("submit_pr_review").gate();
    t.check(t.reply ?? "", includes("docs").soft());
  },
});
