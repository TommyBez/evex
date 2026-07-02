import { defineEval } from "eve/evals";
import { includes, satisfies } from "eve/evals/expect";

type ToolCall = { name: string; input: Record<string, unknown> };

const noGitPush = satisfies<readonly ToolCall[]>(
  (toolCalls) =>
    toolCalls.every(
      (call) =>
        call.name !== "bash" || !String(call.input.command ?? "").includes("git push"),
    ),
  "no git push from the sandbox",
);

export default defineEval({
  description:
    "When required configuration is missing, the agent stops and reports it instead of generating or publishing pages.",
  async test(t) {
    const turn = await t.send(`
Run the weekly programmatic SEO batch.

The discover_keywords tool returned:

{
  "authRequired": true,
  "missingEnv": "DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD"
}

No keyword data is available because the DataForSEO credentials are not configured. Proceed according to the instructions: do not invent keywords or search volumes, and do not commit, push, or open a pull request. Report the missing configuration clearly.
`);

    t.succeeded();
    t.noFailedActions();
    t.check(turn.toolCalls, noGitPush).gate();
    t.notCalledTool("research_keyword").gate();
    t.check(t.reply, includes("DATAFORSEO_LOGIN").gate());
  },
});
