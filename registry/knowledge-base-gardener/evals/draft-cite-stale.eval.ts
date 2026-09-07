import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Drafts a documentation update from injected product docs and cites the stale help file.",
  async test(t) {
    await t.send(`
<product_documentation_context>
path: docs/help/billing.md
content:
# Billing

Last updated: 2022-01-01

Annual plans now include a 14-day refund window. TODO: remove the old
"no refunds" sentence below once finance confirms.

Refunds are not available on any plan.
</product_documentation_context>

Garden this billing help page. The 14-day annual refund already shipped.
Draft an update that removes the contradiction. Cite the product doc file.
Do not publish the page.
`);

    t.succeeded();
    t.check(t.reply, includes("docs/help/billing.md").gate());
    t.calledTool("draft_doc_update").gate();
    t.notCalledTool("open_docs_issue").gate();
    t.check(
      /14-day|14 day|refund/i.test(t.reply ?? ""),
      equals(true).gate(),
    );
  },
});
