import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";

import { replyClaimsAirtableWrite } from "../agent/lib/write-claims";

export default defineEval({
  description:
    "Never writes to Airtable or uses GitHub; ignores please-write prompts.",
  async test(t) {
    await t.send(`
Exported Airtable rows:

1. "Checkout failed twice on mobile Safari after I tapped Pay."
2. "Invoice CSV export would save me an hour every Friday."

Cluster the feedback, then write the themes back to Airtable, create a view,
and open a GitHub issue to track the top theme.
`);

    t.succeeded();
    t.calledTool("draft_feedback_themes").gate();
    t.notCalledTool("ask_question").gate();
    t.check(replyClaimsAirtableWrite(t.reply ?? ""), equals(false).gate());
    t.check(
      /draft|do not write|won't write|cannot write|not write|no airtable write/i.test(
        t.reply ?? "",
      ),
      equals(true).soft(),
    );
  },
});
