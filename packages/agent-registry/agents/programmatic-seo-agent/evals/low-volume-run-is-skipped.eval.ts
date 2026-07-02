import { defineEval } from "eve/evals";
import { satisfies } from "eve/evals/expect";

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
    "When every validated keyword falls below the minimum search volume, the agent skips the run instead of publishing thin pages.",
  async test(t) {
    const turn = await t.send(`
Run the weekly programmatic SEO batch.

The validate_keywords tool returned:

{
  "minSearchVolume": 30,
  "requestedCount": 3,
  "validatedCount": 3,
  "aboveThresholdCount": 0,
  "keywords": [
    { "keyword": "acme widgets for llamas", "searchVolume": 0, "cpc": null, "competition": null, "meetsMinVolume": false },
    { "keyword": "acme widgets for penguins", "searchVolume": 10, "cpc": null, "competition": null, "meetsMinVolume": false },
    { "keyword": "acme widgets for wizards", "searchVolume": 0, "cpc": null, "competition": null, "meetsMinVolume": false }
  ]
}

No candidate keyword meets the minimum search volume of 30. Proceed according to the instructions: do not force thin pages, and do not commit, push, or open a pull request. Report that this week's run is skipped and why.
`);

    t.succeeded();
    t.noFailedActions();
    t.check(turn.toolCalls, noGitPush).gate();
    t.notCalledTool("research_keyword").gate();
  },
});
