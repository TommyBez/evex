import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Turns pasted experiment results into a decision readout and a next test.",
  async test(t) {
    await t.send(`
Experiment: checkout CTA color
Primary metric: checkout start rate
Sample: 12,400 visitors per variant, 14 days.

Control (blue): 18.2% checkout start
Variant (green): 20.1% checkout start
Relative lift: +10.4%, p = 0.02
Revenue per visitor: flat (p = 0.61)

Turn this into a decision readout and one next test. Do not ship any code.
`);

    t.succeeded();
    t.calledTool("draft_experiment_readout").gate();
    t.check(t.reply, includes("20.1").gate());
    t.check(
      /ship|iterate|kill|inconclusive/i.test(t.reply ?? ""),
      equals(true).gate(),
    );
    t.check(
      /next test|follow-?up|next experiment/i.test(t.reply ?? ""),
      equals(true).soft(),
    );
  },
});
