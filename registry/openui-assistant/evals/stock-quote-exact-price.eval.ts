import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Calls get_stock_price for NVDA and renders the exact deterministic quote instead of inventing market numbers.",
  async test(t) {
    await t.send("Show me the current NVDA stock price as a market card.");

    t.succeeded();
    t.noFailedActions();
    t.calledTool("get_stock_price").gate();

    const reply = t.reply ?? "";
    t.check(reply.trimStart().startsWith("root ="), equals(true).gate());
    t.check(reply.includes("```"), equals(false).gate());
    t.check(reply, includes("875.28").gate());
  },
});
