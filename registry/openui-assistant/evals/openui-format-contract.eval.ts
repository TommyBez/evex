import { defineEval } from "eve/evals";
import { equals, includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Answers a greeting with a pure OpenUI Lang welcome card: assigns root first, uses chat-library components, and emits no markdown fences, prose, or forbidden Stack component.",
  async test(t) {
    await t.send("Hi! What can you do?");

    t.succeeded();
    t.noFailedActions();

    const reply = t.reply ?? "";
    t.check(reply.trimStart().startsWith("root ="), equals(true).gate());
    t.check(reply.includes("```"), equals(false).gate());
    t.check(/\bStack\s*\(/.test(reply), equals(false).gate());
    t.check(reply, includes("Card").soft());
    t.check(reply, includes("FollowUp").soft());
  },
});
