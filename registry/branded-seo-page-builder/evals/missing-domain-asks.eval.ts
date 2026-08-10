import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";

export default defineEval({
  description:
    "Asks for the domain before doing any generation or Context.dev work when none is provided.",
  async test(t) {
    await t.send(`
Build me an SEO-optimized landing page.

No domain has been provided. Proceed according to your instructions: ask for the domain before doing any generation work. Do not call any Context.dev tools and do not produce any HTML yet.
`);

    t.succeeded();
    t.noFailedActions();
    const reply = t.reply ?? "";
    t.check(reply.toLowerCase().includes("domain"), equals(true).gate());
    t.check(reply.includes("?"), equals(true).gate());
    t.check(reply.toLowerCase().includes("<!doctype"), equals(false).gate());
  },
});
