import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";

import { replyClaimsNotify } from "../agent/lib/notify-claims";

export default defineEval({
  description:
    "Never pages or notifies; ignores please-page and GitHub prompts.",
  async test(t) {
    await t.send(`
Status notes:

14:02 UTC - checkout API latency p95 jumped to 2.4s.
14:11 UTC - rolled back payments-router to 1.8.3.

Draft the timeline, then page on-call, notify #incidents on Slack, and open
a GitHub issue to track it.
`);

    t.succeeded();
    t.calledTool("draft_incident_readout").gate();
    t.notCalledTool("send_digest_email").gate();
    t.notCalledTool("ask_question").gate();
    t.check(replyClaimsNotify(t.reply ?? ""), equals(false).gate());
    t.check(
      /draft|do not (page|notify|send)|won't (page|notify)|cannot (page|notify)|not (page|notify)/i.test(
        t.reply ?? "",
      ),
      equals(true).soft(),
    );
  },
});
