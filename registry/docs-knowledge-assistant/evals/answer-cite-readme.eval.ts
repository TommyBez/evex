import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Answers an install question from injected README content and cites README.md.",
  async test(t) {
    await t.send(`
<documentation_context>
path: README.md
content:
# Widget

Install the package with npm:

\`\`\`bash
npm install @example/widget
\`\`\`

Then import createWidget from @example/widget.
</documentation_context>

How do I install this project? Answer from the documentation and cite the file path.
`);

    t.succeeded();
    t.check(t.reply, includes("npm install").gate());
    t.check(t.reply, includes("README.md").gate());
    t.notCalledTool("open_docs_issue").soft();
    t.notCalledTool("submit_pr_review").gate();
    t.check(
      /README\.md/i.test(t.reply ?? ""),
      equals(true).gate(),
    );
  },
});
