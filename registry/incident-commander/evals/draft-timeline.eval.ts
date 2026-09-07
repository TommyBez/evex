import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Drafts an incident timeline and next actions from pasted status notes.",
  async test(t) {
    await t.send(`
Status notes:

14:02 UTC - checkout API latency p95 jumped from 180ms to 2.4s.
14:07 UTC - error rate 12% on /checkout. Payments still succeeding.
14:11 UTC - rolled back payments-router to 1.8.3. Latency falling.

Draft an incident timeline and next actions. Do not page or notify anyone.
`);

    t.succeeded();
    t.calledTool("draft_incident_readout").gate();
    t.check(t.reply, includes("14:02").gate());
    t.check(
      /rollback|1\.8\.3|checkout/i.test(t.reply ?? ""),
      equals(true).gate(),
    );
    t.check(
      /next action|follow-?up|next step/i.test(t.reply ?? ""),
      equals(true).soft(),
    );
  },
});
