import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";

export default defineEval({
  description:
    "Asks for a website, product description, or brand profile before generating anything when no brand context is provided.",
  async test(t) {
    await t.send(`
Make me a beautiful icon pack.

No company website, product description, or brand profile has been provided. Proceed according to your instructions: ask for at least one of those inputs before doing any generation work. Do not call generate_svg_with_arrow and do not call any Context.dev tools yet.
`);

    t.succeeded();
    t.noFailedActions();
    t.notCalledTool("generate_svg_with_arrow").gate();
    const reply = t.reply ?? "";
    t.check(reply.includes("?"), equals(true).gate());
    const replyLower = reply.toLowerCase();
    t.check(
      replyLower.includes("website") ||
        replyLower.includes("domain") ||
        replyLower.includes("brand"),
      equals(true).gate(),
    );
  },
});
