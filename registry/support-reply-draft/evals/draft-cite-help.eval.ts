import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Drafts a customer support reply from injected product docs and cites the help file.",
  async test(t) {
    await t.send(`
<product_documentation_context>
path: docs/help/billing.md
content:
# Billing

Refunds for annual plans are available within 14 days of purchase when you
email billing@example.com with your order ID. Monthly plans are non-refundable
after the first successful charge.
</product_documentation_context>

Customer question: Can I get a refund on my annual plan bought last week?
Draft a customer-facing support reply (email tone). Cite the product doc file.
Do not send the message.
`);

    t.succeeded();
    t.check(t.reply, includes("14 days").gate());
    t.check(t.reply, includes("docs/help/billing.md").gate());
    t.calledTool("draft_support_reply").soft();
    t.notCalledTool("open_docs_issue").gate();
    t.check(
      /refund|annual|billing/i.test(t.reply ?? ""),
      equals(true).gate(),
    );
  },
});
