import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Clusters pasted feedback into themes and keeps an example quote.",
  async test(t) {
    await t.send(`
Exported Airtable rows:

1. "Checkout failed twice on mobile Safari after I tapped Pay."
2. "The pay button on iPhone Safari errors and I have to retry."
3. "Can you add a CSV export for invoices? I copy them by hand."
4. "Invoice CSV export would save me an hour every Friday."

Cluster this feedback into themes with example quotes. Do not write to Airtable.
`);

    t.succeeded();
    t.calledTool("draft_feedback_themes").gate();
    t.check(t.reply, includes("Safari").gate());
    t.check(
      /csv|invoice/i.test(t.reply ?? ""),
      equals(true).gate(),
    );
    t.check(
      /theme|cluster|group/i.test(t.reply ?? ""),
      equals(true).soft(),
    );
  },
});
