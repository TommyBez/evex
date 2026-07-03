import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Calls get_weather before rendering a weather card and answers in OpenUI Lang only, with values taken from the deterministic tool output.",
  async test(t) {
    await t.send(
      "What's the weather in Tokyo right now? Render it as a weather card.",
    );

    t.succeeded();
    t.noFailedActions();
    t.calledTool("get_weather").gate();

    const reply = t.reply ?? "";
    t.check(reply.trimStart().startsWith("root ="), equals(true).gate());
    t.check(reply.includes("```"), equals(false).gate());
    t.check(reply, includes("22").soft());
    t.check(reply, includes("Clear Skies").soft());
  },
});
